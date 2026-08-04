import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCreditCard, lucidePhone, lucideLock } from '@ng-icons/lucide';
import { PaiementService } from '../../core/services/paiement.service';
import { LocataireService } from '../../core/services/locataire.service';
import { ImmeubleService } from '../../core/services/immeuble.service';
import { QuittancePdfService } from '../../core/services/quittance-pdf.service';

@Component({
  selector: 'app-portail-locataire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './portail-locataire.component.html',
  providers: [provideIcons({ lucideCheckCircle, lucideCreditCard, lucidePhone, lucideLock })]
})
export class PortailLocataireComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private paiementService = inject(PaiementService);
  private locataireService = inject(LocataireService);
  private immeubleService = inject(ImmeubleService);
  private pdfService = inject(QuittancePdfService);

  paiement = signal<any>(null);
  locataire = signal<any>(null);
  immeuble = this.immeubleService.immeuble;

  etape = signal<'saisie' | 'traitement' | 'succes'>('saisie');
  methodeSelectionnee = signal<'orange_money' | 'moov_money'>('orange_money');

  paiementForm = this.fb.nonNullable.group({
    telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    codePin: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        const p = this.paiementService.paiements().find(x => x.id === id);
        if (p) {
          this.paiement.set(p);
          const loc = this.locataireService.locataires().find(l => l.id === p.locataireId);
          this.locataire.set(loc);
        }
      }
    });
  }

  setMethode(methode: 'orange_money' | 'moov_money') {
    this.methodeSelectionnee.set(methode);
  }

  soumettrePaiement() {
    if (this.paiementForm.invalid || !this.paiement()) return;

    this.etape.set('traitement');

    // Simuler un temps de traitement réseau (2 secondes)
    setTimeout(() => {
      // 1. Mettre à jour le statut côté "serveur" (notre service)
      this.paiementService.modifierPaiement(this.paiement().id, {
        statut: 'paye',
        modePaiement: this.methodeSelectionnee(),
        reference: `TXN-${Math.floor(Math.random() * 1000000)}`,
        datePaiement: new Date()
      });

      // 2. Mettre à jour l'état local pour l'affichage du succès
      this.paiement.update(p => ({ ...p, statut: 'paye' }));
      this.etape.set('succes');
    }, 2000);
  }

  telechargerQuittance() {
    const p = this.paiement();
    if (!p) return;
    
    // Note: Pour une vraie app, on rappellerait l'API. Ici on simule avec PDF Service.
    this.pdfService.genererQuittance({
      periode: p.moisConcerne,
      datePaiement: new Date(),
      modePaiement: this.methodeSelectionnee(),
      reference: p.reference || 'TXN-0000',
      montant: p.montant,
      bailleur: {
        nom: this.immeuble().nomProprietaire || this.immeuble().nom || 'Le Propriétaire',
        adresse: this.immeuble().adresse || '',
        telephone: this.immeuble().telephone || ''
      },
      locataire: {
        nomComplet: this.locataire() ? `${this.locataire().prenom} ${this.locataire().nom}` : 'Locataire',
        telephone: this.locataire()?.telephone || '',
        appartement: `Apt concerné`
      }
    });
  }
}
