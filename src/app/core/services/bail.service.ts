import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bail } from '../models/bail.model';
import { AppartementService } from './appartement.service';
import { environment } from '../../../environments/environment';
import { Observable, of, tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BailService {
  private http = inject(HttpClient);
  private appartementService = inject(AppartementService);

  private bauxState = signal<Bail[]>([]);
  public baux = this.bauxState.asReadonly();
  public bauxActifs = computed(() => this.bauxState().filter(b => b.statut === 'actif'));
  public bauxResilies = computed(() => this.bauxState().filter(b => b.statut === 'resilie'));

  private defaultMocks: Bail[] = [
    {
      id: 1, locataireId: 1, appartementId: 1, dateDebut: '2025-01-01', dateFin: '2026-12-31',
      montantLoyerBase: 150000, montantCharges: 15000, montantCaution: 300000, statut: 'actif', dateCreation: new Date('2024-12-15')
    }
  ];

  fetchBaux(): Observable<Bail[]> {
    const current = this.bauxState();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.bauxState.set(this.defaultMocks);
        return of(this.defaultMocks);
      }
      return of(current);
    }
    
    return this.http.get<Bail[]>(`${environment.apiUrl}/baux`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.bauxState.set(data);
        } else if (this.bauxState().length === 0) {
          this.bauxState.set(this.defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Backend baux indisponible, conservation des données locales', err);
        if (this.bauxState().length === 0) {
          this.bauxState.set(this.defaultMocks);
        }
        return of(this.bauxState());
      })
    );
  }

  ajouterBail(bail: Omit<Bail, 'id' | 'dateCreation' | 'statut'>): Observable<Bail> {
    if (environment.useMocks) {
      const nouveauBail = {
        ...bail, id: Math.max(...this.bauxState().map(b => b.id), 0) + 1, statut: 'actif', dateCreation: new Date()
      } as Bail;
      this.bauxState.update(baux => [...baux, nouveauBail]);
      this.appartementService.modifierAppartement(bail.appartementId, { statut: 'occupe' }).subscribe();
      return of(nouveauBail);
    }

    return this.http.post<Bail>(`${environment.apiUrl}/baux`, bail).pipe(
      tap(created => {
        this.bauxState.update(baux => [...baux, created]);
        this.appartementService.modifierAppartement(bail.appartementId, { statut: 'occupe' }).subscribe();
      }),
      catchError(err => {
        console.warn('Backend baux indisponible pour création, mise à jour locale', err);
        const nouveauBail = { ...bail, id: Date.now(), statut: 'actif', dateCreation: new Date() } as Bail;
        this.bauxState.update(baux => [...baux, nouveauBail]);
        this.appartementService.modifierAppartement(bail.appartementId, { statut: 'occupe' }).subscribe();
        return of(nouveauBail);
      })
    );
  }

  resilierBail(id: number, dateFin: Date): Observable<Bail> {
    const dateStr = dateFin.toISOString().split('T')[0];

    if (environment.useMocks) {
      const bail = this.bauxState().find(b => b.id === id)!;
      const updated = { ...bail, statut: 'resilie', dateFin: dateStr } as Bail;
      this.bauxState.update(baux => baux.map(b => {
        if (b.id === id) {
          this.appartementService.modifierAppartement(b.appartementId, { statut: 'vacant' }).subscribe();
          return updated;
        }
        return b;
      }));
      return of(updated);
    }

    return this.http.patch<Bail>(`${environment.apiUrl}/baux/${id}`, { statut: 'resilie', dateFin: dateStr }).pipe(
      tap(updated => {
        this.bauxState.update(baux => baux.map(bail => {
          if (bail.id === id) {
            this.appartementService.modifierAppartement(bail.appartementId, { statut: 'vacant' }).subscribe();
            return updated || { ...bail, statut: 'resilie', dateFin: dateStr };
          }
          return bail;
        }));
      }),
      catchError(err => {
        console.warn('Backend baux indisponible pour résiliation, mise à jour locale', err);
        let updatedBail: Bail = { id, statut: 'resilie', dateFin: dateStr } as Bail;
        this.bauxState.update(baux => baux.map(bail => {
          if (bail.id === id) {
            updatedBail = { ...bail, statut: 'resilie', dateFin: dateStr };
            this.appartementService.modifierAppartement(bail.appartementId, { statut: 'vacant' }).subscribe();
            return updatedBail;
          }
          return bail;
        }));
        return of(updatedBail);
      })
    );
  }

  renouvelerBail(id: number): Observable<Bail> {
    const bail = this.bauxState().find(b => b.id === id);
    if (!bail || !bail.dateFin) return of(bail as Bail);

    const currentDateFin = new Date(bail.dateFin);
    currentDateFin.setFullYear(currentDateFin.getFullYear() + 1);
    const newDateFin = currentDateFin.toISOString().split('T')[0];

    if (environment.useMocks) {
      const updated = { ...bail, dateFin: newDateFin } as Bail;
      this.bauxState.update(baux => baux.map(b => b.id === id ? updated : b));
      return of(updated);
    }

    return this.http.patch<Bail>(`${environment.apiUrl}/baux/${id}`, { dateFin: newDateFin }).pipe(
      tap(updated => this.bauxState.update(baux => baux.map(b => b.id === id ? (updated || { ...b, dateFin: newDateFin }) : b))),
      catchError(err => {
        console.warn('Backend baux indisponible pour renouvellement, mise à jour locale', err);
        const updated = { ...bail, dateFin: newDateFin } as Bail;
        this.bauxState.update(baux => baux.map(b => b.id === id ? updated : b));
        return of(updated);
      })
    );
  }
}
