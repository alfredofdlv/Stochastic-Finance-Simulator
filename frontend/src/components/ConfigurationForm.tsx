'use client';

import { useState } from 'react';
import { Plus, Trash2, Play, ChevronDown, Settings, Wallet, TrendingUp } from 'lucide-react';
import AssetSearch from './AssetSearch';
import { ContributionTranche } from '@/types';

export interface SimulationConfig {
  initialCapital: number;
  inflation: number;
  ticker: string;
  contributions: ContributionTranche[];
  financialGoal: number;
  startYear?: number;
}

interface ConfigurationFormProps {
  onRunSimulation: (config: SimulationConfig) => void;
  isLoading: boolean;
  initialConfig?: SimulationConfig;
  variant?: 'sidebar' | 'centered';
}

const Section = ({ title, icon: Icon, children, defaultOpen = false }: any) => (
  <details className="group border border-border rounded-xl bg-card overflow-hidden transition-all" open={defaultOpen}>
    <summary className="flex items-center justify-between p-4 font-medium cursor-pointer list-none text-foreground hover:bg-accent/50 transition-colors select-none">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-muted-foreground" />}
        <span>{title}</span>
      </div>
      <ChevronDown size={16} className="text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
      <div className="space-y-4 pt-2">
        {children}
      </div>
    </div>
  </details>
);

export default function ConfigurationForm({ 
  onRunSimulation, 
  isLoading, 
  initialConfig,
  variant = 'sidebar' 
}: ConfigurationFormProps) {
  const [config, setConfig] = useState<SimulationConfig>(initialConfig || {
    initialCapital: 10000,
    inflation: 2.0,
    ticker: 'VWRL.AS',
    contributions: [{ years: 20, monthly_amount: 500 }],
    financialGoal: 500000,
    startYear: 2008
  });

  const updateContribution = (index: number, field: keyof ContributionTranche, value: number) => {
    const newContribs = [...config.contributions];
    newContribs[index] = { ...newContribs[index], [field]: value };
    setConfig({ ...config, contributions: newContribs });
  };

  const addTranche = () => {
    setConfig({
      ...config,
      contributions: [...config.contributions, { years: 5, monthly_amount: 500 }]
    });
  };

  const removeTranche = (index: number) => {
    if (config.contributions.length > 1) {
      const newContribs = config.contributions.filter((_, i) => i !== index);
      setConfig({ ...config, contributions: newContribs });
    }
  };

  const isCentered = variant === 'centered';
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide";
  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all";

  return (
    <div className={`flex flex-col gap-4 ${isCentered ? 'max-w-2xl mx-auto w-full' : ''}`}>
      
      {/* 1. Configuración Inicial */}
      <Section title="Configuración Inicial" icon={Settings} defaultOpen={true}>
        <div>
          <label className={labelClass}>Capital Inicial (€)</label>
          <input
            type="number"
            value={config.initialCapital}
            onChange={(e) => setConfig({ ...config, initialCapital: Number(e.target.value) })}
            className={inputClass}
            placeholder="Ej: 10000"
          />
        </div>

        <div>
          <label className={labelClass}>Activo / Ticker</label>
          <AssetSearch onSelect={(ticker) => setConfig({ ...config, ticker })} />
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Seleccionado:</span>
            <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{config.ticker}</span>
          </div>
        </div>
      </Section>

      {/* 2. Aportaciones */}
      <Section title="Plan de Aportaciones" icon={Wallet} defaultOpen={true}>
        <div className="space-y-3">
          {config.contributions.map((tranche, index) => (
            <div key={index} className="bg-accent/30 p-3 rounded-lg border border-border relative group">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Años</label>
                  <input
                    type="number"
                    value={tranche.years}
                    onChange={(e) => updateContribution(index, 'years', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mensual (€)</label>
                  <input
                    type="number"
                    value={tranche.monthly_amount}
                    onChange={(e) => updateContribution(index, 'monthly_amount', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
              
              {config.contributions.length > 1 && (
                <button
                  onClick={() => removeTranche(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Eliminar tramo"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={addTranche}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:bg-accent rounded-md border border-dashed border-border transition-colors"
          >
            <Plus size={16} />
            Añadir Tramo
          </button>
        </div>
      </Section>

      {/* 3. Avanzado */}
      <Section title="Parámetros Avanzados" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Inflación (%)</label>
            <input
              type="number"
              step="0.1"
              value={config.inflation}
              onChange={(e) => setConfig({ ...config, inflation: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta (€)</label>
            <input
              type="number"
              value={config.financialGoal}
              onChange={(e) => setConfig({ ...config, financialGoal: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Año Inicio Backtest</label>
          <input
            type="number"
            value={config.startYear || ''}
            onChange={(e) => setConfig({ ...config, startYear: Number(e.target.value) })}
            className={inputClass}
            placeholder="Ej: 2000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Opcional. Si se deja vacío, no se ejecuta backtest.
          </p>
        </div>
      </Section>

      <button
        onClick={() => onRunSimulation(config)}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Simulando...</span>
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" />
            <span>Ejecutar Simulación</span>
          </>
        )}
      </button>
    </div>
  );
}
