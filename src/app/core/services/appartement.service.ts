import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appartement } from '../models/appartement.model';
import { environment } from '../../../environments/environment';
import { Observable, of, tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppartementService {
  private http = inject(HttpClient);
  
  private appartementsState = signal<Appartement[]>([]);

  appartements = this.appartementsState.asReadonly();
  nombreTotal = computed(() => this.appartementsState().length);
  
  appartementsVacants = computed(() => 
    this.appartementsState().filter(apt => apt.statut === 'vacant').length
  );
  
  appartementsOccupes = computed(() => 
    this.appartementsState().filter(apt => apt.statut === 'occupe').length
  );

  chiffreAffairePotentiel = computed(() => 
    this.appartementsState().reduce((total, apt) => total + apt.loyer, 0)
  );

  private defaultMocks: Appartement[] = [
    { id: 1, numero: '101', superficie: 50, loyer: 150000, immeubleId: 1, statut: 'occupe', locataireId: 1, nombreOccupants: 2 },
    { id: 2, numero: '102', superficie: 65, loyer: 200000, immeubleId: 1, statut: 'occupe', locataireId: 2, nombreOccupants: 3 },
    { id: 3, numero: '201', superficie: 45, loyer: 130000, immeubleId: 1, statut: 'vacant', nombreOccupants: 0 },
    { id: 4, numero: '202', superficie: 80, loyer: 250000, immeubleId: 1, statut: 'en_travaux', nombreOccupants: 0 }
  ];

  fetchAppartements(): Observable<Appartement[]> {
    const current = this.appartementsState();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.appartementsState.set(this.defaultMocks);
        return of(this.defaultMocks);
      }
      return of(current);
    }

    return this.http.get<Appartement[]>(`${environment.apiUrl}/appartements`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.appartementsState.set(data);
        } else if (this.appartementsState().length === 0) {
          this.appartementsState.set(this.defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Backend indisponible, conservation des données d\'appartements locales.', err);
        if (this.appartementsState().length === 0) {
          this.appartementsState.set(this.defaultMocks);
        }
        return of(this.appartementsState());
      })
    );
  }

  ajouterAppartement(appartement: Omit<Appartement, 'id'>): Observable<Appartement> {
    if (environment.useMocks) {
      const nouvelApt = { ...appartement, id: Math.floor(Math.random() * 1000) + 10 } as Appartement;
      this.appartementsState.update(actuels => [nouvelApt, ...actuels]);
      return of(nouvelApt);
    }

    return this.http.post<Appartement>(`${environment.apiUrl}/appartements`, appartement).pipe(
      tap(created => this.appartementsState.update(actuels => [created, ...actuels])),
      catchError(err => {
        console.warn('Erreur création backend, mise à jour de l\'état local', err);
        const nouvelApt = { ...appartement, id: Date.now() } as Appartement;
        this.appartementsState.update(actuels => [nouvelApt, ...actuels]);
        return of(nouvelApt);
      })
    );
  }

  modifierAppartement(id: number, appartementModifie: Partial<Appartement>): Observable<Appartement> {
    if (environment.useMocks) {
      const mock = this.appartementsState().find(a => a.id === id);
      const updated = { ...mock, ...appartementModifie } as Appartement;
      this.appartementsState.update(actuels => actuels.map(apt => apt.id === id ? updated : apt));
      return of(updated);
    }

    return this.http.patch<Appartement>(`${environment.apiUrl}/appartements/${id}`, appartementModifie).pipe(
      tap(updated => this.appartementsState.update(actuels => actuels.map(apt => apt.id === id ? (updated || { ...apt, ...appartementModifie }) : apt))),
      catchError(err => {
        console.warn('Erreur modification backend, mise à jour de l\'état local', err);
        let updatedApt: Appartement = { id, ...appartementModifie } as Appartement;
        this.appartementsState.update(actuels => actuels.map(apt => {
          if (apt.id === id) {
            updatedApt = { ...apt, ...appartementModifie };
            return updatedApt;
          }
          return apt;
        }));
        return of(updatedApt);
      })
    );
  }
}
