import { Injectable, signal, computed } from '@angular/core';
import { Appartement } from '../models/appartement.model';

@Injectable({
  providedIn: 'root'
})
export class AppartementService {
  
  // 1. Les données brutes (Le Signal principal)
  private appartementsState = signal<Appartement[]>([
    { id: 1, numero: '101', superficie: 50, loyer: 150000, immeubleId: 1, statut: 'occupe', locataireId: 1 },
    { id: 2, numero: '102', superficie: 65, loyer: 200000, immeubleId: 1, statut: 'occupe', locataireId: 2 },
    { id: 3, numero: '201', superficie: 45, loyer: 130000, immeubleId: 1, statut: 'vacant' },
    { id: 4, numero: '202', superficie: 80, loyer: 250000, immeubleId: 1, statut: 'en_travaux' }
  ]);

  // 2. Ce qu'on expose publiquement (en lecture seule)
  appartements = this.appartementsState.asReadonly();

  // 3. Les signaux calculés (computed)
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

  ajouterAppartement(appartement: Omit<Appartement, 'id'>) {
    const nouvelApt: Appartement = {
      ...appartement,
      id: Math.floor(Math.random() * 1000) + 10 // ID généré aléatoirement pour la démo
    };
    this.appartementsState.update(actuels => [nouvelApt, ...actuels]);
  }

  modifierAppartement(id: number, appartementModifie: Partial<Appartement>) {
    this.appartementsState.update(actuels => 
      actuels.map(apt => 
        apt.id === id ? { ...apt, ...appartementModifie } : apt
      )
    );
  }
}
