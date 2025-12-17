'use client';

import { useState } from 'react';
import Sidebar, { SimulationConfig } from '@/components/Sidebar';
import ConfigurationForm from '@/components/ConfigurationForm';
import SimulationCharts from '@/components/SimulationCharts';
import KPIs from '@/components/KPIs';
import MasterSwitch from '@/components/MasterSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import { runSimulation, runBacktest } from '@/lib/api';
import { SimulationResponse, BacktestResponse } from '@/types';
import { Activity, AlertCircle, Menu } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [backtestData, setBacktestData] = useState<BacktestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig | undefined>(undefined);
  const [isReal, setIsReal] = useState(true); // Default to Real terms
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRunSimulation = async (config: SimulationConfig) => {
    setIsLoading(true);
    setError(null);
    setCurrentConfig(config);
    
    try {
      // 1. Run Monte Carlo Simulation
      const simResponse = await runSimulation({
        initial_capital: config.initialCapital,
        contribution_schedule: config.contributions,
        ticker: config.ticker,
        inflation_rate: config.inflation / 100,
        tax_rate: 0.19, // Default tax rate
        financial_goal: config.financialGoal
      });
      setSimulationData(simResponse);
      setHasRun(true);

      // 2. Run Backtest (if start year is valid)
      if (config.startYear && config.startYear > 1900) {
        try {
          const backtestResponse = await runBacktest({
            initial_capital: config.initialCapital,
            contribution_schedule: config.contributions,
            ticker: config.ticker,
            start_year: config.startYear,
            inflation_rate: config.inflation / 100
          });
          setBacktestData(backtestResponse);
        } catch (error) {
          console.error("Backtest failed:", error);
          setBacktestData(null);
        }
      } else {
        setBacktestData(null);
      }

    } catch (error: any) {
      console.error("Simulation failed:", error);
      if (error.message === 'Network Error') {
        setError("No se pudo conectar con el servidor. Asegúrate de que el backend (FastAPI) esté corriendo en el puerto 8000.");
      } else {
        setError("Error ejecutando la simulación. Verifica el ticker o la conexión.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total years for KPI adjustment
  const totalYears = currentConfig ? currentConfig.contributions.reduce((acc, curr) => acc + curr.years, 0) : 0;

  if (!hasRun) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
              <Activity className="text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg">Finance Simulator</span>
            </Link>
          </div>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Configura tu Simulación
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Define tus parámetros iniciales para proyectar tu futuro financiero bajo condiciones de estrés y volatilidad real.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
              <ConfigurationForm 
                onRunSimulation={handleRunSimulation} 
                isLoading={isLoading} 
                variant="centered"
                initialConfig={currentConfig}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          onRunSimulation={handleRunSimulation} 
          isLoading={isLoading} 
          currentConfig={currentConfig}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              Dashboard Financiero
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <MasterSwitch isReal={isReal} onChange={setIsReal} />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* KPIs Section */}
            <KPIs 
              kpis={simulationData?.kpis || null} 
              riskMetrics={simulationData?.risk_metrics || null}
              isReal={isReal}
              inflationRate={(currentConfig?.inflation || 2) / 100}
              years={totalYears}
            />

            {/* Charts Section */}
            <div className="h-[600px]">
              <SimulationCharts 
                simulationData={simulationData} 
                backtestData={backtestData}
                isReal={isReal}
              />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
