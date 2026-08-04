export interface TendanceDto {
  valeur: string;
  type: 'positif' | 'negatif' | 'neutre';
}

export interface KPIStatsDto {
  totalImmeubles: number;
  tendanceImmeubles: TendanceDto;
  totalAppartements: number;
  tendanceApparts: TendanceDto;
  totalLocataires: number;
  tendanceLocs: TendanceDto;
  tauxOccupation: number;
}

export interface FinanceStatsDto {
  loyersPayes: number;
  loyersEnAttente: number;
  loyersEnRetard: number;
  revenuMensuel: number;
  depensesTravaux: number;
  revenuNet: number;
}

export interface RecentActivityDto {
  icone: string;
  texte: string;
  temps: string;
  type: 'succes' | 'alerte' | 'info';
}

export interface ChartDataDto {
  labels: string[];
  data: number[];
}

export interface DashboardDataDto {
  kpis: KPIStatsDto;
  finances: FinanceStatsDto;
  chartData: ChartDataDto;
  activitesRecentes: RecentActivityDto[];
}
