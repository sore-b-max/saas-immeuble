import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TDocumentDefinitions, Margins } from 'pdfmake/interfaces';
import { Immeuble } from '../models/immeuble.model';

@Injectable({
  providedIn: 'root'
})
export class ContratPdfService {

  private datePipe = new DatePipe('en-US');

  constructor() {}

  async genererContratBail(
    bail: any, 
    locataire: any, 
    appartement: any, 
    immeuble: Immeuble
  ) {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      
      const pdfMakeObj = (pdfMakeModule as any).default || pdfMakeModule;
      const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule;
      
      pdfMakeObj.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

      const nomBailleur = immeuble.nomProprietaire || immeuble.nom || 'Le Propriétaire';
      const montantLoyer = this.formatMontant(bail.montantLoyerBase);
      const montantCharges = this.formatMontant(bail.montantCharges);
      const totalMensuel = this.formatMontant(bail.montantLoyerBase + bail.montantCharges);
      const depotGarantie = this.formatMontant(bail.montantCaution);
      const dateDebut = this.formatDate(bail.dateDebut);
      const locataireNom = `${locataire.prenom} ${locataire.nom}`;

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60] as Margins,
        
        footer: (currentPage, pageCount) => {
          return {
            columns: [
              { text: `SaaS Immeuble - Contrat de Bail`, alignment: 'left', color: '#64748B', fontSize: 8, margin: [40, 20, 0, 0] },
              { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'right', color: '#64748B', fontSize: 8, margin: [0, 20, 40, 0] }
            ]
          };
        },

        content: [
          // En-tête
          { text: 'CONTRAT DE BAIL D\'HABITATION', fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000000' }], margin: [0, 0, 0, 20] },
          
          // Parties
          { text: 'ENTRE LES SOUSSIGNÉS :', fontSize: 12, bold: true, margin: [0, 0, 0, 10] },
          { text: `Le Bailleur : ${nomBailleur}\nAdresse : ${immeuble.adresse}, ${immeuble.ville}\nTéléphone : ${immeuble.telephone || 'Non renseigné'}\nCi-après désigné "Le Bailleur", d'une part.`, margin: [0, 0, 0, 15] },
          
          { text: 'ET :', fontSize: 12, bold: true, margin: [0, 0, 0, 10] },
          { text: `Le Locataire : ${locataireNom}\nNuméro CNI / Passeport : ${locataire.numeroPiece || 'Non renseigné'}\nTéléphone : ${locataire.telephone}\nEmail : ${locataire.email}\nCi-après désigné "Le Locataire", d'autre part.`, margin: [0, 0, 0, 20] },

          { text: 'IL A ÉTÉ CONVENU CE QUI SUIT :', fontSize: 12, bold: true, margin: [0, 0, 0, 10] },

          // Article 1
          { text: 'Article 1 - Désignation des locaux', bold: true, margin: [0, 10, 0, 5] },
          { text: `Le Bailleur donne en location au Locataire un appartement (N° ${appartement.numero}), situé à l'adresse suivante : ${immeuble.adresse}, au ${appartement.etage}e étage, comprenant ${appartement.nombrePieces} pièces pour une superficie d'environ ${appartement.superficie} m².`, margin: [0, 0, 0, 10], alignment: 'justify' },

          // Article 2
          { text: 'Article 2 - Durée du bail', bold: true, margin: [0, 10, 0, 5] },
          { text: `Le présent contrat est conclu pour une durée d'un (1) an, commençant le ${dateDebut}. Il se renouvellera par tacite reconduction pour la même durée, sauf congé donné par l'une des parties.`, margin: [0, 0, 0, 10], alignment: 'justify' },

          // Article 3
          { text: 'Article 3 - Loyer et Charges', bold: true, margin: [0, 10, 0, 5] },
          { text: `Le loyer mensuel de base est fixé à la somme de ${montantLoyer}. Les charges forfaitaires mensuelles s'élèvent à ${montantCharges}. Le loyer total mensuel (charges comprises) à payer par le locataire est donc de : ${totalMensuel}. Le loyer est payable d'avance le 5 de chaque mois.`, margin: [0, 0, 0, 10], alignment: 'justify' },

          // Article 4
          { text: 'Article 4 - Dépôt de garantie', bold: true, margin: [0, 10, 0, 5] },
          { text: `Pour garantir l'exécution de ses obligations, le Locataire verse ce jour au Bailleur un dépôt de garantie de ${depotGarantie}. Cette somme ne portera pas intérêts et sera restituée au Locataire en fin de bail, déduction faite des éventuelles sommes restant dues au Bailleur.`, margin: [0, 0, 0, 10], alignment: 'justify' },

          // Article 5
          { text: 'Article 5 - Obligations du Locataire', bold: true, margin: [0, 10, 0, 5] },
          {
            ul: [
              'Payer le loyer et les charges aux termes convenus.',
              'User paisiblement des locaux loués suivant la destination prévue.',
              'Répondre des dégradations et pertes qui surviennent pendant la durée du contrat.',
              'Ne pas sous-louer le bien sans l\'accord écrit du Bailleur.'
            ],
            margin: [0, 0, 0, 20]
          },

          // Signatures
          { text: `Fait à ${immeuble.ville}, le ${this.formatDate(new Date())}, en deux exemplaires originaux.`, margin: [0, 20, 0, 40] },
          
          {
            columns: [
              {
                width: '50%',
                text: 'Le Bailleur\n(Signature précédée de la mention "Lu et approuvé")',
                alignment: 'center',
                bold: true
              },
              {
                width: '50%',
                text: 'Le Locataire\n(Signature précédée de la mention "Lu et approuvé")',
                alignment: 'center',
                bold: true
              }
            ]
          }
        ],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 10,
          lineHeight: 1.2
        }
      };

      pdfMakeObj.createPdf(docDefinition).download(`Contrat_Bail_${locataireNom.replace(/ /g, '_')}.pdf`);
      
    } catch (error) {
      console.error("Erreur lors de la génération du contrat PDF", error);
    }
  }

  private formatMontant(montant: number): string {
    return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }

  private formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
}
