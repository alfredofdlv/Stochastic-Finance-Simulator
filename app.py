import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from finance_sim import run_monte_carlo_simulation, calculate_kpis

st.set_page_config(page_title="Tu Futuro Financiero", layout="wide", page_icon="📈")

# --- Header Profesional ---
st.title("📈 Tu Futuro Financiero")
st.markdown("""
**Proyección de Patrimonio basada en Monte Carlo y Eventos de Mercado.**  
Esta herramienta simula miles de escenarios posibles para tu inversión en el **Vanguard Global Stock Index**, 
incorporando volatilidad realista, impuestos y eventos de "Cisne Negro".
""")

# --- Sidebar ---
st.sidebar.header("⚙️ Configuración de Inversión")

initial_capital = st.sidebar.number_input("Capital Inicial (€)", min_value=0.0, value=10000.0, step=1000.0)

st.sidebar.subheader("📅 Plan de Aportaciones")
st.sidebar.info("Define tramos de inversión. Ej: 10 años a 500€, luego 10 años a 1000€.")

# Data Editor para aportaciones dinámicas
default_schedule = pd.DataFrame([
    {"Años": 10, "Mensualidad (€)": 500.0},
    {"Años": 10, "Mensualidad (€)": 1000.0}
])
edited_schedule = st.sidebar.data_editor(default_schedule, num_rows="dynamic", hide_index=True)

# Validación de Aportaciones
if edited_schedule.empty or edited_schedule["Años"].sum() == 0:
    st.error("⚠️ Por favor, define al menos un tramo de aportación con años > 0.")
    st.stop()

# Calcular duración total
total_years = int(edited_schedule["Años"].sum())
st.sidebar.write(f"**Duración Total:** {total_years} años")

st.sidebar.subheader("📊 Estrategia de Inversión")

# Selector de Estrategia
STRATEGIES = {
    "Personalizado": None,
    "Vanguard Global (VWRL.AS)": "VWRL.AS",
    "S&P 500 (SPY)": "SPY",
    "MSCI World (URTH)": "URTH"
}

selected_strategy = st.sidebar.selectbox("Selecciona un Índice / ETF:", list(STRATEGIES.keys()))

# Variables de estado para guardar los valores calculados
if "mean_return_val" not in st.session_state:
    st.session_state.mean_return_val = 8.0
if "volatility_val" not in st.session_state:
    st.session_state.volatility_val = 15.0

# Lógica para actualizar datos si se selecciona una estrategia real
ticker = STRATEGIES[selected_strategy]
if ticker:
    from finance_sim import get_historical_stats
    with st.spinner(f"Obteniendo datos históricos de {ticker}..."):
        stats = get_historical_stats(ticker)
        if stats:
            st.session_state.mean_return_val = float(stats["mean_return"] * 100)
            st.session_state.volatility_val = float(stats["volatility"] * 100)
            st.sidebar.success(f"Datos cargados: Retorno {stats['mean_return']*100:.1f}% | Vol {stats['volatility']*100:.1f}%")
        else:
            st.sidebar.error("No se pudieron obtener datos. Usando valores anteriores.")

# Inputs numéricos vinculados al session_state
mean_return_input = st.sidebar.number_input(
    "Retorno Medio Anual (%)", 
    value=st.session_state.mean_return_val, 
    step=0.1,
    format="%.1f"
)
volatility_input = st.sidebar.number_input(
    "Volatilidad (%)", 
    value=st.session_state.volatility_val, 
    step=0.1,
    format="%.1f"
)

# Actualizar session_state si el usuario cambia manualmente los inputs
st.session_state.mean_return_val = mean_return_input
st.session_state.volatility_val = volatility_input

black_swan_enabled = st.sidebar.toggle("Activar 'Black Swans' (Crisis)", value=True)
inflation_rate_input = st.sidebar.number_input("Inflación Estimada (%)", value=2.0, step=0.5)
tax_rate_input = st.sidebar.number_input("Tasa Impositiva (%)", min_value=0.0, max_value=100.0, value=19.0)
financial_goal = st.sidebar.number_input("Meta Financiera (€)", value=500000.0, step=10000.0)

# Modo Experto
with st.sidebar.expander("🧠 Modo Experto"):
    t_df_input = st.slider("Grados de Libertad (T-Student)", min_value=1, max_value=30, value=3, help="Menor valor = Colas más gordas (más eventos extremos). 30 se acerca a Normal.")

