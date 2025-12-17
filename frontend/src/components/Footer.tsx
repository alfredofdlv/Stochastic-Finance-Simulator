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
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Finance Simulator. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
