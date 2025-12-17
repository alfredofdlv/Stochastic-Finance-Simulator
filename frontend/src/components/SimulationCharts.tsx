'use client';

import { useState, useEffect } from 'react';
import { SimulationResponse, BacktestResponse } from '@/types';
import PlotlyChart from './PlotlyChart';
import { Layout } from 'plotly.js';
import { useTheme } from 'next-themes';

interface SimulationChartsProps {
  simulationData: SimulationResponse | null;
  backtestData: BacktestResponse | null;
  isReal: boolean;
}

export default function SimulationCharts({ simulationData, backtestData, isReal }: SimulationChartsProps) {
  const [activeTab, setActiveTab] = useState<'future' | 'composition' | 'past' | 'psychology'>('future');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!simulationData) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
        <p className="text-slate-400 dark:text-slate-500">Ejecuta una simulación para ver los resultados</p>
      </div>
    );
  }

  // --- Chart Configurations ---
  const backtestStartYear = backtestData?.history?.[0]?.Date 
    ? new Date(backtestData.history[0].Date).getFullYear() 
    : new Date().getFullYear();
  
  const startYear = backtestData ? backtestStartYear : new Date().getFullYear();
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const commonLayout: Partial<Layout> = {
    autosize: true,
    margin: { l: 50, r: 20, t: 40, b: 40 },
    showlegend: true,
    legend: { orientation: 'h', y: 1.1, font: { color: isDark ? '#cbd5e1' : '#475569' } },
    font: { family: 'sans-serif', color: isDark ? '#cbd5e1' : '#475569' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { 
      showgrid: false, 
      gridcolor: isDark ? '#334155' : '#f1f5f9',
      tickfont: { color: isDark ? '#94a3b8' : '#64748b' }
    },
    yaxis: { 
      showgrid: true, 
      gridcolor: isDark ? '#334155' : '#f1f5f9',
      tickfont: { color: isDark ? '#94a3b8' : '#64748b' }
    },
    hovermode: 'x unified',
  };

  // 1. Fan Chart (Future)
  const fanChartData = simulationData.fan_chart;
  const years = fanChartData.map(d => d.Year + startYear);
  const suffix = isReal ? '_Real' : '_Nominal';
  
  const fanChartTraces: any[] = [
    // P10-P90 Area
    {
      x: years,
      y: fanChartData.map(d => d[`P90${suffix}` as keyof typeof d]),
      type: 'scatter',
      mode: 'lines',
      line: { width: 0 },
      name: 'P90',
      showlegend: false,
      hoverinfo: 'skip'
    },
    {
      x: years,
      y: fanChartData.map(d => d[`P10${suffix}` as keyof typeof d]),
      type: 'scatter',
      mode: 'lines',
      line: { width: 0 },
      fill: 'tonexty',
      fillcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 104, 201, 0.2)',
      name: 'Rango Probable (P10-P90)',
      hovertemplate: 'Rango (P10-P90): %{y:,.0f}€<extra></extra>'
    },
    // Median
    {
      x: years,
      y: fanChartData.map(d => d[`Median${suffix}` as keyof typeof d]),
      type: 'scatter',
      mode: 'lines',
      line: { color: isDark ? '#60a5fa' : '#0068C9', width: 3 },
      name: `Mediana (${isReal ? 'Real' : 'Nominal'})`,
      hovertemplate: 'Mediana: %{y:,.0f}€<extra></extra>'
    },
    // Invested Capital (Benchmark)
    {
      x: years,
      y: fanChartData.map(d => d[`Invested${isReal ? '_Real' : ''}` as keyof typeof d]),
      type: 'scatter',
      mode: 'lines',
      line: { color: isDark ? '#94a3b8' : '#64748b', width: 2, dash: 'dot' },
      name: 'Capital Invertido',
      hovertemplate: 'Invertido: %{y:,.0f}€<extra></extra>'
    }
  ];

  // 2. Portfolio Composition (Stacked Bar)
  const compData = simulationData.portfolio_composition || [];
  const compYears = compData.map(d => d.Year + startYear);
  
  const compositionTraces: any[] = [
    {
      x: compYears,
      y: compData.map(d => d["Capital Inicial"]),
      type: 'bar',
      name: 'Capital Inicial',
      marker: { color: '#f97316' } // Orange
    },
    {
      x: compYears,
      y: compData.map(d => d["Aportaciones"]),
      type: 'bar',
      name: 'Aportaciones',
      marker: { color: '#0068C9' }
    },
    {
      x: compYears,
      y: compData.map(d => d["Interés Compuesto"]),
      type: 'bar',
      name: 'Interés Compuesto',
      marker: { color: '#10b981' }
    }
  ];

  // Add Black Swan annotations if any
  const blackSwanYears = compData.filter(d => d.Is_Black_Swan).map(d => d.Year + startYear);
  const blackSwanShapes = blackSwanYears.map(year => ({
    type: 'line',
    x0: year,
    y0: 0,
    x1: year,
    y1: 1,
    xref: 'x',
    yref: 'paper',
    line: {
      color: isDark ? '#f87171' : '#ef4444',
      width: 1,
      dash: 'dot'
    }
  }));

  const blackSwanAnnotations = blackSwanYears.map(year => ({
    x: year,
    y: 1,
    xref: 'x',
    yref: 'paper',
    text: '⚠️',
    showarrow: false,
    font: { size: 16 },
    hovertext: 'Evento de Cisne Negro: Caída significativa del mercado',
    yshift: 10
  }));

  // 3. Backtest Chart (Past)
  let backtestTraces: any[] = [];
  if (backtestData) {
    const dates = backtestData.history.map(d => d.Date);
    backtestTraces = [
      {
        x: dates,
        y: backtestData.history.map(d => d.Invested),
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        fillcolor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(200, 200, 200, 0.2)',
        line: { color: isDark ? '#64748b' : '#94a3b8', width: 2 },
        name: 'Capital Invertido',
      },
      {
        x: dates,
        y: backtestData.history.map(d => d.Balance_Real),
        type: 'scatter',
        mode: 'lines',
        line: { color: isDark ? '#60a5fa' : '#0068C9', width: 2 },
        name: 'Saldo Real',
      }
    ];
  }

  // 4. Psychology Chart (Annual Returns)
  const psychologyTraces: any[] = [
    {
      x: simulationData.median_scenario.map(d => d.Año + startYear),
      y: simulationData.median_scenario.map(d => d["Retorno (%)"]),
      type: 'bar',
      marker: {
        color: simulationData.median_scenario.map(d => d["Retorno (%)"] >= 0 ? '#10b981' : '#ef4444')
      },
      name: 'Retorno Anual %'
    }
  ];

  // Last Year Widget Data
  const lastPoint = fanChartData[fanChartData.length - 1];
  const lastYear = years[years.length - 1];
  const lastMedian = lastPoint[`Median${suffix}` as keyof typeof lastPoint] as number;
  const lastP10 = lastPoint[`P10${suffix}` as keyof typeof lastPoint] as number;
  const lastP90 = lastPoint[`P90${suffix}` as keyof typeof lastPoint] as number;

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border h-full flex flex-col transition-colors relative">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6 overflow-x-auto">
        {[
          { id: 'future', label: 'Proyección' },
          { id: 'composition', label: 'Composición' },
          { id: 'past', label: 'Backtest' },
          { id: 'psychology', label: 'Riesgo' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[400px] relative">
        {/* Last Year Widget */}
        {activeTab === 'future' && (
          <div className="absolute top-0 right-0 md:right-10 bg-background/80 backdrop-blur-md p-3 rounded-lg border border-border shadow-sm z-10 text-xs md:text-sm pointer-events-none">
             <h4 className="font-semibold mb-1 text-foreground">Año {lastYear} (Final)</h4>
             <div className="space-y-0.5">
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Mediana:</span>
                    <span className="font-medium text-blue-500">{formatCurrency(lastMedian)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Rango (P10-P90):</span>
                    <span className="font-medium text-foreground">
                        {formatCurrency(lastP10)} - {formatCurrency(lastP90)}
                    </span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'future' && (
          <PlotlyChart
            data={fanChartTraces}
            layout={{ 
              ...commonLayout, 
              title: { text: `Proyección de Patrimonio (${isReal ? 'Real' : 'Nominal'})` },
              annotations: [
                {
                  x: 0.05,
                  y: 0.95,
                  xref: 'paper',
                  yref: 'paper',
                  text: 'El área sombreada representa el 80% de los escenarios probables (P10 a P90)',
                  showarrow: false,
                  font: { size: 10, color: isDark ? '#94a3b8' : '#64748b' },
                  align: 'left'
                }
              ]
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {activeTab === 'composition' && (
          <PlotlyChart
            data={compositionTraces}
            layout={{ 
              ...commonLayout, 
              title: { text: 'Composición del Patrimonio' }, 
              barmode: 'stack',
              shapes: blackSwanShapes as any,
              annotations: blackSwanAnnotations as any
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}
        
        {activeTab === 'past' && (
          backtestData ? (
            <PlotlyChart
              data={backtestTraces}
              layout={{ ...commonLayout, title: { text: 'Backtest Histórico (Ajustado a Inflación)' } }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
              No hay datos de backtest disponibles.
            </div>
          )
        )}

        {activeTab === 'psychology' && (
          <PlotlyChart
            data={psychologyTraces}
            layout={{ ...commonLayout, title: { text: 'Retornos Anuales (Volatilidad)' } }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
