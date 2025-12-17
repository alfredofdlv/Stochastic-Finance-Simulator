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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Capital Invertido */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Wallet size={20} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Capital Invertido</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          <CountUp end={invested} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <p className="text-xs text-slate-400 mt-1">{isReal ? 'Poder Adquisitivo' : 'Valor Nominal'}</p>
      </div>

      {/* Saldo Final Neto */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <PiggyBank size={20} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Saldo Final (Neto)</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          <CountUp end={finalNet} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
          <Landmark size={12} />
          <span>Impuestos: -€{Math.round(taxes).toLocaleString()}</span>
        </div>
      </div>

      {/* Renta Mensual (4%) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Renta Mensual (4%)</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          <CountUp end={monthlyRent} prefix="€" separator="," decimals={0} duration={1} />
        </h3>
        <p className="text-xs text-slate-400 mt-1">Libertad Financiera</p>
      </div>

      {/* Probabilidad Meta */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            riskMetrics.success_probability >= 80 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
            riskMetrics.success_probability >= 50 ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <Target size={20} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Probabilidad Meta</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          <CountUp end={riskMetrics.success_probability} suffix="%" decimals={1} duration={1} />
        </h3>
        <p className="text-xs text-slate-400 mt-1">Objetivo > 500k (Real)</p>
      </div>
    </div>
  );
}
