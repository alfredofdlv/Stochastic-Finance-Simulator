import { BookOpen, TrendingUp, AlertOctagon } from 'lucide-react';

export default function AcademyPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-12">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-foreground">Academia Financiera</h1>
        <p className="text-xl text-muted-foreground">
          Entiende los modelos matemáticos detrás de tus proyecciones.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <TrendingUp size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Simulación de Monte Carlo</h2>
            <p className="text-muted-foreground leading-relaxed">
              El método de Monte Carlo es una técnica matemática que predice los posibles resultados de un evento incierto. 
              En finanzas, en lugar de asumir un retorno fijo (ej. 8% anual), simulamos miles de futuros posibles basados en 
              la volatilidad histórica y el retorno medio. Esto nos permite ver no solo el resultado "promedio", sino también 
              los peores y mejores escenarios (P10 y P90).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
            <AlertOctagon size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Cisnes Negros y Fat Tails</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los modelos tradicionales (Distribución Normal) subestiman la probabilidad de eventos extremos. 
              Nuestra simulación utiliza una <strong>Distribución T-Student</strong>, que tiene "colas más gordas" (Fat Tails). 
              Esto significa que modelamos con mayor precisión los eventos de mercado extremos (Cisnes Negros), como la crisis de 2008 
              o el COVID-19, ofreciendo una visión más realista del riesgo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
