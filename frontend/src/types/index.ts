export interface ContributionTranche {
  years: number;
  monthly_amount: number;
}

export interface SimulationRequest {
  initial_capital: number;
  contribution_schedule: ContributionTranche[];
  ticker: string;
  inflation_rate: number;
  tax_rate: number;
  financial_goal: number;
}

export interface BacktestRequest {
  initial_capital: number;
  contribution_schedule: ContributionTranche[];
  ticker: string;
  start_year: number;
  inflation_rate: number;
}

export interface TickerSearchResponse {
  symbol: string;
  shortName?: string;
}

export interface FanChartPoint {
  Year: number;
  P10_Nominal: number;
  Median_Nominal: number;
  P90_Nominal: number;
  P10_Real: number;
  Median_Real: number;
  P90_Real: number;
}

export interface MedianDetail {
  Año: number;
  "Saldo Inicial": number;
  "Aportación Anual": number;
  "Retorno (%)": number;
  "Interés Generado": number;
  "Saldo Final": number;
  "Is_Black_Swan": boolean;
}

export interface RiskMetrics {
  max_drawdown: number;
  success_probability: number;
  median_final_balance_real: number;
}

export interface TickerStats {
  mean_return: number;
  volatility: number;
  data_points: number;
}

export interface KPIs {
  "Capital Total Invertido": number;
  "Saldo Final Bruto": number;
  "Impuestos Estimados": number;
  "Beneficio Neto": number;
  "Saldo Final Neto": number;
  "Rentabilidad (%)": number;
}

export interface PortfolioCompositionPoint {
  Year: number;
  "Capital Inicial": number;
  "Aportaciones": number;
  "Interés Compuesto": number;
  "Is_Black_Swan": boolean;
}

export interface SimulationResponse {
  fan_chart: FanChartPoint[];
  portfolio_composition: PortfolioCompositionPoint[];
  median_scenario: MedianDetail[];
  kpis: KPIs;
  risk_metrics: RiskMetrics;
  ticker_stats: TickerStats;
}

export interface BacktestPoint {
  Date: string;
  Balance_Nominal: number;
  Balance_Real: number;
  Invested: number;
  Return_Pct: number;
}

export interface BacktestResponse {
  history: BacktestPoint[];
  final_balance: number;
  final_balance_real: number;
  total_invested: number;
}
