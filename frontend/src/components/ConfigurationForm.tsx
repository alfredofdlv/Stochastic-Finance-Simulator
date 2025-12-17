'use client';

import { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';
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
  const labelClass = "block text-sm font-semibold text-slate-800 mb-1.5";
  const inputClass = "w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base p-2.5 border text-slate-900";

  return (
    <div className={`flex flex-col gap-6 ${isCentered ? 'max-w-4xl mx-auto w-full' : ''}`}>
      <div className={isCentered ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}>
        <div className="space-y-5">
          <h2 className={`font-bold text-slate-900 mb-4 ${isCentered ? 'text-2xl' : 'text-lg'}`}>
            Configuración Inicial
          </h2>
          
          {/* Capital Inicial */}
          <div>
            <label className={labelClass}>Capital Inicial (€)</label>
            <input
              type="number"
              value={config.initialCapital}
              onChange={(e) => setConfig({ ...config, initialCapital: Number(e.target.value) })}
              className={inputClass}
            />
          </div>

          {/* Asset Search */}
          <div>
            <label className={labelClass}>Activo / Ticker</label>
            <AssetSearch onSelect={(ticker) => setConfig({ ...config, ticker })} />
            <p className="text-sm text-slate-600 mt-1.5">
              Seleccionado: <span className="font-bold text-blue-700">{config.ticker}</span>
            </p>
          </div>

          {/* Inflation & Goal */}
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
          
          {/* Backtest Start Year */}
           <div>
              <label className={labelClass}>Año Inicio Backtest</label>
              <input
                type="number"
                value={config.startYear}
                onChange={(e) => setConfig({ ...config, startYear: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
        </div>

        {/* Contributions Table */}
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold text-slate-900 ${isCentered ? 'text-xl' : 'text-base'}`}>
              Plan de Aportaciones
            </h3>
            <button 
              onClick={addTranche} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-md transition-colors"
            >
              <Plus size={16} /> Añadir Tramo
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {config.contributions.map((tranche, idx) => (
              <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 block mb-1">Duración (Años)</label>
                  <input
                    type="number"
                    value={tranche.years}
                    onChange={(e) => updateContribution(idx, 'years', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 block mb-1">Aportación (€/Mes)</label>
                  <input
                    type="number"
                    value={tranche.monthly_amount}
                    onChange={(e) => updateContribution(idx, 'monthly_amount', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium"
                  />
                </div>
                <button 
                  onClick={() => removeTranche(idx)}
                  className="text-slate-400 hover:text-red-500 mt-5 p-1 hover:bg-red-50 rounded transition-colors"
                  disabled={config.contributions.length === 1}
                  title="Eliminar tramo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className={`mt-8 ${isCentered ? 'flex justify-end' : ''}`}>
            <button
              onClick={() => onRunSimulation(config)}
              disabled={isLoading}
              className={`
                bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-blue-200
                ${isCentered ? 'px-8 py-4 text-lg rounded-xl w-full md:w-auto' : 'w-full py-3 rounded-lg'}
              `}
            >
              {isLoading ? (
                <>Procesando...</>
              ) : (
                <>
                  <Play size={isCentered ? 24 : 18} /> Ejecutar Simulación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
