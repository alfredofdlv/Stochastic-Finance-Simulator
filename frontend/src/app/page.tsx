import Link from 'next/link';
import { ArrowRight, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
          <Activity size={16} />
          <span>Simulación Financiera Profesional</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900">
          Inversión bajo <span className="text-blue-600">Estrés</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Olvídate de las proyecciones lineales del 8%. Descubre cómo se comportaría tu patrimonio 
          enfrentando crisis reales, cisnes negros y la volatilidad del mercado.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-200"
          >
            Iniciar Simulación
            <ArrowRight size={20} />
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Monte Carlo Avanzado</h3>
              <p className="text-slate-600">
                Simulamos miles de escenarios posibles usando distribuciones T-Student para capturar 
                las "colas gordas" del mercado real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Cisnes Negros</h3>
              <p className="text-slate-600">
                Introducimos eventos extremos aleatorios para probar la resiliencia de tu estrategia 
                ante crisis inesperadas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Backtesting Real</h3>
              <p className="text-slate-600">
                Viaja al pasado y comprueba cómo habría funcionado tu plan si hubieras empezado 
                en 2008, 2000 o 1987.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500 text-sm">
        <p>© 2025 Finance Simulator. Powered by FastAPI & Next.js.</p>
      </footer>
    </div>
  );
}
