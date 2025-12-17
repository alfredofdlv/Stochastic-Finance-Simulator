'use client';

import { useState } from 'react';
import Sidebar, { SimulationConfig } from '@/components/Sidebar';
import SimulationCharts from '@/components/SimulationCharts';
import KPIs from '@/components/KPIs';
import { runSimulation, runBacktest } from '@/lib/api';
import { useSimulation } from '@/context/SimulationContext';
import { AlertCircle, Menu } from 'lucide-react';

function SimulatorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl border border-border/50"></div>
        ))}
      </div>
      {/* Chart Skeleton */}
      <div className="h-[600px] bg-muted rounded-xl border border-border/50"></div>
    </div>
  );
}

export default function SimulatorPage() {
  const { 
    simulationData, setSimulationData, 
    backtestData, setBacktestData,
    currentConfig, setCurrentConfig,
    hasRun, setHasRun,
    isReal
  } = useSimulation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        tax_rate: 0.19,
        financial_goal: config.financialGoal
      });
      setSimulationData(simResponse);
      setHasRun(true);

      // 2. Run Backtest
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

  const totalYears = currentConfig ? currentConfig.contributions.reduce((acc, curr) => acc + curr.years, 0) : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
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
      } bg-card border-r border-border`}>
        <Sidebar 
          onRunSimulation={handleRunSimulation} 
          isLoading={isLoading} 
          currentConfig={currentConfig}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile Header for Sidebar Toggle */}
        <div className="lg:hidden p-4 border-b border-border flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-muted-foreground hover:bg-accent rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="ml-2 font-semibold">Configuración</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {isLoading ? (
              <SimulatorSkeleton />
            ) : !hasRun ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4">
                  <Menu className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Configura tu primera simulación</h2>
                <p className="text-muted-foreground max-w-md">
                  Usa el panel lateral para definir tu capital inicial, aportaciones y perfil de riesgo.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
