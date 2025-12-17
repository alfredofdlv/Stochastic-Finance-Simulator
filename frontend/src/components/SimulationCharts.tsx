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
  };

  // 1. Fan Chart (Future)
  const fanChartData = simulationData.fan_chart;
  const years = fanChartData.map(d => d.Year);
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
    },
    // Median
    {
      x: years,
      y: fanChartData.map(d => d[`Median${suffix}` as keyof typeof d]),
      type: 'scatter',
      mode: 'lines',
      line: { color: isDark ? '#60a5fa' : '#0068C9', width: 3 },
      name: `Mediana (${isReal ? 'Real' : 'Nominal'})`,
    }
  ];

  // 2. Portfolio Composition (Stacked Bar)
  const compData = simulationData.portfolio_composition || [];
  const compYears = compData.map(d => d.Year);
  
  const compositionTraces: any[] = [
    {
      x: compYears,
      y: compData.map(d => d["Capital Inicial"]),
      type: 'bar',
      name: 'Capital Inicial',
      marker: { color: isDark ? '#94a3b8' : '#cbd5e1' }
    },
    {
      x: compYears,
      y: compData.map(d => d["Aportaciones"]),
      type: 'bar',
      name: 'Aportaciones',
      marker: { color: isDark ? '#60a5fa' : '#3b82f6' }
    },
    {
      x: compYears,
      y: compData.map(d => d["Interés Compuesto"]),
      type: 'bar',
      name: 'Interés Compuesto',
      marker: { color: isDark ? '#34d399' : '#10b981' }
    }
  ];

  // Add Black Swan annotations if any
  const blackSwanYears = compData.filter(d => d.Is_Black_Swan).map(d => d.Year);
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
      x: simulationData.median_scenario.map(d => d.Año),
      y: simulationData.median_scenario.map(d => d["Retorno (%)"]),
      type: 'bar',
      marker: {
        color: simulationData.median_scenario.map(d => d["Retorno (%)"] >= 0 ? '#10b981' : '#ef4444')
      },
      name: 'Retorno Anual %'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 mb-6 overflow-x-auto">
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
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[400px]">
        {activeTab === 'future' && (
          <PlotlyChart
            data={fanChartTraces}
            layout={{ ...commonLayout, title: `Proyección de Patrimonio (${isReal ? 'Real' : 'Nominal'})` }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {activeTab === 'composition' && (
          <PlotlyChart
            data={compositionTraces}
            layout={{ 
              ...commonLayout, 
              title: 'Composición del Patrimonio', 
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
              layout={{ ...commonLayout, title: 'Backtest Histórico (Ajustado a Inflación)' }}
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
            layout={{ ...commonLayout, title: 'Retornos Anuales (Volatilidad)' }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