# Footer Profesional
st.sidebar.markdown("---")
st.sidebar.markdown("""
<div style='text-align: center; color: gray; font-size: 0.8em;'>
    Desarrollado por <b>GitHub Copilot</b> <br>
    Datos simulados basados en rendimientos históricos del Vanguard Global Stock.
</div>
""", unsafe_allow_html=True)

# Parámetros avanzados
MEAN_RETURN = mean_return_input / 100.0
VOLATILITY = volatility_input / 100.0
BLACK_SWAN_PROB = 0.02
INFLATION_RATE = inflation_rate_input / 100.0

# Lógica de Ejecución y Persistencia
if st.sidebar.button("🚀 Ejecutar Simulación", type="primary"):
    
    # Convertir DataFrame a lista de tuplas
    contribution_schedule = []
    for index, row in edited_schedule.iterrows():
        if row["Años"] > 0 and row["Mensualidad (€)"] >= 0:
            contribution_schedule.append((row["Años"], row["Mensualidad (€)"]))
    
    if not contribution_schedule:
        st.error("⚠️ Revisa la tabla de aportaciones. Los años deben ser > 0 y las mensualidades >= 0.")
        st.stop()

    # --- Ejecutar Lógica ---
    with st.spinner('Simulando 1,000 escenarios de mercado...'):
        # Guardamos los resultados en session_state
        st.session_state.sim_results = run_monte_carlo_simulation(
            initial_capital=initial_capital,
            contribution_schedule=contribution_schedule,
            mean_return=MEAN_RETURN,
            volatility=VOLATILITY,
            black_swan_enabled=black_swan_enabled,
            black_swan_prob=BLACK_SWAN_PROB,
            inflation_rate=INFLATION_RATE,
            num_simulations=1000,
            t_df=t_df_input
        )

