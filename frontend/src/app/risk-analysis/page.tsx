'use client';

import { useSimulation } from '@/context/SimulationContext';
import { AlertTriangle, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import PlotlyChart from '@/components/PlotlyChart';
import { useTheme } from 'next-themes';

export default function RiskAnalysisPage() {
  const { simulationData } = useSimulation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  // Calculate Drawdown Series for Median Scenario
  let peak = 0;
  const drawdownSeries = simulationData.median_scenario.map((point) => {
    const balance = point["Saldo Final"];
    if (point.Año === simulationData.median_scenario[0].Año) {
        peak = balance;
    } else {
        peak = Math.max(peak, balance);
    }
    const drawdown = (balance - peak) / peak;
    return { year: point.Año, drawdown: drawdown * 100 }; // in %
  });

  // Prepare Data for Annual Returns Chart
  const annualReturns = simulationData.median_scenario.map(p => p["Retorno (%)"]);
  const years = simulationData.median_scenario.map(p => p.Año);
  const returnColors = annualReturns.map(r => r >= 0 ? '#22c55e' : '#ef4444');

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Análisis de Riesgo Profundo</h1>
        <p className="text-muted-foreground">
          Evaluación detallada de escenarios adversos y volatilidad extrema (Cisnes Negros).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gauge de Éxito */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Probabilidad de Éxito</h3>
          </div>
          <div className="h-64 w-full">
            <PlotlyChart
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: simulationData.risk_metrics.success_probability * 100,
                  title: { text: "Probabilidad de alcanzar la meta", font: { size: 14, color: isDark ? '#e5e7eb' : '#374151' } },
                  number: { suffix: "%", font: { color: isDark ? '#e5e7eb' : '#374151' } },
                  gauge: {
                    axis: { range: [0, 100], tickwidth: 1, tickcolor: isDark ? '#525252' : '#d1d5db' },
                    bar: { color: "#2563eb" },
                    bgcolor: "transparent",
                    borderwidth: 2,
                    bordercolor: isDark ? '#525252' : '#d1d5db',
                    steps: [
                      { range: [0, 50], color: isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)" },
                      { range: [50, 80], color: isDark ? "rgba(234, 179, 8, 0.3)" : "rgba(234, 179, 8, 0.2)" },
                      { range: [80, 100], color: isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)" },
                    ],
                  },
                },
              ]}
              layout={{
                autosize: true,
                margin: { t: 40, b: 40, l: 40, r: 40 },
                paper_bgcolor: "transparent",
                font: { color: isDark ? '#e5e7eb' : '#374151' },
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
              config={{ displayModeBar: false }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Probabilidad estimada de superar el objetivo financiero definido.
          </p>
        </div>

        {/* Max Drawdown Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Métrica de Dolor (Max Drawdown)</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-8">
                <span className="text-5xl font-bold text-destructive">
                    {(simulationData.risk_metrics.max_drawdown * 100).toFixed(2)}%
                </span>
            </div>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Esta es la caída máxima histórica simulada desde un pico hasta un valle. 
              Representa el "dolor" máximo que podrías sentir en tu portafolio durante una crisis.
            </p>
          </div>
          <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border/50">
             <p className="text-xs text-muted-foreground">
                <strong>Consejo:</strong> Si este número te quita el sueño, considera reducir la exposición a renta variable o diversificar más tu portafolio.
             </p>
          </div>
        </div>
      </div>

      {/* Montaña Rusa Emocional (Drawdown Chart) */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-foreground">Montaña Rusa Emocional</h3>
                <p className="text-sm text-muted-foreground">Profundidad de las caídas a lo largo del tiempo (Escenario Mediano)</p>
            </div>
        </div>
        <div className="h-80 w-full">
            <PlotlyChart
              data={[
                {
                  x: years,
                  y: drawdownSeries.map(d => d.drawdown),
                  type: 'scatter',
                  mode: 'lines',
                  fill: 'tozeroy',
                  line: { color: '#ef4444', width: 2 },
                  fillcolor: 'rgba(239, 68, 68, 0.1)',
                  name: 'Drawdown',
                },
              ]}
              layout={{
                autosize: true,
                margin: { t: 20, r: 20, l: 50, b: 40 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                xaxis: { 
                    title: 'Año', 
                    gridcolor: isDark ? '#262626' : '#e5e5e5',
                    color: isDark ? '#a3a3a3' : '#525252'
                },
                yaxis: { 
                    title: 'Caída desde Máximo (%)', 
                    gridcolor: isDark ? '#262626' : '#e5e5e5',
                    color: isDark ? '#a3a3a3' : '#525252',
                    zerolinecolor: isDark ? '#404040' : '#d4d4d4'
                },
                font: { family: 'inherit' },
                hovermode: 'x unified',
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
              config={{ displayModeBar: false }}
            />
        </div>
      </div>

      {/* Annual Returns Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-foreground">Retornos Anuales (Escenario Mediano)</h3>
                <p className="text-sm text-muted-foreground">Variabilidad de los rendimientos año con año</p>
            </div>
        </div>
        <div className="h-80 w-full">
            <PlotlyChart
              data={[
                {
                  x: years,
                  y: annualReturns,
                  type: 'bar',
                  marker: { color: returnColors },
                  name: 'Retorno Anual',
                },
              ]}
              layout={{
                autosize: true,
                margin: { t: 20, r: 20, l: 50, b: 40 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                xaxis: { 
                    title: 'Año', 
                    gridcolor: isDark ? '#262626' : '#e5e5e5',
                    color: isDark ? '#a3a3a3' : '#525252'
                },
                yaxis: { 
                    title: 'Retorno (%)', 
                    gridcolor: isDark ? '#262626' : '#e5e5e5',
                    color: isDark ? '#a3a3a3' : '#525252',
                    zerolinecolor: isDark ? '#404040' : '#d4d4d4'
                },
                font: { family: 'inherit' },
                hovermode: 'x unified',
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
              config={{ displayModeBar: false }}
            />
        </div>
      </div>
    </div>
  );
}
