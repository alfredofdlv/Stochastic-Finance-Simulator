# 🎨 WealthStress-Test Frontend

Este es el cliente web de **WealthStress-Test**, construido con las tecnologías más modernas de React y Next.js para ofrecer una herramienta financiera de grado profesional.

## 🚀 Tecnologías Utilizadas

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) con soporte nativo para Dark Mode.
*   **Gráficos:** [Plotly.js](https://plotly.com/javascript/) para visualizaciones científicas y financieras complejas.
*   **Iconos:** [Lucide React](https://lucide.dev/).
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/) y [React CountUp](https://github.com/glennreyes/react-countup).
*   **Tipografía:** [Geist](https://vercel.com/font).
*   **Matemáticas:** [KaTeX](https://katex.org/) para renderizado de fórmulas en la Academia.

## 📂 Estructura del Proyecto

*   `src/app/`: Rutas y páginas principales (Dashboard, Academia, Análisis de Riesgo).
*   `src/components/`: Componentes reutilizables (Gráficos, Formularios, Sidebar, KPIs).
*   `src/context/`: Gestión del estado global mediante React Context.
*   `src/lib/`: Utilidades y cliente de API (Axios).
*   `src/types/`: Definiciones de TypeScript para asegurar la integridad de los datos.

## 💡 Características Destacadas

1.  **Dashboard Interactivo:** Configuración en tiempo real de parámetros de inversión.
2.  **Visualización de Abanico (Fan Chart):** Muestra la dispersión de resultados probables (P10, Mediana, P90).
3.  **Análisis de Composición:** Gráfico de barras apiladas que separa Capital Inicial, Aportaciones e Interés Compuesto.
4.  **Academia Financiera:** Sección educativa para entender los modelos matemáticos (Movimiento Browniano, T-Student).
5.  **Análisis de Riesgo:** Métricas avanzadas como Max Drawdown y Probabilidad de Éxito con visualizaciones dedicadas.

## 🛠️ Desarrollo

### Instalación
```bash
npm install
```

### Ejecución
```bash
npm run dev
```

### Construcción para Producción
```bash
npm run build
npm start
```

## 🎨 Temas
La aplicación soporta **Modo Claro** y **Modo Oscuro** automáticamente basándose en la preferencia del sistema, utilizando variables semánticas de Tailwind para una consistencia visual total.