# Verificar si hay resultados en memoria para mostrar
if "sim_results" in st.session_state:
    summary_df, median_details, breakdown_df, sim_stats, final_balances_real = st.session_state.sim_results
    
    # Toggle Vista Real vs Nominal
    view_mode = st.radio("Modo de Visualización:", ["Nominal (Sin ajustar)", "Real (Poder Adquisitivo)"], horizontal=True)
    is_real = view_mode == "Real (Poder Adquisitivo)"
    
    # Seleccionar datos según modo
    if is_real:
        median_final_balance = summary_df["Median_Real"].iloc[-1]
        invested_val = summary_df["Invested_Real"].iloc[-1]
        p10_col, p50_col, p90_col = "P10_Real", "Median_Real", "P90_Real"
        invested_col = "Invested_Real"
    else:
        median_final_balance = summary_df["Median_Nominal"].iloc[-1]
        invested_val = summary_df["Invested"].iloc[-1]
        p10_col, p50_col, p90_col = "P10_Nominal", "Median_Nominal", "P90_Nominal"
        invested_col = "Invested"

    total_contributed = breakdown_df["Aportaciones"].iloc[-1]
    
    kpis = calculate_kpis(
        0, 
        invested_val, 
        median_final_balance, 
        tax_rate_input / 100.0
    )
    
    # Probabilidad de Éxito (Meta) - Siempre calculada sobre valor REAL para ser honestos
    success_prob = (final_balances_real >= financial_goal).mean() * 100
    
    # Regla del 4% (Renta Mensual Segura)
    safe_withdrawal_rate = (median_final_balance * 0.04) / 12
    
    # --- TABS ---
    tab1, tab2, tab3 = st.tabs(["🚀 Simulador", "📊 Análisis de Riesgo", "📚 Academia del Inversor"])
    
    with tab1:
        # --- Visualización de KPIs ---
        st.markdown("### 🎯 Resultados Clave (Escenario Mediano)")
        
        # Estilo CSS para KPIs (Compatible con Dark/Light Mode)
        st.markdown("""
        <style>
        div[data-testid="stMetric"] {
            background-color: rgba(128, 128, 128, 0.1);
            border: 1px solid rgba(128, 128, 128, 0.2);
            padding: 10px;
            border-radius: 5px;
        }
        </style>
        """, unsafe_allow_html=True)
        
        kpi1, kpi2, kpi3, kpi4 = st.columns(4)
        
        kpi1.metric(
            label=f"Capital Invertido ({'Real' if is_real else 'Nominal'})", 
            value=f"€{kpis['Capital Total Invertido']:,.0f}",
            help="Valor del capital aportado (ajustado por inflación en modo Real)."
        )
        
        kpi2.metric(
            label=f"Saldo Final ({'Real' if is_real else 'Nominal'})", 
            value=f"€{kpis['Saldo Final Neto']:,.0f}",
            delta=f"Impuestos: -€{kpis['Impuestos Estimados']:,.0f}",
            help="Dinero disponible después de impuestos."
        )
        
        kpi3.metric(
            label="Renta Mensual (Regla 4%)", 
            value=f"€{safe_withdrawal_rate:,.0f}/mes",
            help="Dinero que podrías retirar mensualmente sin agotar el capital (teóricamente)."
        )
        
        kpi4.metric(
            label=f"Prob. Meta (>€{financial_goal/1000:.0f}k Real)", 
            value=f"{success_prob:.1f}%",
            help="Probabilidad de superar tu meta financiera en términos de poder adquisitivo real."
        )
        
        st.markdown("---")

        # --- Gráfico Fan Chart ---
        st.subheader("📈 Evolución del Patrimonio (Fan Chart)")
        
        fig_fan = go.Figure()
        
        # Área de incertidumbre (P10 a P90)
        fig_fan.add_trace(go.Scatter(
            x=summary_df["Year"], y=summary_df[p10_col],
            mode='lines', line=dict(width=0), showlegend=False, name='Pesimista (P10)'
        ))
        
        fig_fan.add_trace(go.Scatter(
            x=summary_df["Year"], y=summary_df[p90_col],
            mode='lines', line=dict(width=0), fill='tonexty',
            fillcolor='rgba(0, 100, 255, 0.15)', name='Rango Probable (10%-90%)'
        ))
        
        # Línea Mediana
        fig_fan.add_trace(go.Scatter(
            x=summary_df["Year"], y=summary_df[p50_col],
            mode='lines', line=dict(color='#0068C9', width=3), name='Escenario Mediano'
        ))
        
        # Capital Invertido (Real o Nominal según selección)
        fig_fan.add_trace(go.Scatter(
            x=summary_df["Year"], y=summary_df[invested_col],
            mode='lines', line=dict(color='gray', dash='dash', width=2), name='Capital Invertido'
        ))
        
        fig_fan.update_layout(
            xaxis_title="Año", yaxis_title=f"Saldo (€ {'Real' if is_real else 'Nominal'})",
            hovermode="x unified", template="plotly_white",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=20, r=20, t=50, b=20)
        )
        st.plotly_chart(fig_fan, use_container_width=True)
        
        # --- Gráfico de Barras Apiladas con Alertas ---
        st.subheader("💰 Composición del Patrimonio")
        
        fig_bar = go.Figure()
        
        fig_bar.add_trace(go.Bar(
            x=breakdown_df["Year"], y=breakdown_df["Capital Inicial"],
            name='Capital Inicial', marker_color='#E0E0E0'
        ))
        
        fig_bar.add_trace(go.Bar(
            x=breakdown_df["Year"], y=breakdown_df["Aportaciones"],
            name='Aportaciones Acumuladas', marker_color='#83C9FF'
        ))
        
        fig_bar.add_trace(go.Bar(
            x=breakdown_df["Year"], y=breakdown_df["Interés Compuesto"],
            name='Interés Generado', marker_color='#0068C9'
        ))
        
        # Añadir anotaciones para Black Swans
        annotations = []
        for idx, row in breakdown_df.iterrows():
            if row.get("Is_Black_Swan", False):
                annotations.append(dict(
                    x=row["Year"],
                    y=row["Capital Inicial"] + row["Aportaciones"] + row["Interés Compuesto"],
                    text="⚠️",
                    showarrow=False,
                    yshift=10,
                    font=dict(size=15)
                ))
        
        fig_bar.update_layout(
            barmode='stack',
            xaxis_title="Año", yaxis_title="Valor (€)",
            template="plotly_white",
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=20, r=20, t=50, b=20),
            annotations=annotations
        )
        st.plotly_chart(fig_bar, use_container_width=True)
        
        # --- Tabla Detallada ---
        with st.expander("📋 Ver Tabla de Datos Detallada"):
            details_df = pd.DataFrame(median_details)
            
            # Formateo
            display_df = details_df.copy()
            cols_money = ["Saldo Inicial", "Aportación Anual", "Interés Generado", "Saldo Final"]
            for col in cols_money:
                display_df[col] = display_df[col].apply(lambda x: f"€{x:,.2f}")
            display_df["Retorno (%)"] = display_df["Retorno (%)"].apply(lambda x: f"{x:.2f}%")
            
            st.dataframe(display_df, use_container_width=True)
            
            # --- Exportar CSV ---
            csv = details_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Descargar Datos (CSV)",
                data=csv,
                file_name='simulacion_avanzada.csv',
                mime='text/csv',
            )

    with tab2:
        st.markdown("### 📊 Análisis de Riesgo Profundo")
        
        col_risk1, col_risk2 = st.columns(2)
        
        with col_risk1:
            # --- Gráfico de Probabilidad de Meta (Gauge) ---
            st.subheader("Probabilidad de Meta")
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = success_prob,
                title = {'text': f"Probabilidad > €{financial_goal:,.0f} (Real)"},
                gauge = {
                    'axis': {'range': [0, 100]},
                    'bar': {'color': "#0068C9"},
                    'steps': [
                        {'range': [0, 50], 'color': "#ffcccb"},
                        {'range': [50, 80], 'color': "#fff4cc"},
                        {'range': [80, 100], 'color': "#ccffcc"}],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90}}
            ))
            st.plotly_chart(fig_gauge, use_container_width=True)
            
        with col_risk2:
            st.subheader("Métricas de Dolor")
            st.metric(
                label="Max Drawdown (Caída Máxima)", 
                value=f"{sim_stats['max_drawdown']*100:.1f}%",
                delta="Peor caída desde pico",
                delta_color="inverse",
                help="Representa la mayor pérdida porcentual desde un máximo histórico en el escenario mediano."
            )
            st.info("""
            **¿Qué significa esto?**
            Si invertiste 100k y bajó a 60k antes de recuperarse, tu Drawdown fue del 40%.
            Un Drawdown alto requiere nervios de acero para no vender en el peor momento.
            """)

        # --- Gráfico de Montaña Rusa (Retornos Anuales) ---
        st.subheader("🎢 La Montaña Rusa Emocional (Retornos Anuales)")
        st.markdown("Este gráfico muestra los retornos anuales del escenario mediano. Observa la volatilidad.")
        
        # Extraer retornos del median_details
        years = [d["Año"] for d in median_details]
        returns = [d["Retorno (%)"] for d in median_details]
        colors = ['#28a745' if r >= 0 else '#dc3545' for r in returns] # Verde si positivo, Rojo si negativo
        
        fig_roller = go.Figure()
        fig_roller.add_trace(go.Bar(
            x=years,
            y=returns,
            marker_color=colors,
            name="Retorno Anual"
        ))
        
        fig_roller.update_layout(
            xaxis_title="Año",
            yaxis_title="Retorno (%)",
            template="plotly_white",
            hovermode="x unified"
        )
        st.plotly_chart(fig_roller, use_container_width=True)

    with tab3:
        st.markdown("## 📚 Academia del Inversor")
        
        st.markdown("""
        ### 1. El Poder del Interés Compuesto
        Albert Einstein lo llamó "la octava maravilla del mundo". Es el efecto de ganar intereses sobre tus intereses.
        
        En el gráfico de **Composición del Patrimonio** (Tab 1), observa cómo la barra azul oscuro (Interés Generado) empieza pequeña pero acaba siendo la parte más grande de tu dinero. Eso es el interés compuesto en acción.
        """)
        
        st.markdown("---")
        
        st.markdown("""
        ### 2. Distribución Normal vs. T-Student (Colas Gordas)
        La mayoría de los modelos financieros asumen que los retornos siguen una **Campana de Gauss (Normal)**.
        
        *   **El Problema:** La realidad tiene "colas gordas". Los eventos extremos (crisis, booms) ocurren mucho más a menudo de lo que predice la curva Normal.
        *   **Nuestra Solución:** Usamos una **Distribución T-Student** (con df=3 por defecto). Esto permite que el simulador genere eventos extremos con una frecuencia realista.
        
        Puedes ajustar esto en el **Modo Experto** de la barra lateral.
        """)
        
        # Visualización simple de Normal vs T-Student
        import numpy as np
        x = np.linspace(-5, 5, 100)
        y_norm = (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x**2)
        # Aprox T-student df=3 (sin normalizar varianza para efecto visual de colas)
        # Formula pdf t-student: gamma((v+1)/2) / (sqrt(v*pi) * gamma(v/2)) * (1 + x^2/v)^(-(v+1)/2)
        # Simplificado para visualización conceptual
        
        st.info("💡 **Nota:** Al bajar los 'Grados de Libertad' en el Modo Experto, aumentas la probabilidad de eventos extremos (positivos y negativos).")

else:
    st.info("👈 Configura los parámetros en la barra lateral y pulsa 'Ejecutar Simulación' para comenzar.")
