import { BookOpen, TrendingUp, AlertOctagon, Sigma, BarChart4 } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function AcademyPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-foreground">Academia Financiera</h1>
        <p className="text-xl text-muted-foreground">
          Entiende los modelos matemáticos detrás de tus proyecciones.
        </p>
      </div>

      <section className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <TrendingUp size={32} />
          </div>
          <div className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold text-foreground">Simulación de Monte Carlo</h2>
            <p className="text-muted-foreground leading-relaxed">
              El método de Monte Carlo es una técnica matemática que predice los posibles resultados de un evento incierto. 
              En finanzas, en lugar de asumir un retorno fijo (ej. 8% anual), simulamos miles de futuros posibles basados en 
              la volatilidad histórica y el retorno medio.
            </p>
            
            <div className="bg-accent/30 p-6 rounded-xl border border-border/50 my-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Modelo Matemático (Movimiento Browniano Geométrico)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La evolución del precio del activo <InlineMath math="S_t" /> se modela mediante la siguiente ecuación diferencial estocástica:
              </p>
              <div className="overflow-x-auto py-2">
                <BlockMath math="dS_t = \mu S_t dt + \sigma S_t dW_t" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Donde:<br/>
                • <InlineMath math="\mu" /> es el retorno esperado (drift).<br/>
                • <InlineMath math="\sigma" /> es la volatilidad.<br/>
                • <InlineMath math="dW_t" /> es un proceso de Wiener (ruido aleatorio).
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Esto nos permite ver no solo el resultado "promedio", sino también los peores y mejores escenarios (P10 y P90), 
              creando el "abanico" de probabilidades que ves en el gráfico de proyección.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
            <AlertOctagon size={32} />
          </div>
          <div className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold text-foreground">Cisnes Negros y Fat Tails</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los modelos tradicionales (Distribución Normal) subestiman la probabilidad de eventos extremos. 
              Nuestra simulación utiliza una <strong>Distribución T-Student</strong>, que tiene "colas más gordas" (Fat Tails).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-background p-4 rounded-lg border border-border text-center">
                <div className="h-32 flex items-end justify-center gap-1 mb-2">
                  {/* Simple CSS visualization of Normal Distribution */}
                  {[10, 20, 40, 70, 90, 70, 40, 20, 10].map((h, i) => (
                    <div key={i} className="w-4 bg-blue-400/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <p className="text-xs font-medium">Distribución Normal</p>
                <p className="text-[10px] text-muted-foreground">Subestima riesgos extremos</p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border text-center">
                <div className="h-32 flex items-end justify-center gap-1 mb-2 relative">
                  {/* Simple CSS visualization of Fat Tails */}
                  {[15, 25, 35, 60, 80, 60, 35, 25, 15].map((h, i) => (
                    <div key={i} className="w-4 bg-red-400/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                  {/* Fat tails markers */}
                  <div className="absolute bottom-0 left-0 w-8 h-4 bg-red-500/80 animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-4 bg-red-500/80 animate-pulse"></div>
                </div>
                <p className="text-xs font-medium">T-Student (Fat Tails)</p>
                <p className="text-[10px] text-muted-foreground">Captura Cisnes Negros</p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Esto significa que modelamos con mayor precisión los eventos de mercado extremos, como la crisis de 2008 
              o el COVID-19, ofreciendo una visión más realista del riesgo que una calculadora de interés compuesto tradicional.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
