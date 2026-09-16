import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideLogOut, lucideFileText, lucideBanknote, 
  lucideWrench, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideDownload,
  lucideBuilding, lucideX, lucideSmartphone
} from '@ng-icons/lucide';
import { LocataireService } from '../../core/services/locataire.service';
import { BailService } from '../../core/services/bail.service';
import { PaiementService } from '../../core/services/paiement.service';
import { ChargeService } from '../../core/services/charge.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TravauxService } from '../../core/services/travaux.service';
import { LottiePlayerComponent } from '../../shared/components/lottie-player/lottie-player.component';

@Component({
  selector: 'app-espace-locataire',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIconComponent, LottiePlayerComponent],
  templateUrl: './espace-locataire.component.html',
  providers: [provideIcons({ 
    lucideLogOut, lucideFileText, lucideBanknote, 
    lucideWrench, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideDownload,
    lucideBuilding, lucideX, lucideSmartphone
  })]
})
export class EspaceLocataireComponent implements OnInit {
  private locataireService = inject(LocataireService);
  private bailService = inject(BailService);
  private paiementService = inject(PaiementService);
  private chargeService = inject(ChargeService);
  private travauxService = inject(TravauxService);
  public toastService = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isFetchingData = signal(true);

  // Données
  locataire = signal<any>(null);
  bail = signal<any>(null);
  paiements = signal<any[]>([]);
  chargesLocataire = signal<any[]>([]);
  
  // Computed Incidents à partir de TravauxService
  incidents = computed(() => {
    const apptId = this.bail()?.appartementId;
    if (!apptId) return [];
    return this.travauxService.travaux().filter(t => Number(t.appartementId) === Number(apptId));
  });
  
  // Onglet actif : 'bail' | 'factures' | 'incidents'
  activeTab = signal<'bail' | 'factures' | 'incidents'>('bail');

  // Modal de paiement
  showPaiementModal = signal(false);
  isSubmittingPaiement = signal(false);
  paiementEnCours = signal<any>(null);
  typePaiementEnCours = signal<'loyer' | 'charge'>('loyer');
  formPaiement = { telephone: '', operateur: 'orange_money' };

  // Modal Signaler Incident
  showIncidentModal = signal(false);
  isSubmittingIncident = signal(false);
  formIncident = { titre: '', description: '' };

  async ngOnInit() {
    try {
      this.isFetchingData.set(true);
      // Charger toutes les données nécessaires
      await Promise.all([
        this.locataireService.fetchLocataires(),
        this.bailService.fetchBaux(),
        this.paiementService.fetchPaiements(),
        this.chargeService.fetchCharges(),
        this.travauxService.fetchTravaux()
      ]);

      // 1. Récupérer le locataire correspondant à l'email connecté
      const userEmail = this.authService.userEmail();
      const locs = this.locataireService.locataires();
      const currentLocataire = locs.find(l => l.email === userEmail) || (locs.length > 0 ? locs[0] : null);

      if (currentLocataire) {
        this.locataire.set(currentLocataire);
        const locId = Number(currentLocataire.id);

        // 2. Récupérer son bail actif
        const baux = this.bailService.baux().filter(b => Number(b.locataireId) === locId);
        if (baux.length > 0) {
          const bailLoc = baux[0];
          this.bail.set(bailLoc);
          const apptId = Number(bailLoc.appartementId);

          // 3. Récupérer ses paiements (loyers)
          const locPaiements = this.paiementService.paiements().filter(p => Number(p.locataireId) === locId);
          this.paiements.set(locPaiements);

          // 4. Récupérer les charges liées à son appartement
          const toutesLesCharges = this.chargeService.charges();
          const chargesPourLocataire = toutesLesCharges.reduce((acc, charge) => {
            const repartitionLocataire = charge.repartitions?.find((r: any) => Number(r.appartementId) === apptId);
            
            if (repartitionLocataire) {
              acc.push({
                chargeId: charge.id,
                typeCharge: charge.typeCharge,
                periodeFacture: charge.periodeFacture,
                dateFacture: charge.dateFacture,
                montant: repartitionLocataire.montant,
                statut: repartitionLocataire.statut
              });
            }
            return acc;
          }, [] as any[]);
          this.chargesLocataire.set(chargesPourLocataire);
        }
      }
    } catch (e) {
      this.toastService.showError("Erreur lors du chargement des données");
    } finally {
      this.isFetchingData.set(false);
    }
  }

  setTab(tab: 'bail' | 'factures' | 'incidents') {
    this.activeTab.set(tab);
  }

  ouvrirModalPaiement(item: any, type: 'loyer' | 'charge') {
    this.paiementEnCours.set(item);
    this.typePaiementEnCours.set(type);
    this.formPaiement = { telephone: '', operateur: 'orange_money' };
    this.showPaiementModal.set(true);
  }

  fermerModalPaiement() {
    this.showPaiementModal.set(false);
    this.paiementEnCours.set(null);
  }

