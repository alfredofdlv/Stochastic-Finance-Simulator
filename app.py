import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from finance_sim import run_monte_carlo_simulation, calculate_kpis

st.set_page_config(page_title="Simulador Vanguard Global", layout="wide", page_icon="📈")

# --- Header Profesional ---
st.title("📈 Simulador de Inversión Cuantitativa")
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
tax_rate_input = st.sidebar.number_input("Tasa Impositiva (%)", min_value=0.0, max_value=100.0, value=19.0)

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
        summary_df, median_details, breakdown_df = run_monte_carlo_simulation(
            initial_capital=initial_capital,
            contribution_schedule=contribution_schedule,
            mean_return=MEAN_RETURN,
            volatility=VOLATILITY,
            black_swan_enabled=black_swan_enabled,
            black_swan_prob=BLACK_SWAN_PROB,
            num_simulations=1000
        )
    
    # Calcular KPIs basados en el escenario MEDIANO
    median_final_balance = summary_df["Median"].iloc[-1]
    total_contributed = breakdown_df["Aportaciones"].iloc[-1]
    
    kpis = calculate_kpis(
        initial_capital, 
        total_contributed, 
        median_final_balance, 
        tax_rate_input / 100.0
    )
    
    # --- Visualización de KPIs ---
    st.markdown("### 🎯 Resultados Clave (Escenario Mediano)")
    
    kpi1, kpi2, kpi3, kpi4 = st.columns(4)
    
    kpi1.metric(
        label="Capital Total Invertido", 
        value=f"€{kpis['Capital Total Invertido']:,.0f}",
        help="Suma de tu capital inicial más todas las aportaciones mensuales."
    )
    
    kpi2.metric(
        label="Saldo Final Neto", 
        value=f"€{kpis['Saldo Final Neto']:,.0f}",
        delta=f"Impuestos: -€{kpis['Impuestos Estimados']:,.0f}",
        help="Dinero disponible en tu bolsillo después de pagar impuestos sobre beneficios."
    )
    
    profit_color = "normal" if kpis['Beneficio Neto'] >= 0 else "inverse"
    kpi3.metric(
        label="Beneficio Neto", 
        value=f"€{kpis['Beneficio Neto']:,.0f}",
        delta_color=profit_color,
        help="Ganancia pura después de impuestos."
    )
    
    kpi4.metric(
        label="Rentabilidad Total", 
        value=f"{kpis['Rentabilidad (%)']:.1f}%",
        help="Porcentaje de ganancia sobre el capital invertido."
    )
    
    st.markdown("---")

    # --- Gráfico Fan Chart ---
    st.subheader("📈 Evolución del Patrimonio (Fan Chart)")
    
    fig_fan = go.Figure()
    
    # Área de incertidumbre (P10 a P90)
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["P10"],
        mode='lines', line=dict(width=0), showlegend=False, name='Pesimista (P10)'
    ))
    
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["P90"],
        mode='lines', line=dict(width=0), fill='tonexty',
        fillcolor='rgba(0, 100, 255, 0.15)', name='Rango Probable (10%-90%)'
    ))
    
    # Línea Mediana
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["Median"],
        mode='lines', line=dict(color='#0068C9', width=3), name='Escenario Mediano'
    ))
    
    # Capital Invertido
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["Invested"],
        mode='lines', line=dict(color='gray', dash='dash', width=2), name='Capital Invertido (Sin Rentabilidad)'
    ))
    
    fig_fan.update_layout(
        xaxis_title="Año", yaxis_title="Saldo (€)",
        hovermode="x unified", template="plotly_white",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=20, r=20, t=50, b=20)
    )
    st.plotly_chart(fig_fan, use_container_width=True)
    
    # --- Gráfico de Barras Apiladas ---
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
    
    fig_bar.update_layout(
        barmode='stack',
        xaxis_title="Año", yaxis_title="Valor (€)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=20, r=20, t=50, b=20)
    )
    st.plotly_chart(fig_bar, use_container_width=True)
    
    # --- Sección Educativa ---
    with st.expander("📚 Conceptos Clave: ¿Por qué esta simulación es diferente?"):
        st.markdown("""
        ### 1. Simulación de Monte Carlo vs. Calculadora Lineal
        La mayoría de calculadoras asumen un interés fijo (ej. 8% cada año). **Eso es falso.**
        En la vida real, la bolsa sube un 20% un año y baja un 10% al siguiente.
        *   **Monte Carlo:** Simulamos 1,000 "vidas posibles" de tu inversión.
        *   **Fan Chart:** El área azul muestra dónde caerá tu dinero con un 80% de probabilidad.
        
        ### 2. ¿Qué es un 'Cisne Negro'?
        Es un evento raro pero devastador (como la crisis de 2008 o el COVID-19).
        *   En esta app, hay un **2% de probabilidad anual** de que el mercado caiga entre un **20% y un 50%**.
        *   Esto te ayuda a ver si tu plan resiste crisis graves.
        """)
    
    # --- Tabla Detallada ---
    st.subheader("📋 Desglose Año a Año (Escenario Mediano)")
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
    
    # TODO: Integrar API de Yahoo Finance para obtener datos históricos reales
    # def get_market_data(ticker):
    #     pass

else:
    st.info("👈 Configura los parámetros en la barra lateral y pulsa 'Ejecutar Simulación' para comenzar.")
