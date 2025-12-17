'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SimulationResponse, BacktestResponse } from '@/types';
import { SimulationConfig } from '@/components/Sidebar';

interface SimulationContextType {
  isReal: boolean;
  setIsReal: (value: boolean) => void;
  simulationData: SimulationResponse | null;
  setSimulationData: (data: SimulationResponse | null) => void;
  backtestData: BacktestResponse | null;
  setBacktestData: (data: BacktestResponse | null) => void;
  currentConfig: SimulationConfig | undefined;
  setCurrentConfig: (config: SimulationConfig | undefined) => void;
  hasRun: boolean;
  setHasRun: (value: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isReal, setIsReal] = useState(true);
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [backtestData, setBacktestData] = useState<BacktestResponse | null>(null);
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig | undefined>(undefined);
  const [hasRun, setHasRun] = useState(false);

  return (
    <SimulationContext.Provider value={{
      isReal,
      setIsReal,
      simulationData,
      setSimulationData,
      backtestData,
      setBacktestData,
      currentConfig,
      setCurrentConfig,
      hasRun,
      setHasRun
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
