import { Injectable } from '@angular/core';
import { DashboardDataDto } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  /**
   * Génère et déclenche le téléchargement d'un fichier CSV encodé en UTF-8 avec BOM.
   */
  private downloadCsv(csvContent: string, filename: string): void {
    // Ajouter le BOM UTF-8 (\uFEFF) pour garantir un affichage parfait des accents dans Excel / OpenOffice
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Échappe une valeur pour le format CSV (gère les guillemets et virgules).
   */
  private escapeCsvValue(val: any): string {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  }

  /**
   * Exporte un rapport complet du Tableau de bord au format CSV.
   */
  exportDashboard(data: DashboardDataDto | null): void {
    if (!data) {
      console.warn('Aucune donnée de tableau de bord à exporter');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const lines: string[] = [];

    // EN-TÊTE DU RAPPORT
    lines.push('RAPPORT DE GESTION IMMOBILIÈRE — SAAS IMMEUBLE PRO');
    lines.push(`Généré le :;${new Date().toLocaleString('fr-FR')}`);
    lines.push('');

    // INDICATEURS CLÉS (KPIS)
    lines.push('--- INDICATEURS CLÉS (KPIs) ---');
    lines.push('Indicateur;Valeur');
    lines.push(`Total Immeubles;${data.kpis.totalImmeubles}`);
    lines.push(`Total Appartements;${data.kpis.totalAppartements}`);
    lines.push(`Locataires Actifs;${data.kpis.totalLocataires}`);
    lines.push(`Taux d'occupation;${data.kpis.tauxOccupation}%`);
    lines.push('');

    // SYNTHÈSE FINANCIÈRE
    lines.push('--- SYNTHÈSE FINANCIÈRE DE LA PÉRIODE ---');
    lines.push('Métrique;Montant / Quantité');
    lines.push(`Loyers Payés (Nombre);${data.finances.loyersPayes}`);
    lines.push(`Loyers En Attente (Nombre);${data.finances.loyersEnAttente}`);
    lines.push(`Loyers En Retard (Nombre);${data.finances.loyersEnRetard}`);
    lines.push(`Revenu Mensuel Brut;${data.finances.revenuMensuel.toLocaleString('fr-FR')} FCFA`);
    lines.push(`Dépenses Travaux;${data.finances.depensesTravaux.toLocaleString('fr-FR')} FCFA`);
    lines.push(`Revenu Net;${data.finances.revenuNet.toLocaleString('fr-FR')} FCFA`);
    lines.push('');

    // HISTORIQUE DES REVENUS
    lines.push('--- EVOLUTION DES REVENUS ---');
    lines.push('Mois;Revenu Net (FCFA)');
    if (data.chartData && data.chartData.labels) {
      data.chartData.labels.forEach((label, idx) => {
        const montant = data.chartData.data[idx] || 0;
        lines.push(`${label};${montant.toLocaleString('fr-FR')} FCFA`);
      });
    }
    lines.push('');

    // ACTIVITÉS RÉCENTES
    lines.push('--- HISTORIQUE DES ACTIVITÉS RÉCENTES ---');
    lines.push('Événement;Temps;Statut');
    if (data.activitesRecentes) {
      data.activitesRecentes.forEach(act => {
        lines.push(`${this.escapeCsvValue(act.texte)};${this.escapeCsvValue(act.temps)};${this.escapeCsvValue(act.type)}`);
      });
    }

    const csvString = lines.join('\n');
    this.downloadCsv(csvString, `Rapport_Tableau_De_Bord_${dateStr}.csv`);
  }

  /**
   * Exporte la liste des paiements/loyers au format CSV.
   */
  exportPaiements(paiements: any[]): void {
    const dateStr = new Date().toISOString().split('T')[0];
    const lines: string[] = [];

    lines.push('HISTORIQUE DES PAIEMENTS DE LOYER');
    lines.push(`Exporté le :;${new Date().toLocaleString('fr-FR')}`);
    lines.push('');
    lines.push('ID;Appartement ID;Locataire ID;Mois Concerne;Montant (FCFA);Mode Paiement;Référence;Statut;Date Paiement');

    paiements.forEach(p => {
      lines.push([
        p.id || '',
        p.appartementId || '',
        p.locataireId || '',
        this.escapeCsvValue(p.moisConcerne || ''),
        p.montant || 0,
        this.escapeCsvValue(p.modePaiement || ''),
        this.escapeCsvValue(p.reference || ''),
        this.escapeCsvValue(p.statut || ''),
        this.escapeCsvValue(p.datePaiement || '')
      ].join(';'));
    });

    this.downloadCsv(lines.join('\n'), `Loyers_Export_${dateStr}.csv`);
  }
}
