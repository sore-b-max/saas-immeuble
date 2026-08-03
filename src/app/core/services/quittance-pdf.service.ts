import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { QuittanceData } from '../models/quittance.model';

// Initialisation de pdfmake avec les polices virtuelles (vfs)
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class QuittancePdfService {

  // Couleurs de la charte graphique
  private readonly COLOR_PRIMARY = '#1E293B'; // Bleu nuit (texte structure)
  private readonly COLOR_ACCENT = '#2563EB';  // Bleu accent (marque, titres)
  private readonly COLOR_TEXT_MUTED = '#64748B'; // Gris (métadonnées)
  private readonly COLOR_BORDER = '#E2E8F0';

  constructor(private datePipe: DatePipe) {}

  genererQuittance(data: QuittanceData) {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      // En-tête de page (vide, l'en-tête du doc est dans le corps)
      header: undefined,

      // Pied de page dynamique
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            {
              text: 'Document généré par SaaS Immeuble - Logiciel de gestion locative',
              alignment: 'left',
              color: this.COLOR_TEXT_MUTED,
              fontSize: 8,
              margin: [40, 20, 0, 0]
            },
            {
              text: `Page ${currentPage} sur ${pageCount}`,
              alignment: 'right',
              color: this.COLOR_TEXT_MUTED,
              fontSize: 8,
              margin: [0, 20, 40, 0]
            }
          ]
        };
      },

      content: [
        // 1. EN-TÊTE DU DOCUMENT
        {
          columns: [
            // Logo ou Nom du bailleur à gauche
            this.getLogoColumn(data.bailleur.logoBase64, data.bailleur.nom),
            
            // Badge et Période à droite
            {
              width: '*',
              stack: [
                {
                  text: 'QUITTANCE DE LOYER',
                  fontSize: 20,
                  bold: true,
                  color: this.COLOR_ACCENT,
                  alignment: 'right',
                  characterSpacing: 1
                },
                {
                  text: `Période : ${data.periode}`,
                  fontSize: 12,
                  color: this.COLOR_TEXT_MUTED,
                  alignment: 'right',
                  margin: [0, 4, 0, 0]
                }
              ]
            }
          ],
          margin: [0, 0, 0, 40]
        },

        // Ligne de séparation
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: this.COLOR_BORDER }],
          margin: [0, 0, 0, 20]
        },

        // 2. BLOCS D'INFORMATIONS (BAILLEUR / LOCATAIRE)
        {
          columns: [
            // Colonne Bailleur
            {
              width: '50%',
              stack: [
                { text: 'Bailleur / Gestionnaire', fontSize: 10, bold: true, color: this.COLOR_TEXT_MUTED, margin: [0, 0, 0, 5] },
                { text: data.bailleur.nom, fontSize: 12, bold: true, color: this.COLOR_PRIMARY },
                { text: data.bailleur.adresse, fontSize: 10, color: this.COLOR_PRIMARY, margin: [0, 2, 0, 0] },
                { text: `Tél: ${data.bailleur.telephone}`, fontSize: 10, color: this.COLOR_PRIMARY, margin: [0, 2, 0, 0] },
                data.bailleur.email ? { text: `Email: ${data.bailleur.email}`, fontSize: 10, color: this.COLOR_PRIMARY, margin: [0, 2, 0, 0] } : {}
              ]
            },
            // Colonne Locataire
            {
              width: '50%',
              stack: [
                { text: 'Locataire', fontSize: 10, bold: true, color: this.COLOR_TEXT_MUTED, margin: [0, 0, 0, 5] },
                { text: data.locataire.nomComplet, fontSize: 12, bold: true, color: this.COLOR_PRIMARY },
                { text: `Tél: ${data.locataire.telephone}`, fontSize: 10, color: this.COLOR_PRIMARY, margin: [0, 2, 0, 0] },
                { text: `Appartement: ${data.locataire.appartement}`, fontSize: 10, color: this.COLOR_PRIMARY, margin: [0, 2, 0, 0] }
              ]
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // 3. TABLEAU DES PRESTATIONS
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              // Header du tableau
              [
                { text: 'Désignation', bold: true, color: '#FFFFFF', fillColor: this.COLOR_ACCENT, border: [false, false, false, false], margin: [10, 5, 10, 5] },
                { text: 'Mode de règlement', bold: true, color: '#FFFFFF', fillColor: this.COLOR_ACCENT, border: [false, false, false, false], margin: [10, 5, 10, 5], alignment: 'center' },
                { text: 'Référence / Date', bold: true, color: '#FFFFFF', fillColor: this.COLOR_ACCENT, border: [false, false, false, false], margin: [10, 5, 10, 5], alignment: 'center' },
                { text: 'Montant', bold: true, color: '#FFFFFF', fillColor: this.COLOR_ACCENT, border: [false, false, false, false], margin: [10, 5, 10, 5], alignment: 'right' }
              ],
              // Ligne de donnée
              [
                { text: `Loyer mensuel - ${data.periode}`, margin: [10, 10, 10, 10], border: [false, false, false, true] },
                { text: data.modePaiement.replace('_', ' ').toUpperCase(), alignment: 'center', margin: [10, 10, 10, 10], border: [false, false, false, true] },
                { text: `${data.reference || '-'}\n${this.formatDate(data.datePaiement)}`, alignment: 'center', fontSize: 9, margin: [10, 10, 10, 10], border: [false, false, false, true] },
                { text: this.formatMontant(data.montant), alignment: 'right', bold: true, margin: [10, 10, 10, 10], border: [false, false, false, true] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i, node) => i === node.table.body.length ? 1 : 0,
            vLineWidth: () => 0,
            hLineColor: () => this.COLOR_BORDER,
            paddingLeft: () => 0,
            paddingRight: () => 0
          },
          margin: [0, 0, 0, 20]
        },

        // TOTAL HIGHLIGHT
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: [150, 120],
                body: [
                  [
                    { text: 'TOTAL RÉGLÉ', bold: true, color: this.COLOR_PRIMARY, alignment: 'right', margin: [10, 5, 10, 5], border: [false, false, false, false] },
                    { text: this.formatMontant(data.montant), bold: true, color: this.COLOR_ACCENT, fontSize: 14, alignment: 'right', margin: [10, 5, 10, 5], border: [false, false, false, false] }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 40]
        },

        // 4. ATTESTATION LÉGALE
        {
          text: `Je soussigné(e), le Propriétaire / Gestionnaire, déclare avoir reçu de la part du locataire sus-nommé, la somme de ${this.formatMontant(data.montant)}, au titre du paiement du loyer pour la période de ${data.periode}.\n\nCette quittance est délivrée sous réserve d'encaissement effectif en cas de paiement par chèque ou virement.`,
          fontSize: 10,
          color: this.COLOR_TEXT_MUTED,
          lineHeight: 1.5,
          margin: [0, 0, 0, 40]
        },

        // 5. CACHET & SIGNATURE
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                { text: 'Le Gestionnaire', alignment: 'center', bold: true, color: this.COLOR_PRIMARY },
                { text: '(Cachet et Signature)', alignment: 'center', fontSize: 9, color: this.COLOR_TEXT_MUTED, margin: [0, 5, 0, 50] },
                { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 180, y2: 0, lineWidth: 1, lineColor: this.COLOR_BORDER }] }
              ]
            }
          ]
        }
      ],
      defaultStyle: {
        font: 'Roboto',
        color: this.COLOR_PRIMARY
      }
    };

    // Génération et téléchargement
    pdfMake.createPdf(docDefinition).download(`Quittance_${data.periode}_Locataire_${data.locataire.nomComplet.replace(' ', '_')}.pdf`);
  }

  /**
   * Formate le montant avec des espaces pour les milliers
   */
  private formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA';
  }

  /**
   * Formate la date
   */
  private formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  /**
   * Retourne l'objet colonne pour le logo (Image ou Texte)
   */
  private getLogoColumn(logoBase64?: string, nomBailleur?: string) {
    if (logoBase64) {
      return {
        width: 120,
        image: logoBase64,
        fit: [120, 60]
      };
    } else {
      return {
        width: 150,
        text: nomBailleur || 'SAAS IMMEUBLE',
        fontSize: 16,
        bold: true,
        color: this.COLOR_PRIMARY,
        margin: [0, 5, 0, 0]
      };
    }
  }
}
