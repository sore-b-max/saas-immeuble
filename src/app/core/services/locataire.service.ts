import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Locataire } from '../models/locataire.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocataireService {
  private http = inject(HttpClient);
  
  private locatairesSignal = signal<Locataire[]>([]);
  public locataires = this.locatairesSignal.asReadonly();

  public locatairesActifs = computed(() => 
    this.locatairesSignal().filter(loc => loc.estActif)
  );

  public locatairesInactifs = computed(() => 
    this.locatairesSignal().filter(loc => !loc.estActif)
  );

  public nombreTotal = computed(() => this.locatairesSignal().length);

  constructor() {
    effect(() => {
      console.log(`[LocataireService] Changement détecté ! Il y a maintenant ${this.nombreTotal()} locataires.`);
    });
  }

  public fetchLocataires(): Observable<Locataire[]> {
    const defaultMocks: Locataire[] = [
      {
        id: 1, nom: 'Koné', prenom: 'Mamadou', telephone: '0102030405', email: 'locataire@saas.com',
        numeroCNI: 'B1478523', appartementId: 19, dateEntree: new Date('2026-06-10'), estActif: true
      }
    ];

    const current = this.locatairesSignal();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.locatairesSignal.set(defaultMocks);
        return of(defaultMocks);
      }
      return of(current);
    }

    return this.http.get<Locataire[]>(`${environment.apiUrl}/locataires`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.locatairesSignal.set(data);
        } else if (this.locatairesSignal().length === 0) {
          this.locatairesSignal.set(defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Impossible de joindre le backend locataires, conservation des données locales', err);
        if (this.locatairesSignal().length === 0) {
          this.locatairesSignal.set(defaultMocks);
        }
        return of(this.locatairesSignal());
      })
    );
  }

  public ajouterLocataire(nouveauLocataire: Omit<Locataire, 'id'>): Observable<Locataire> {
    if (environment.useMocks) {
      const created = { ...nouveauLocataire, id: this.nombreTotal() + 1 } as Locataire;
      this.locatairesSignal.update(locs => [...locs, created]);
      return of(created);
    }

    return this.http.post<Locataire>(`${environment.apiUrl}/locataires`, nouveauLocataire).pipe(
      tap(created => this.locatairesSignal.update(locs => [...locs, created])),
      catchError(err => {
        console.warn('Backend indisponible pour la création, mise à jour de l\'état local', err);
        const created = { ...nouveauLocataire, id: Date.now() } as Locataire;
        this.locatairesSignal.update(locs => [...locs, created]);
        return of(created);
      })
    );
  }

  public archiverLocataire(id: number): Observable<Locataire> {
    if (environment.useMocks) {
      const loc = this.locatairesSignal().find(l => l.id === id);
      const updated = loc ? { ...loc, estActif: false } : { id, estActif: false } as Locataire;
      this.locatairesSignal.update(locs => locs.map(l => l.id === id ? updated : l));
      return of(updated);
    }

    return this.http.patch<Locataire>(`${environment.apiUrl}/locataires/${id}`, { estActif: false }).pipe(
      tap(updated => this.locatairesSignal.update(locs => locs.map(l => l.id === id ? updated : l))),
      catchError(err => {
        console.warn('Backend indisponible pour l\'archivage, mise à jour de l\'état local', err);
        let updatedLoc: Locataire = { id, estActif: false } as Locataire;
        this.locatairesSignal.update(locs => locs.map(l => {
          if (l.id === id) {
            updatedLoc = { ...l, estActif: false };
            return updatedLoc;
          }
          return l;
        }));
        return of(updatedLoc);
      })
    );
  }

  public modifierLocataire(id: number, locataireModifie: Partial<Locataire>): Observable<Locataire> {
    if (environment.useMocks) {
      const loc = this.locatairesSignal().find(l => l.id === id);
      const updated = { ...loc, ...locataireModifie } as Locataire;
      this.locatairesSignal.update(locs => locs.map(l => l.id === id ? updated : l));
      return of(updated);
    }

    return this.http.patch<Locataire>(`${environment.apiUrl}/locataires/${id}`, locataireModifie).pipe(
      tap(updated => this.locatairesSignal.update(locs => locs.map(l => l.id === id ? (updated || { ...l, ...locataireModifie }) : l))),
      catchError(err => {
        console.warn('Avertissement modification backend, mise à jour directe de l\'état local', err);
        let updatedLoc: Locataire = { id, ...locataireModifie } as Locataire;
        this.locatairesSignal.update(locs => locs.map(l => {
          if (l.id === id) {
            updatedLoc = { ...l, ...locataireModifie };
            return updatedLoc;
          }
          return l;
        }));
        return of(updatedLoc);
      })
    );
  }
}
