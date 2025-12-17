'use client';

import { useSimulation } from '@/context/SimulationContext';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export default function RiskAnalysisPage() {
  const { simulationData } = useSimulation();

  if (!simulationData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center p-6">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">No hay datos de simulación</h2>
        <p className="text-muted-foreground mt-2">
          Ejecuta una simulación en el Dashboard para ver el análisis de riesgo detallado.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Análisis de Riesgo Profundo</h1>
        <p className="text-muted-foreground">
          Evaluación detallada de escenarios adversos y volatilidad extrema (Cisnes Negros).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Max Drawdown</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {(simulationData.risk_metrics.max_drawdown * 100).toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            La mayor caída observada desde un pico hasta un valle en las simulaciones.
          </p>
        </div>
        
        {/* More risk metrics placeholders */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Distribución de Retornos</h3>
          <div className="h-64 flex items-center justify-center bg-accent/50 rounded-lg border border-dashed border-border">
            <span className="text-muted-foreground">Gráfico de Histograma (Próximamente)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
