import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Charge, ChargeRepartition } from '../models/charge.model';
import { AppartementService } from './appartement.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  private http = inject(HttpClient);
  private appartementService = inject(AppartementService);

  private chargesState = signal<Charge[]>([]);
  public charges = this.chargesState.asReadonly();

  private defaultMocks: Charge[] = [
    {
      id: 1, immeubleId: 1, typeCharge: 'eau', montantTotal: 30000, periodeFacture: '2026-08',
      dateFacture: new Date('2026-08-01'), modeRepartition: 'egal',
      repartitions: [
        { appartementId: 1, montant: 15000, statut: 'paye' },
        { appartementId: 2, montant: 15000, statut: 'en_attente' }
      ]
    },
    {
      id: 2, immeubleId: 1, typeCharge: 'electricite', montantTotal: 50000, periodeFacture: '2026-08',
      dateFacture: new Date('2026-08-05'), modeRepartition: 'superficie',
      repartitions: [
        { appartementId: 1, montant: 21739, statut: 'en_attente' },
        { appartementId: 2, montant: 28261, statut: 'en_attente' }
      ]
    }
  ];

  public fetchCharges(): Observable<Charge[]> {
    const current = this.chargesState();

    if (environment.useMocks) {
      if (current.length === 0) {
        this.chargesState.set(this.defaultMocks);
        return of(this.defaultMocks);
      }
      return of(current);
    }

    return this.http.get<Charge[]>(`${environment.apiUrl}/charges`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.chargesState.set(data);
        } else if (this.chargesState().length === 0) {
          this.chargesState.set(this.defaultMocks);
        }
      }),
      catchError(err => {
        console.warn('Backend charges indisponible, conservation des données locales', err);
        if (this.chargesState().length === 0) {
          this.chargesState.set(this.defaultMocks);
        }
        return of(this.chargesState());
      })
    );
  }

  public ajouterCharge(charge: Omit<Charge, 'id' | 'repartitions'>): Observable<Charge> {
    const repartitions = this.calculerRepartition(charge.immeubleId, charge.montantTotal, charge.modeRepartition);
    
    if (environment.useMocks) {
      const nouvelleCharge = { ...charge, id: Math.floor(Math.random() * 1000) + 10, repartitions } as Charge;
      this.chargesState.update(actuels => [nouvelleCharge, ...actuels]);
      return of(nouvelleCharge);
    }

    const payload = { ...charge, repartitions };
    return this.http.post<Charge>(`${environment.apiUrl}/charges`, payload).pipe(
      tap(created => this.chargesState.update(actuels => [created, ...actuels])),
      catchError(err => {
        console.warn('Backend indisponible pour ajout de charge, mise à jour locale', err);
        const nouvelleCharge = { ...charge, id: Date.now(), repartitions } as Charge;
        this.chargesState.update(actuels => [nouvelleCharge, ...actuels]);
        return of(nouvelleCharge);
      })
    );
  }

  private calculerRepartition(immeubleId: number, montantTotal: number, mode: 'egal' | 'superficie' | 'occupants'): ChargeRepartition[] {
    const appartements = this.appartementService.appartements();
    
    // 1. Chercher les appartements occupés de l'immeuble
    let targetApparts = appartements.filter(a => Number(a.immeubleId) === Number(immeubleId) && a.statut === 'occupe');

    // 2. Fallback s'il n'y a pas de filtre strict immeubleId : prendre tous les appartements occupés
    if (targetApparts.length === 0) {
      targetApparts = appartements.filter(a => a.statut === 'occupe');
    }

    // 3. Si aucun appartement n'a le statut "occupé", prendre tous les appartements disponibles
    if (targetApparts.length === 0) {
      targetApparts = appartements;
    }

    if (targetApparts.length === 0) return [];

    let repartitions: ChargeRepartition[] = [];

    switch (mode) {
      case 'egal':
        const montantParApt = Math.round(montantTotal / targetApparts.length);
        repartitions = targetApparts.map(apt => ({ appartementId: apt.id, montant: montantParApt, statut: 'en_attente' }));
        break;
      case 'superficie':
        const superficieTotale = targetApparts.reduce((acc, apt) => acc + (apt.superficie || 0), 0);
        const valSuperficie = superficieTotale > 0 ? superficieTotale : targetApparts.length;
        repartitions = targetApparts.map(apt => ({
          appartementId: apt.id,
          montant: valSuperficie > 0 ? Math.round(((apt.superficie || 1) / valSuperficie) * montantTotal) : Math.round(montantTotal / targetApparts.length),
          statut: 'en_attente'
        }));
        break;
      case 'occupants':
        const totalOccupants = targetApparts.reduce((acc, apt) => acc + (apt.nombreOccupants || 0), 0);
        const valOccupants = totalOccupants > 0 ? totalOccupants : targetApparts.length;
        repartitions = targetApparts.map(apt => ({
          appartementId: apt.id,
          montant: valOccupants > 0 ? Math.round(((apt.nombreOccupants || 1) / valOccupants) * montantTotal) : Math.round(montantTotal / targetApparts.length),
          statut: 'en_attente'
        }));
        break;
    }

    const sommeCalculee = repartitions.reduce((acc, rep) => acc + rep.montant, 0);
    const difference = montantTotal - sommeCalculee;
    
    if (difference !== 0 && repartitions.length > 0) {
      repartitions[0].montant += difference;
    }
    return repartitions;
  }

  public marquerPaye(chargeId: number, appartementId: number): Observable<any> {
    // Mettre à jour l'état réactif local dans tous les cas
    this.chargesState.update(actuels => actuels.map(charge => {
      if (charge.id !== chargeId) return charge;
      const newRepartitions = charge.repartitions?.map(rep => rep.appartementId === appartementId ? { ...rep, statut: 'paye' as const } : rep);
      return { ...charge, repartitions: newRepartitions };
    }));

    if (environment.useMocks) {
      return of(null);
    }

    return this.http.patch(`${environment.apiUrl}/charges/${chargeId}/repartitions/${appartementId}`, { statut: 'paye' }).pipe(
      catchError(err => {
        console.warn('Backend indisponible pour marquer payé, mise à jour locale effectuée', err);
        return of(null);
      })
    );
  }
}
