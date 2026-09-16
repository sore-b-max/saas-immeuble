import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Paiement } from '../models/paiement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private http = inject(HttpClient);
  
  private paiementsState = signal<Paiement[]>([]);
  public paiements = this.paiementsState.asReadonly();

  montantTotalEncaisse = computed(() => 
    this.paiementsState()
      .filter(p => p.statut === 'paye')
      .reduce((total, p) => total + p.montant, 0)
  );

  montantEnRetard = computed(() => 
    this.paiementsState()
      .filter(p => p.statut === 'en_retard' || p.statut === 'impaye')
      .reduce((total, p) => total + p.montant, 0)
  );

  nombrePaiementsPayes = computed(() => 
    this.paiementsState().filter(p => p.statut === 'paye').length
  );
  
  nombrePaiementsRetard = computed(() => 
    this.paiementsState().filter(p => p.statut === 'en_retard').length
  );

  private defaultMocks: Paiement[] = [
    { id: 1, appartementId: 1, locataireId: 1, montant: 150000, moisConcerne: '2026-08', datePaiement: new Date('2026-08-01'), modePaiement: 'orange_money', statut: 'paye', reference: 'OM-123456' },
    { id: 2, appartementId: 2, locataireId: 2, montant: 200000, moisConcerne: '2026-08', datePaiement: new Date('2026-08-02'), modePaiement: 'moov_money', statut: 'paye', reference: 'MM-987654' },
    { id: 3, appartementId: 3, locataireId: 3, montant: 130000, moisConcerne: '2026-08', modePaiement: 'especes', statut: 'en_retard' },
    { id: 4, appartementId: 4, locataireId: 4, montant: 250000, moisConcerne: '2026-08', modePaiement: 'virement', statut: 'en_attente' }
  ];

  public fetchPaiements(): Observable<Paiement[]> {
    const current = this.paiementsState();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.paiementsState.set(this.defaultMocks);
        return of(this.defaultMocks);
      }
      return of(current);
    }

    return this.http.get<Paiement[]>(`${environment.apiUrl}/paiements`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.paiementsState.set(data);
        } else if (this.paiementsState().length === 0) {
          this.paiementsState.set(this.defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Backend paiements indisponible, conservation des données locales', err);
        if (this.paiementsState().length === 0) {
          this.paiementsState.set(this.defaultMocks);
        }
        return of(this.paiementsState());
      })
    );
  }

  public ajouterPaiement(paiement: Omit<Paiement, 'id'>): Observable<Paiement> {
    if (environment.useMocks) {
      const nouveauPaiement = { ...paiement, id: Math.floor(Math.random() * 1000) + 10 } as Paiement;
      this.paiementsState.update(actuels => [nouveauPaiement, ...actuels]);
      return of(nouveauPaiement);
    }

    return this.http.post<Paiement>(`${environment.apiUrl}/paiements`, paiement).pipe(
      tap(created => this.paiementsState.update(actuels => [created, ...actuels])),
      catchError(err => {
        console.warn('Backend indisponible pour ajout de paiement, mise à jour de l\'état local', err);
        const nouveauPaiement = { ...paiement, id: Date.now() } as Paiement;
        this.paiementsState.update(actuels => [nouveauPaiement, ...actuels]);
        return of(nouveauPaiement);
      })
    );
  }

  public modifierPaiement(id: number, paiementModifie: Partial<Paiement>): Observable<Paiement> {
    if (environment.useMocks) {
      const p = this.paiementsState().find(item => item.id === id);
      const updated = { ...p, ...paiementModifie } as Paiement;
      this.paiementsState.update(actuels => actuels.map(item => item.id === id ? updated : item));
      return of(updated);
    }

    return this.http.patch<Paiement>(`${environment.apiUrl}/paiements/${id}`, paiementModifie).pipe(
      tap(updated => this.paiementsState.update(actuels => actuels.map(item => item.id === id ? (updated || { ...item, ...paiementModifie }) : item))),
      catchError(err => {
        console.warn('Backend indisponible pour modification de paiement, mise à jour de l\'état local', err);
        let updatedPaiement: Paiement = { id, ...paiementModifie } as Paiement;
        this.paiementsState.update(actuels => actuels.map(item => {
          if (item.id === id) {
            updatedPaiement = { ...item, ...paiementModifie };
            return updatedPaiement;
          }
          return item;
        }));
        return of(updatedPaiement);
      })
    );
  }
}
