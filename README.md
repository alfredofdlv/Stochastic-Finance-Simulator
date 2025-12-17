# 📈 WealthStress-Test: Simulador Financiero Estocástico

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)

**WealthStress-Test** es una plataforma profesional de simulación financiera diseñada para inversores que buscan entender el riesgo real de sus carteras. A diferencia de las calculadoras lineales tradicionales, este sistema modela la incertidumbre del mercado utilizando matemáticas avanzadas.

🚀 **Demo en vivo:** [https://stochastic-finance-simulator-q1gio59x3-alfredofdlvs-projects.vercel.app](https://stochastic-finance-simulator-q1gio59x3-alfredofdlvs-projects.vercel.app)

## ✨ Características Principales

*   **Simulación de Monte Carlo Avanzada:** Genera miles de trayectorias posibles basadas en estadísticas históricas reales de cualquier ticker de Yahoo Finance.
*   **Modelado de "Fat Tails" (Colas Pesadas):** Utiliza la distribución **T-Student** (en lugar de la Normal) para capturar la probabilidad real de eventos extremos.
*   **Análisis de Cisnes Negros:** Inyecta eventos de estrés de mercado configurables para evaluar la resiliencia del patrimonio.
*   **Backtesting Histórico:** Compara proyecciones con datos reales del pasado para validar estrategias.
*   **Análisis de Riesgo Profundo:** Página dedicada con métricas de Max Drawdown, Probabilidad de Éxito y visualizaciones de "Montaña Rusa Emocional".
*   **Modo Experto:** Control total sobre los grados de libertad de la distribución y parámetros de volatilidad.

## 🧮 Fundamentos Matemáticos

1.  **Movimiento Browniano Geométrico (Modificado):** La evolución del precio se modela como una Ecuación Diferencial Estocástica (SDE).
2.  **Distribución T-Student:** Permite ajustar la "gordura" de las colas. Un valor de `df=3` modela mercados con alta frecuencia de crisis.
3.  **Ajuste por Inflación:** Todos los cálculos pueden visualizarse en términos de **Poder Adquisitivo Real**, descontando la inflación proyectada.

## 🏗️ Arquitectura

*   **Backend:** FastAPI (Python) + NumPy + Pandas + YFinance.
*   **Frontend:** Next.js 15 + Tailwind CSS v4 + Lucide Icons + Plotly.js.
*   **Estado:** React Context API para gestión de datos de simulación.

## 🚀 Instalación Rápida

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker (Opcional para Backend)
Si prefieres usar Docker para el backend:
```bash
cd backend
docker build -t finance-backend .
docker run -p 8000:8000 finance-backend
```

---
*Desarrollado por [Alfredo Florez](https://github.com/alfredofdlv) para inversores que no creen en las líneas rectas.*
