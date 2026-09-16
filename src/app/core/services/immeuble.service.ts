import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Immeuble } from '../models/immeuble.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImmeubleService {
  private http = inject(HttpClient);

  private defaultMock: Immeuble = {
    id: 1,
    nom: 'Résidence Les Palmiers',
    adresse: 'Secteur 10, Ouaga 2000, Ouagadougou',
    ville: 'Ouagadougou',
    nombreEtages: 4,
    nombreAppartements: 20,
    proprietaireId: 1,
    nomProprietaire: 'Serge Ouedraogo',
    telephone: '+226 70 00 00 00',
    logoUrl: '',
    devise: 'FCFA',
    dateCreation: new Date('2025-01-01')
  };

  private immeubleState = signal<Immeuble>(this.defaultMock);
  public readonly immeuble = this.immeubleState.asReadonly();

  constructor() {
    this.fetchImmeuble().subscribe();
  }

  public fetchImmeuble(): Observable<Immeuble[] | Immeuble> {
    if (environment.useMocks) {
      this.immeubleState.set(this.defaultMock);
      return of([this.defaultMock]);
    }

    return this.http.get<Immeuble[]>(`${environment.apiUrl}/immeubles`).pipe(
      tap(immeubles => {
        if (immeubles && immeubles.length > 0) {
          this.immeubleState.set(immeubles[0]);
        } else {
          this.immeubleState.set(this.defaultMock);
        }
      }),
      catchError(err => {
        console.warn('Backend immeubles indisponible, utilisation des données locales', err);
        this.immeubleState.set(this.defaultMock);
        return of([this.defaultMock]);
      })
    );
  }

  public mettreAJourInfos(infos: Partial<Immeuble>): Observable<Immeuble> {
    const current = this.immeubleState();
    const updatedLocal = { ...current, ...infos } as Immeuble;

    if (environment.useMocks) {
      this.immeubleState.set(updatedLocal);
      return of(updatedLocal);
    }

    const request$ = (current && current.id)
      ? this.http.patch<Immeuble>(`${environment.apiUrl}/immeubles/${current.id}`, infos)
      : this.http.post<Immeuble>(`${environment.apiUrl}/immeubles`, infos);

    return request$.pipe(
      tap(res => this.immeubleState.set(res || updatedLocal)),
      catchError(err => {
        console.warn('Backend indisponible pour mise à jour immeuble, sauvegarde locale', err);
        this.immeubleState.set(updatedLocal);
        return of(updatedLocal);
      })
    );
  }

  public mettreAJourLogo(logoUrl: string): Observable<Immeuble> {
    return this.mettreAJourInfos({ logoUrl });
  }
}
