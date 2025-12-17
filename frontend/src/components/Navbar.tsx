'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, BookOpen, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import MasterSwitch from './MasterSwitch';
import { useSimulation } from '@/context/SimulationContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isReal, setIsReal } = useSimulation();

  const navItems = [
    { name: 'Simulador', href: '/simulator', icon: LayoutDashboard },
    { name: 'Análisis de Riesgo', href: '/risk-analysis', icon: BarChart3 },
    { name: 'Academia', href: '/academy', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span>Finance Simulator</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <MasterSwitch isReal={isReal} onChange={setIsReal} />
          </div>
          <div className="h-6 w-px bg-border mx-2 hidden md:block" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
