'use client';

import CountUp from 'react-countup';
import { KPIs as KPIModel, RiskMetrics } from '@/types';
import { TrendingUp, AlertOctagon, Target, Wallet, PiggyBank, Landmark } from 'lucide-react';

interface KPIsProps {
  kpis: KPIModel | null;
  riskMetrics: RiskMetrics | null;
  isReal: boolean;
  inflationRate: number;
  years: number;
}

export default function KPIs({ kpis, riskMetrics, isReal, inflationRate, years }: KPIsProps) {
  if (!kpis || !riskMetrics) return null;

  // Helper to adjust for inflation if isReal is true
  // Note: The backend returns Nominal KPIs in 'kpis' object.
  // We need to deflate them if isReal is true.
  const deflator = isReal ? Math.pow(1 + inflationRate, years) : 1;

  const invested = kpis["Capital Total Invertido"] / deflator;
  const finalNet = kpis["Saldo Final Neto"] / deflator;
  const taxes = kpis["Impuestos Estimados"] / deflator;
  const monthlyRent = (finalNet * 0.04) / 12; // 4% Rule

  const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute top-full left-0 mt-2 w-full p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
      {text}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Capital Invertido */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border group relative hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-muted-foreground">
            <Wallet size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Capital Invertido</p>
        </div>
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          <CountUp end={invested} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <p className="text-xs text-muted-foreground mt-2">{isReal ? 'Poder Adquisitivo' : 'Valor Nominal'}</p>
        <Tooltip text="Total de dinero aportado de tu bolsillo a lo largo de los años, sin contar rendimientos." />
      </div>

      {/* Saldo Final Neto */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border group relative hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <PiggyBank size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Saldo Final (Neto)</p>
        </div>
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          <CountUp end={finalNet} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
          <Landmark size={12} />
          <span>Impuestos: -€{Math.round(taxes).toLocaleString()}</span>
        </div>
        <Tooltip text="Dinero disponible después de pagar impuestos sobre las ganancias." />
      </div>

      {/* Renta Mensual (4%) */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border group relative hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Renta Mensual (4%)</p>
        </div>
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          <CountUp end={monthlyRent} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <p className="text-xs text-muted-foreground mt-2">Libertad Financiera</p>
        <Tooltip text="Estimación de cuánto podrías retirar mensualmente sin agotar tu capital (Regla del 4%)." />
      </div>

      {/* Probabilidad Meta */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border group relative hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            riskMetrics.success_probability >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
            riskMetrics.success_probability >= 50 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-destructive/10 text-destructive'
          }`}>
            <Target size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Probabilidad Meta</p>
        </div>
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          <CountUp end={riskMetrics.success_probability} suffix="%" decimals={1} duration={1} />
        </h3>
        <p className="text-xs text-muted-foreground mt-2">Objetivo &gt; 500k (Real)</p>
        <Tooltip text="Probabilidad de alcanzar tu objetivo financiero ajustado a inflación." />
      </div>
    </div>
  );
}
