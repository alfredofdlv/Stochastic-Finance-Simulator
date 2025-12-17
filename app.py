import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from finance_sim import run_monte_carlo_simulation, calculate_kpis

st.set_page_config(page_title="Simulador Vanguard Global", layout="wide")

# --- Sidebar ---
st.sidebar.title("Configuración")

initial_capital = st.sidebar.number_input("Capital Inicial (€)", min_value=0.0, value=10000.0, step=1000.0)

st.sidebar.subheader("Plan de Aportaciones")
st.sidebar.info("Define tramos de inversión. Ej: 10 años a 500€, luego 10 años a 1000€.")

# Data Editor para aportaciones dinámicas
default_schedule = pd.DataFrame([
    {"Años": 10, "Mensualidad (€)": 500.0},
    {"Años": 10, "Mensualidad (€)": 1000.0}
])
edited_schedule = st.sidebar.data_editor(default_schedule, num_rows="dynamic", hide_index=True)

# Calcular duración total
total_years = edited_schedule["Años"].sum()
st.sidebar.write(f"**Duración Total:** {total_years} años")

st.sidebar.subheader("Parámetros de Mercado")
mean_return_input = st.sidebar.number_input("Retorno Medio Anual (%)", value=8.0, step=0.5)
volatility_input = st.sidebar.number_input("Volatilidad (%)", value=15.0, step=1.0)
black_swan_enabled = st.sidebar.toggle("Activar 'Black Swans'", value=True)
tax_rate_input = st.sidebar.number_input("Tasa Impositiva (%)", min_value=0.0, max_value=100.0, value=19.0)

# Parámetros avanzados
MEAN_RETURN = mean_return_input / 100.0
VOLATILITY = volatility_input / 100.0
BLACK_SWAN_PROB = 0.02

if st.sidebar.button("Ejecutar Simulación"):
    
    # Convertir DataFrame a lista de tuplas
    contribution_schedule = []
    for index, row in edited_schedule.iterrows():
        contribution_schedule.append((row["Años"], row["Mensualidad (€)"]))

    # --- Ejecutar Lógica ---
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
    
    # Calcular total aportado desde el breakdown
    total_contributed = breakdown_df["Aportaciones"].iloc[-1]
    
    kpis = calculate_kpis(
        initial_capital, 
        total_contributed, 
        median_final_balance, 
        tax_rate_input / 100.0
    )
    
    # --- Visualización Principal ---
    st.title("Simulador de Inversión Avanzado")
    st.markdown("### Proyección Monte Carlo (1,000 simulaciones)")
    
    # KPIs
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Capital Total Invertido", f"€{kpis['Capital Total Invertido']:,.2f}")
    col2.metric("Saldo Final Neto", f"€{kpis['Saldo Final Neto']:,.2f}")
    col3.metric("Beneficio Neto", f"€{kpis['Beneficio Neto']:,.2f}", delta_color="normal")
    col4.metric("Rentabilidad Total", f"{kpis['Rentabilidad (%)']:.2f}%")
    
    # Gráfico Fan Chart con Plotly
    fig_fan = go.Figure()
    
    # Área de incertidumbre (P10 a P90)
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["P10"],
        mode='lines', line=dict(width=0), showlegend=False, name='Pesimista (P10)'
    ))
    
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["P90"],
        mode='lines', line=dict(width=0), fill='tonexty',
        fillcolor='rgba(0, 100, 255, 0.2)', name='Rango (10%-90%)'
    ))
    
    # Línea Mediana
    fig_fan.add_trace(go.Scatter(
        x=summary_df["Year"], y=summary_df["Median"],
        mode='lines', line=dict(color='blue', width=3), name='Escenario Mediano'
    ))
    
    fig_fan.update_layout(
        title="Evolución del Patrimonio (Fan Chart)",
        xaxis_title="Año", yaxis_title="Saldo (€)",
        hovermode="x unified", template="plotly_white"
    )
    st.plotly_chart(fig_fan, use_container_width=True)
    
    # --- Gráfico de Barras Apiladas ---
    st.markdown("### Composición del Patrimonio (Escenario Mediano)")
    
    fig_bar = go.Figure()
    
    fig_bar.add_trace(go.Bar(
        x=breakdown_df["Year"], y=breakdown_df["Capital Inicial"],
        name='Capital Inicial', marker_color='lightgray'
    ))
    
    fig_bar.add_trace(go.Bar(
        x=breakdown_df["Year"], y=breakdown_df["Aportaciones"],
        name='Aportaciones Acumuladas', marker_color='lightblue'
    ))
    
    fig_bar.add_trace(go.Bar(
        x=breakdown_df["Year"], y=breakdown_df["Interés Compuesto"],
        name='Interés Compuesto', marker_color='darkblue'
    ))
    
    fig_bar.update_layout(
        barmode='stack',
        title="Desglose: Capital vs Interés",
        xaxis_title="Año", yaxis_title="Valor (€)",
        template="plotly_white",
        hovermode="x unified"
    )
    st.plotly_chart(fig_bar, use_container_width=True)
    
    # --- Tabla Detallada ---
    st.subheader("Desglose Año a Año")
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
        label="Descargar Datos (CSV)",
        data=csv,
        file_name='simulacion_avanzada.csv',
        mime='text/csv',
    )
    
    # TODO: Integrar API de Yahoo Finance para obtener datos históricos reales
    # def get_market_data(ticker):
    #     pass

else:
    st.info("Configura los parámetros y pulsa 'Ejecutar Simulación'.")
