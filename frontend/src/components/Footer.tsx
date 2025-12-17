export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Finance Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Herramientas profesionales para la proyección patrimonial y análisis de riesgo financiero.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/simulator" className="hover:text-primary transition-colors">Simulador Monte Carlo</a></li>
              <li><a href="/risk-analysis" className="hover:text-primary transition-colors">Análisis de Riesgo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/academy" className="hover:text-primary transition-colors">Academia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 WealthStress-Test. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="mailto:alfredoflorezdelavega@gmail.com" className="hover:text-foreground transition-colors">Contacto</a>
            <a href="https://github.com/alfredofdlv/Stochastic-Finance-Simulator" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Código (GitHub)</a>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-muted-foreground/60 text-center max-w-4xl mx-auto leading-relaxed">
          <strong>Disclaimer Financiero:</strong> Esta herramienta es exclusivamente para fines educativos e informativos. No constituye asesoramiento financiero, fiscal o legal profesional. Los resultados de las simulaciones (Monte Carlo) son proyecciones probabilísticas basadas en datos históricos y modelos matemáticos, y no garantizan resultados futuros. Las inversiones conllevan riesgos, incluida la posible pérdida del capital invertido.
        </div>
      </div>
    </footer>
  );
}
