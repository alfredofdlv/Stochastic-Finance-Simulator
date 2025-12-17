# 📈 Simulador de Estrés Financiero: Monte Carlo & Black Swans

Este proyecto es una herramienta avanzada de planificación financiera diseñada para inversores que buscan entender la realidad estadística de los mercados. A diferencia de las calculadoras de interés compuesto tradicionales que utilizan una progresión lineal o una distribución normal simplista, este simulador utiliza **Simulaciones de Monte Carlo** con distribuciones de **"Colas Pesadas" (Fat Tails)** para modelar el riesgo real de una cartera indexada.

## 🚀 Características Principales

* **Simulación Probabilística de Monte Carlo** : Ejecuta 1,000 escenarios posibles basados en la volatilidad histórica real de activos como el S&P 500, MSCI World o carteras mixtas.
* **Modelado T-Student** : Utiliza una distribución T-Student para capturar eventos extremos (crisis y booms) con mayor precisión que una campana de Gauss tradicional.
* **Eventos de "Cisne Negro" (Black Swans)** : Probabilidad estocástica de caídas sistémicas severas (entre -20% y -50%) para poner a prueba la resiliencia de la cartera.
* **Datos Reales (Yahoo Finance)** : Obtención automática de retornos y volatilidad histórica mediante la API de `yfinance`.
* **Ajuste de Inflación y Poder Adquisitivo** : Permite visualizar los resultados en valor nominal o en valor real (deflactado), proporcionando una visión honesta del futuro financiero.
* **Gestión de Aportaciones Dinámicas** : Interfaz editable para definir tramos de inversión a lo largo de décadas.
* **Análisis de Riesgo (Max Drawdown)** : Calcula la mayor caída histórica esperada en el escenario mediano para medir la tolerancia al riesgo del usuario.

## 🛠️ Stack Tecnológico

* **Lenguaje:** Python 3.9+
* **Framework Web:** Streamlit
* **Cálculo Numérico:** NumPy & Pandas
* **Visualización:** Plotly (Fan Charts, Barras Apiladas, Gauge Charts)
* **API Financiera:** yfinance (Yahoo Finance)

---

## 🔬 Fundamentos Matemáticos

El simulador calcula el retorno anualizado **$r_t$** siguiendo una distribución T-Student estandarizada:

$$
r_t = \mu + \sigma \cdot \frac{T(df)}{\sqrt{df/(df-2)}}
$$

Donde:

* **$\mu$**: Retorno medio histórico.
* **$\sigma$**: Volatilidad (desviación estándar).
* **$df$**: Grados de libertad (ajustable en el Modo Experto para aumentar el riesgo de cola).

Además, implementa la **Regla del 4%** para calcular la renta mensual segura que el patrimonio final podría generar sin agotarse.

---

## 💻 Instalación Local

Si deseas ejecutar este proyecto localmente, sigue estos pasos:

1. **Clonar el repositorio:**
   **Bash**

   ```
   git clone https://github.com/tu-usuario/simulador-financiero.git
   cd simulador-financiero
   ```
2. **Instalar dependencias:**
   **Bash**

   ```
   pip install -r requirements.txt
   ```
3. **Ejecutar la aplicación:**
   **Bash**

   ```
   streamlit run app.py
   ```
