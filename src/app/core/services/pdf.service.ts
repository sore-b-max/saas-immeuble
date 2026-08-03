import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Paiement } from '../models/paiement.model';
import { Locataire } from '../models/locataire.model';
import { Appartement } from '../models/appartement.model';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  genererQuittance(paiement: Paiement, locataire?: Locataire, appartement?: Appartement) {
    // 1. Initialisation de jsPDF
    const doc = new jsPDF();
    const datePipe = new DatePipe('en-US');
    
    // 2. En-tête : Titre principal
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Bleu type SaaS
    doc.text('QUITTANCE DE LOYER', 105, 20, { align: 'center' });

    // 3. Période concernée
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const mois = paiement.moisConcerne;
    doc.text(`Période : ${mois}`, 105, 28, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // 4. Informations du Bailleur
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('BAILLEUR / GESTIONNAIRE :', 14, 45);
    doc.setFontSize(10);
    doc.text('Gestion SaaS Immeuble', 14, 52);
    doc.text('01 BP 1234 Ouagadougou 01', 14, 57);
    doc.text('Tél : +226 70 00 00 00', 14, 62);

    // 5. Informations du Locataire
    doc.setFontSize(11);
    doc.text('LOCATAIRE :', 120, 45);
    doc.setFontSize(10);
    if (locataire) {
      doc.text(`${locataire.prenom} ${locataire.nom}`, 120, 52);
      doc.text(`Tél : ${locataire.telephone}`, 120, 57);
      doc.text(`Appartement N° ${appartement?.numero || 'N/A'}`, 120, 62);
    } else {
      doc.text(`ID Locataire : ${paiement.locataireId}`, 120, 52);
    }

    doc.line(14, 70, 196, 70);

    // 6. Tableau des détails de la transaction (utilisation de jspdf-autotable)
    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Détails', 'Montant']],
      body: [
        ['Loyer mensuel', `Mois concerné : ${mois}`, `${paiement.montant} FCFA`],
        ['Date de paiement', paiement.datePaiement ? datePipe.transform(paiement.datePaiement, 'dd/MM/yyyy') : 'N/A', ''],
        ['Mode de paiement', paiement.modePaiement.replace('_', ' ').toUpperCase(), ''],
        ['Référence', paiement.reference || 'Aucune', '']
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // 7. Total réglé
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL RÉGLÉ : ${paiement.montant} FCFA`, 196, finalY + 15, { align: 'right' });

    // 8. Déclaration de réception (Texte de quittance)
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const nomLocataire = locataire ? `${locataire.prenom} ${locataire.nom}` : `le locataire`;
    const texteQuittance = `Je soussigné(e), le Propriétaire / Gestionnaire, déclare avoir reçu de la part de ${nomLocataire} la somme de ${paiement.montant} FCFA, au titre du loyer pour la période sus-désignée.`;
    const lines = doc.splitTextToSize(texteQuittance, 180);
    doc.text(lines, 14, finalY + 30);

    // 9. Signature
    doc.setFontSize(12);
    doc.text('Le Gestionnaire', 160, finalY + 50);
    doc.line(150, finalY + 70, 196, finalY + 70); // Ligne pour la signature physique

    // 10. Footer (Pied de page)
    doc.setFontSize(8);
    doc.text('Document généré par SaaS Immeuble', 105, 290, { align: 'center' });

    // 11. Sauvegarde et téléchargement du PDF
    doc.save(`Quittance_${mois}_Apt_${paiement.appartementId}.pdf`);
  }
}
