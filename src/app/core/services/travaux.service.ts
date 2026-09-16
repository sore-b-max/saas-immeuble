import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Travaux } from '../models/travaux.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravauxService {
  private http = inject(HttpClient);
  
  private travauxState = signal<Travaux[]>([]);
  public readonly travaux = this.travauxState.asReadonly();

  public travauxEnCours = computed(() => this.travauxState().filter(t => t.statut === 'en_cours').length);
  public travauxSignales = computed(() => this.travauxState().filter(t => t.statut === 'signale').length);
  public depensesTotales = computed(() => 
    this.travauxState()
      .filter(t => t.statut === 'termine')
      .reduce((sum, current) => sum + current.cout, 0)
  );

  private defaultMocks: Travaux[] = [
    { id: 1, titre: 'Fuite robinet salle de bain', description: 'Le robinet de la baignoire goutte continuellement même fermé.', cout: 15000, appartementId: 1, dateSignalement: new Date('2026-08-01T10:30:00'), statut: 'signale' },
    { id: 2, titre: 'Changement serrure porte principale', description: 'La serrure accroche, nécessite un remplacement complet du barillet.', cout: 25000, appartementId: 2, dateSignalement: new Date('2026-07-28T14:15:00'), dateRealisation: new Date('2026-07-30T09:00:00'), statut: 'termine', photos: ['https://placehold.co/600x400/eeeeee/888888?text=Serrure+Remplacee'] },
    { id: 3, titre: 'Réparation climatisation', description: 'Le split ne refroidit plus la pièce, compresseur tourne dans le vide.', cout: 45000, appartementId: 3, dateSignalement: new Date('2026-08-02T08:00:00'), statut: 'en_cours' }
  ];

  public fetchTravaux(): Observable<Travaux[]> {
    const current = this.travauxState();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.travauxState.set(this.defaultMocks);
        return of(this.defaultMocks);
      }
      return of(current);
    }

    return this.http.get<Travaux[]>(`${environment.apiUrl}/travaux`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.travauxState.set(data);
        } else if (this.travauxState().length === 0) {
          this.travauxState.set(this.defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Backend travaux indisponible, conservation des données locales', err);
        if (this.travauxState().length === 0) {
          this.travauxState.set(this.defaultMocks);
        }
        return of(this.travauxState());
      })
    );
  }

  public ajouterTravail(travail: Omit<Travaux, 'id' | 'statut' | 'dateSignalement'>): Observable<Travaux> {
    if (environment.useMocks) {
      const nouveauTravail = { ...travail, id: this.travauxState().length > 0 ? Math.max(...this.travauxState().map(t => t.id)) + 1 : 1, statut: 'signale', dateSignalement: new Date() } as Travaux;
      this.travauxState.update(travaux => [nouveauTravail, ...travaux]);
      return of(nouveauTravail);
    }

    return this.http.post<Travaux>(`${environment.apiUrl}/travaux`, travail).pipe(
      tap(created => this.travauxState.update(travaux => [created, ...travaux])),
      catchError(err => {
        console.warn('Backend indisponible pour ajout travaux, mise à jour locale', err);
        const nouveauTravail = { ...travail, id: Date.now(), statut: 'signale', dateSignalement: new Date() } as Travaux;
        this.travauxState.update(travaux => [nouveauTravail, ...travaux]);
        return of(nouveauTravail);
      })
    );
  }

  public changerStatut(id: number, nouveauStatut: 'signale' | 'en_cours' | 'termine'): Observable<Travaux> {
    const updateLocalState = () => {
      let modified: Travaux | undefined;
      this.travauxState.update(travaux => travaux.map(t => {
        if (t.id === id) {
          modified = { ...t, statut: nouveauStatut };
          if (nouveauStatut === 'termine') modified.dateRealisation = new Date();
          return modified;
        }
        return t;
      }));
      return modified || ({ id, statut: nouveauStatut } as Travaux);
    };

    if (environment.useMocks) {
      return of(updateLocalState());
    }

    const payload: Partial<Travaux> = { statut: nouveauStatut };
    if (nouveauStatut === 'termine') payload.dateRealisation = new Date().toISOString().split('T')[0] as any as Date;
    
    return this.http.patch<Travaux>(`${environment.apiUrl}/travaux/${id}`, payload).pipe(
      tap(updated => this.travauxState.update(travaux => travaux.map(t => t.id === id ? (updated || { ...t, statut: nouveauStatut }) : t))),
      catchError(err => {
        console.warn('Backend indisponible pour changement statut travaux, mise à jour locale', err);
        return of(updateLocalState());
      })
    );
  }

  public ajouterPhoto(id: number, photoUrl: string): Observable<Travaux | null> {
    const updateLocalState = () => {
      let modified: Travaux | undefined;
      this.travauxState.update(travaux => travaux.map(t => {
        if (t.id === id) {
          modified = { ...t, photos: t.photos ? [...t.photos, photoUrl] : [photoUrl] };
          return modified;
        }
        return t;
      }));
      return modified || null;
    };

    if (environment.useMocks) {
      return of(updateLocalState());
    }

    const t = this.travauxState().find(tr => tr.id === id);
    if (!t) return of(null);
    const photos = t.photos ? [...t.photos, photoUrl] : [photoUrl];
    return this.http.patch<Travaux>(`${environment.apiUrl}/travaux/${id}`, { photos }).pipe(
      tap(updated => this.travauxState.update(travaux => travaux.map(tr => tr.id === id ? updated : tr))),
      catchError(err => {
        console.warn('Backend indisponible pour ajout photo, mise à jour locale', err);
        return of(updateLocalState());
      })
    );
  }

  public supprimerPhoto(id: number, index: number): Observable<Travaux | null> {
    const updateLocalState = () => {
      let modified: Travaux | undefined;
      this.travauxState.update(travaux => travaux.map(t => {
        if (t.id === id && t.photos) {
          const newPhotos = [...t.photos];
          newPhotos.splice(index, 1);
          modified = { ...t, photos: newPhotos };
          return modified;
        }
        return t;
      }));
      return modified || null;
    };

    if (environment.useMocks) {
      return of(updateLocalState());
    }

    const t = this.travauxState().find(tr => tr.id === id);
    if (!t || !t.photos) return of(null);
    const photos = [...t.photos];
    photos.splice(index, 1);
    return this.http.patch<Travaux>(`${environment.apiUrl}/travaux/${id}`, { photos }).pipe(
      tap(updated => this.travauxState.update(travaux => travaux.map(tr => tr.id === id ? updated : tr))),
      catchError(err => {
        console.warn('Backend indisponible pour suppression photo, mise à jour locale', err);
        return of(updateLocalState());
      })
    );
  }
}
