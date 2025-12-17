# 📈 Finance Simulator Professional

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)

Una plataforma de simulación financiera de alto rendimiento diseñada para proyectar el patrimonio bajo condiciones de estrés de mercado. A diferencia de las calculadoras de interés compuesto tradicionales, este sistema utiliza **Simulaciones de Monte Carlo** con distribuciones **T-Student** para modelar "colas gordas" (eventos extremos) y Cisnes Negros.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura moderna de microservicios desacoplados:

*   **Backend (API REST):** Construido con **FastAPI**. Se encarga de la lógica matemática pesada, generación de números aleatorios (NumPy) y procesamiento de datos financieros (Pandas/YFinance).
*   **Frontend (SPA):** Desarrollado con **Next.js (App Router)** y **Tailwind CSS**. Ofrece una experiencia de usuario fluida, visualización de datos interactiva con **Plotly.js** y diseño responsivo.

## 🧮 Fundamentos Matemáticos

1.  **Monte Carlo:** Ejecutamos miles de iteraciones para obtener un cono de probabilidad (Fan Chart) en lugar de una línea determinista.
2.  **Distribución T-Student:** En lugar de la distribución Normal (Gaussiana), usamos T-Student con bajos grados de libertad para capturar la realidad de los mercados financieros: los eventos extremos ocurren con más frecuencia de lo que predice la curva de campana.
3.  **Cisnes Negros:** Un módulo estocástico inyecta caídas de mercado severas (-20% a -50%) con una probabilidad configurable, permitiendo "estresar" la cartera.

## 🚀 Instalación y Despliegue

### Prerrequisitos
*   Python 3.10+
*   Node.js 18+

### 1. Backend (FastAPI)

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/finance-simulator.git
cd finance-simulator

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn api:app --reload
```
El backend estará disponible en `http://127.0.0.1:8000`.

### 2. Frontend (Next.js)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## 🤝 Open Source vs Privado

**Ventajas de hacerlo Open Source:**
*   **Portfolio de Alto Impacto:** Demuestra capacidad para construir sistemas complejos "Full Stack" con lógica financiera real.
*   **Feedback Comunitario:** Otros desarrolladores pueden auditar el código matemático, encontrando errores sutiles en la simulación.

**Desventajas:**
*   **Propiedad Intelectual:** Si planeas monetizar la lógica específica de "Cisne Negro" o los algoritmos de optimización, liberarlos permite que cualquiera los clone.

---
*Desarrollado con ❤️ para inversores que no creen en las líneas rectas.*
