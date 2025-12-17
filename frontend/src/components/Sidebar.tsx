'use client';

import ConfigurationForm, { SimulationConfig } from './ConfigurationForm';

interface SidebarProps {
  onRunSimulation: (config: SimulationConfig) => void;
  isLoading: boolean;
  currentConfig?: SimulationConfig;
}

export type { SimulationConfig };

export default function Sidebar({ onRunSimulation, isLoading, currentConfig }: SidebarProps) {
  return (
    <aside className="w-full md:w-80 bg-card border-r border-border h-full overflow-y-auto p-6 flex flex-col gap-6 shadow-sm z-10 transition-colors">
      <ConfigurationForm 
        onRunSimulation={onRunSimulation} 
        isLoading={isLoading} 
        initialConfig={currentConfig}
        variant="sidebar"
      />
    </aside>
  );
}
