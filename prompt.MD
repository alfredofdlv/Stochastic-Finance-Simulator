**Rol:** Actúa como un **Senior Full-Stack Engineer** y  **Fintech UX/UI Specialist** . Mi objetivo es lanzar una aplicación profesional basada en mi backend de FastAPI y las especificaciones visuales adjuntas.

#### 1. Infraestructura y Gestión de Proyecto

* **Genera un `.gitignore` completo** que incluya entornos virtuales de Python (`.venv`), dependencias de Node (`node_modules`), variables de entorno (`.env`), y archivos de caché de Next.js.
* **Redacta un `README.md` profesional** que venda el proyecto a reclutadores: sección de arquitectura (FastAPI + Next.js), fundamentos matemáticos (Monte Carlo + T-Student), y guía de instalación.
* **Crea una carpeta `/docs`** con una guía de usuario y documentación técnica de los endpoints de la API.
* **Asesoría Open Source:** Analiza brevemente los pros (exposición en portfolio, feedback) y contras (clonación de lógica propia) de hacerlo público.

#### 2. Desarrollo del Frontend (Next.js + Tailwind + Plotly.js)

Adapta la interfaz basándote fielmente en las capturas de pantalla compartidas:

**A. Estructura y Navegación:**

* Implementa un **Layout Profesional** con un **Toggle de Modo Oscuro/Claro** persistente.
* Crea un sistema de navegación mediante **Pestañas (Tabs)** o sub-páginas para: `[ 🚀 Simulador | 📈 Análisis Extra | 📚 Academia & Info ]`.

**B. Vista Principal (Simulador):**

* **Selector Maestro:** Un interruptor para cambiar entre **Modo Nominal** y **Modo Real (Poder Adquisitivo)** que afecte a todos los cálculos y gráficas.
* **Sección de KPIs (Dashboard):** Al simular, muestra tarjetas elegantes con:

  * [ ] Capital Invertido (Nominal/Real).
  * [ ] Saldo Final (Neto tras impuestos).
  * [ ] **Impuestos:** Mostrado como un desglose negativo.
  * [ ] Renta Mensual (Regla 4%).
  * [ ] Probabilidad de Meta (>€500k Real).
* **Gráfico de Composición del Patrimonio:**

  * Gráfico de barras apiladas (Stacked Bar).
  * **Colores:** Blanco (Capital Inicial), Azul Claro (Aportaciones), Azul Oscuro (Intereses).
  * **Lógica "⚠️ Black Swan":** Si `Is_Black_Swan` es true en el año X, añade una anotación con el icono ⚠️ sobre la barra indicando la caída drástica de intereses acumulados.
* **Evolución del Patrimonio (Fan Chart)**

  * **Tipo de Gráfico:** Gráfico de áreas probabilístico ( **Fan Chart** ).
  * **Ejes:**

    * **Eje Y:** "Saldo (€ Nominal)" con escala de 0 a 500k.
    * **Eje X:** "Año" con un horizonte de 0 a 20 años.
  * **Elementos Visuales:**

    * **Línea Intermitente Gris:** Representa el **Capital Invertido** (la suma lineal de las aportaciones).
    * **Línea Sólida Azul:** El **Escenario Mediano** (Percentil 50), que muestra el camino más probable de la inversión.
    * **Área Sombreada Azul Oscuro:** El  **Rango Probable (10%-90%)** . Representa el intervalo de confianza del 80% generado por la simulación de Monte Carlo.
  * **Lógica:** Permite visualizar la incertidumbre; el área se ensancha con el tiempo debido al riesgo acumulado.

**C. Vista de Análisis de Riesgo (Gráficas Extra):**

* **Gauge Chart:** Probabilidad de Meta con escala de colores (Rojo, Amarillo, Verde).
* **Métricas de Dolor (KPI Card):** Visualización del **Max Drawdown** con etiqueta de tendencia roja y el cuadro de texto educativo explicativo.
* **La Montaña Rusa Emocional:** Gráfico de barras de retornos anuales individuales. Barras verdes para positivos, rojas para negativos.

**D. Reorganización del Backtest:**

* Presenta el historial real (endpoint `/backtest`) en una vista comparativa clara, separándolo de la simulación futura para no confundir al usuario.

#### 3. Guía de Despliegue

* [ ] Proporciona pasos detallados para desplegar el **Frontend en Vercel** y el  **Backend en Railway/Render** .
* [ ] Explica cómo configurar el **CORS** en el backend para que acepte peticiones desde el dominio final del frontend.
