'use client';

import { ThemeProvider } from 'next-themes';
import { SimulationProvider } from '@/context/SimulationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SimulationProvider>
        {children}
      </SimulationProvider>
    </ThemeProvider>
  );
}
