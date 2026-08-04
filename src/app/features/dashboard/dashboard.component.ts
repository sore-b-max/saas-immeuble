import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { lucideBuilding, lucideHome, lucideUsers, lucidePieChart, lucideBanknote, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideRocket, lucideFileText, lucideZap, lucideWrench, lucideSettings, lucideAlertTriangle, lucideUserPlus, lucideDownload, lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { ToastService } from '../../core/services/toast.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [provideIcons({ lucideBuilding, lucideHome, lucideUsers, lucidePieChart, lucideBanknote, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideRocket, lucideFileText, lucideZap, lucideWrench, lucideSettings, lucideAlertTriangle, lucideUserPlus, lucideDownload, lucideTrendingUp, lucideTrendingDown })]
})
export class DashboardComponent implements OnInit {
  private toastService = inject(ToastService);
  private dashboardService = inject(DashboardService);

  isLoading = signal<boolean>(true);
  
  // On récupère le signal de données du service
  dashboardData = this.dashboardService.dashboardState;

  // On crée un signal calculé pour la configuration du graphe 
  // car Chart.js a besoin d'objets spécifiques qui se mettent à jour.
  lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const data = this.dashboardData();
    if (!data) return { labels: [], datasets: [] };

    return {
      labels: data.chartData.labels,
      datasets: [
        {
          data: data.chartData.data,
          label: 'Revenus nets (FCFA)',
          fill: true,
          tension: 0.4,
          borderColor: '#4f46e5', // indigo-600
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4f46e5',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  });
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { font: { family: 'Inter' }, color: '#6b7280' }
      },
      y: { 
        grid: { color: '#f3f4f6' }, // gray-100
        border: { display: false },
        ticks: { font: { family: 'Inter' }, color: '#6b7280' }
      }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      await this.dashboardService.fetchDashboardData();
    } catch (err) {
      this.toastService.showError("Erreur lors du chargement du tableau de bord");
    } finally {
      this.isLoading.set(false);
    }
  }

  exporterRapport() {
    this.toastService.showSuccess('Rapport CSV téléchargé avec succès !');
  }
}