  async executerPaiement() {
    if (!this.formPaiement.telephone) {
      this.toastService.showError("Veuillez saisir un numéro de téléphone valide");
      return;
    }

    this.isSubmittingPaiement.set(true);
    try {
      // Simulation d'une API de Mobile Money
      await new Promise(r => setTimeout(r, 1500));
      
      const item = this.paiementEnCours();
      const type = this.typePaiementEnCours();

      if (type === 'loyer') {
        // Formater la date en YYYY-MM-DD pour que Spring Boot (LocalDate) l'accepte
        const dateFormatted = new Date().toISOString().split('T')[0] as any as Date;
        // Appeler le service pour marquer payé
        await this.paiementService.modifierPaiement(item.id, { statut: 'paye', datePaiement: dateFormatted });
      } else if (type === 'charge') {
        const bailLoc = this.bail();
        if (bailLoc) {
          await this.chargeService.marquerPaye(item.chargeId, bailLoc.appartementId);
        }
      }

      // Recharger les données pour refléter les modifications
      await Promise.all([
        this.paiementService.fetchPaiements(),
        this.chargeService.fetchCharges()
      ]);
      this.ngOnInit(); // Refresh state

      this.toastService.showSuccess("Paiement validé avec succès !");
      this.fermerModalPaiement();
    } catch (e) {
      this.toastService.showError("Le paiement a échoué");
    } finally {
      this.isSubmittingPaiement.set(false);
    }
  }

  ouvrirModalIncident() {
    this.formIncident = { titre: '', description: '' };
    this.showIncidentModal.set(true);
  }

  fermerModalIncident() {
    this.showIncidentModal.set(false);
  }

  async soumettreIncident() {
    if (!this.formIncident.titre.trim() || !this.formIncident.description.trim()) {
      this.toastService.showError("Veuillez remplir tous les champs");
      return;
    }

    const apptId = this.bail()?.appartementId;
    if (!apptId) {
      this.toastService.showError("Aucun appartement lié à ce locataire");
      return;
    }

    this.isSubmittingIncident.set(true);
    try {
      await this.travauxService.ajouterTravail({
        titre: this.formIncident.titre,
        description: this.formIncident.description,
        cout: 0,
        appartementId: apptId
      });
      
      this.toastService.showSuccess("Incident signalé avec succès !");
      this.fermerModalIncident();
    } catch (e) {
      this.toastService.showError("Erreur lors du signalement");
    } finally {
      this.isSubmittingIncident.set(false);
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  telechargerQuittance(paiement: any) {
    this.toastService.showSuccess(`Préparation du reçu pour le mois ${paiement.moisConcerne}...`);
    
    const datePaiement = paiement.datePaiement ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR') : 'Non définie';
    
    // Ouvrir une nouvelle fenêtre pour l'impression PDF
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.toastService.showError("Veuillez autoriser les fenêtres pop-up pour télécharger la quittance.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quittance_${paiement.moisConcerne}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; margin: 0; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #2563eb; margin: 0; font-size: 32px; font-weight: 800; }
            .header h2 { color: #64748b; margin: 8px 0 0; font-size: 16px; letter-spacing: 3px; font-weight: 700; }
            .divider { border-bottom: 2px solid #e2e8f0; margin: 25px 0; }
            .content { display: flex; justify-content: space-between; margin-top: 40px; align-items: flex-start; }
            .info { width: 60%; line-height: 2; font-size: 15px; }
            .info h3 { margin-top: 0; color: #334155; font-size: 18px; margin-bottom: 15px; }
            .info strong { color: #475569; display: inline-block; width: 140px; }
            .amount { width: 35%; text-align: right; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .amount .label { color: #64748b; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .amount .value { font-size: 26px; font-weight: 900; color: #0f172a; margin-top: 8px; }
            .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 80px; font-style: italic; }
            .status-paye { color: #16a34a; font-weight: 800; background: #dcfce7; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ImmoSaaS</h1>
            <h2>QUITTANCE DE LOYER</h2>
          </div>
          
          <div class="divider"></div>
          
          <div class="content">
            <div class="info">
              <h3>Détails du paiement</h3>
              <div><strong>Mois concerné :</strong> ${paiement.moisConcerne}</div>
              <div><strong>Date de paiement :</strong> ${datePaiement}</div>
              <div><strong>Statut :</strong> <span class="status-paye">PAYÉ</span></div>
              <div><strong>Référence :</strong> ${paiement.reference || 'N/A'}</div>
            </div>
            
            <div class="amount">
              <div class="label">Montant réglé</div>
              <div class="value">${paiement.montant} <span style="font-size: 16px; color: #64748b;">FCFA</span></div>
            </div>
          </div>
          
          <div class="divider" style="margin-top: 60px;"></div>
          
          <div class="footer">
            Document généré informatiquement par ImmoSaaS - Gestion immobilière simplifiée.<br>
            Ce document tient lieu de quittance sous réserve d'encaissement effectif.
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // window.close(); // Garder ouvert pour permettre à l'utilisateur de sauvegarder calmement
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
