import numpy as np
import pandas as pd
import yfinance as yf

def get_historical_stats(ticker, period="20y"):
    """
    Obtiene estadísticas históricas (retorno medio y volatilidad anualizada)
    para un ticker dado usando yfinance.
    
    Args:
        ticker (str): Símbolo del activo (ej. 'SPY', 'VWRL.AS').
        period (str): Periodo de historia a descargar.
        
    Returns:
        dict: {'mean_return': float, 'volatility': float, 'last_price': float}
              o None si hay error.
    """
    try:
        # Descargar datos históricos
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        if hist.empty:
            return None
            
        # Calcular retornos diarios
        # Usamos 'Close' para evitar ajustes de dividendos dobles si yfinance ya ajusta, 
        # pero 'Adj Close' es más seguro para retorno total. 
        # yfinance .history() devuelve columnas ajustadas por defecto en versiones recientes?
        # Revisamos columnas: Open, High, Low, Close, Volume, Dividends, Stock Splits.
        # 'Close' suele estar ajustado por splits. Para dividendos, mejor calcular Total Return si es posible,
        # pero para simplificar usaremos el cambio porcentual del precio de cierre.
        
        daily_returns = hist['Close'].pct_change().dropna()
        
        # Anualizar métricas (asumiendo 252 días de trading)
        mean_daily_return = daily_returns.mean()
        std_daily_return = daily_returns.std()
        
        annualized_return = mean_daily_return * 252
        annualized_volatility = std_daily_return * np.sqrt(252)
        
        return {
            "mean_return": annualized_return,
            "volatility": annualized_volatility,
            "data_points": len(daily_returns)
        }
    except Exception as e:
        print(f"Error obteniendo datos para {ticker}: {e}")
        return None

def run_monte_carlo_simulation(
    initial_capital,
    contribution_schedule,
    mean_return=0.08,
    volatility=0.15,
    black_swan_enabled=True,
    black_swan_prob=0.02,
    inflation_rate=0.02,
    num_simulations=1000
):
    """
    Ejecuta una simulación de Monte Carlo avanzada.
    
    Args:
        contribution_schedule: Lista de tuplas (años, mensualidad).
        mean_return: Retorno medio anual (decimal).
        volatility: Volatilidad anual (decimal).
        black_swan_enabled: Si se activan los eventos extremos.
        inflation_rate: Tasa de inflación anual (decimal).
        
    Retorna:
        - summary_df: DataFrame con percentiles (Nominal y Real).
        - median_details: Detalle año a año del escenario mediano.
        - breakdown_df: DataFrame para el gráfico de barras apiladas.
        - simulation_stats: Diccionario con estadísticas extra (Max Drawdown, etc).
        - final_balances_real: Array con todos los saldos finales reales (para probabilidad de éxito).
    """
    
    # 1. Expandir el calendario de aportaciones a una lista año a año
    annual_contributions_list = []
    for duration, monthly_amount in contribution_schedule:
        # Aseguramos que duration sea entero
        years_in_tranche = int(duration)
        annual_amount = monthly_amount * 12
        annual_contributions_list.extend([annual_amount] * years_in_tranche)
        
    total_years = len(annual_contributions_list)
    
    # Matriz de resultados NOMINALES (Simulaciones x Años+1)
    results_nominal = np.zeros((num_simulations, total_years + 1))
    results_nominal[:, 0] = initial_capital
    
    # Matriz de resultados REALES (Ajustados por inflación)
    results_real = np.zeros((num_simulations, total_years + 1))
    results_real[:, 0] = initial_capital
    
    # Matriz de retornos para análisis
    returns_matrix = np.zeros((num_simulations, total_years + 1))
    
    # Factor de normalización para t-student (df=3, var=3, std=sqrt(3))
    t_std_dev = np.sqrt(3)
    
    for sim in range(num_simulations):
        balance = initial_capital
        
        for year_idx in range(total_years):
            year_num = year_idx + 1
            contribution = annual_contributions_list[year_idx]
            
            # Lógica de Retorno
            is_black_swan = False
            if black_swan_enabled and np.random.random() < black_swan_prob:
                is_black_swan = True
                r_t = np.random.uniform(-0.50, -0.20)
            else:
                t_random = np.random.standard_t(3) / t_std_dev
                r_t = mean_return + volatility * t_random
            
            returns_matrix[sim, year_num] = r_t
            
            # Cálculo del saldo NOMINAL
            balance = balance * (1 + r_t) + contribution
            results_nominal[sim, year_num] = balance
            
            # Cálculo del saldo REAL (Deflactado)
            # Factor de descuento de inflación: (1 + inflation)^year_num
            deflator = (1 + inflation_rate) ** year_num
            results_real[sim, year_num] = balance / deflator

    # --- Procesar Resultados (Usamos Nominal por defecto para gráficos estándar, pero guardamos Real) ---
    
    # Percentiles NOMINALES
    p10_nom = np.percentile(results_nominal, 10, axis=0)
    p50_nom = np.percentile(results_nominal, 50, axis=0)
    p90_nom = np.percentile(results_nominal, 90, axis=0)
    
    # Percentiles REALES
    p10_real = np.percentile(results_real, 10, axis=0)
    p50_real = np.percentile(results_real, 50, axis=0)
    p90_real = np.percentile(results_real, 90, axis=0)
    
    # Calcular acumulados "deterministas"
    cumulative_contributions = [0] * (total_years + 1)
    current_contrib_sum = 0
    for i in range(total_years):
        current_contrib_sum += annual_contributions_list[i]
        cumulative_contributions[i+1] = current_contrib_sum
        
    invested_capital_total = [initial_capital + c for c in cumulative_contributions]
    
    # DataFrame Resumen (Contiene datos Nominales y Reales)
    summary_df = pd.DataFrame({
        "Year": range(total_years + 1),
        "Invested": invested_capital_total,
        "P10_Nominal": p10_nom, "Median_Nominal": p50_nom, "P90_Nominal": p90_nom,
        "P10_Real": p10_real, "Median_Real": p50_real, "P90_Real": p90_real
    })
    
    # --- Detalle Escenario Mediano (Nominal) ---
    final_balances_nom = results_nominal[:, -1]
    median_val_nom = np.median(final_balances_nom)
    median_sim_idx = (np.abs(final_balances_nom - median_val_nom)).argmin()
    
    # Calcular Max Drawdown para el escenario mediano
    # Drawdown = (Peak - Current) / Peak
    median_curve = results_nominal[median_sim_idx, :]
    peak = median_curve[0]
    max_drawdown = 0.0
    
    for val in median_curve:
        if val > peak:
            peak = val
        dd = (peak - val) / peak
        if dd > max_drawdown:
            max_drawdown = dd
            
    median_details = []
    stacked_initial = []
    stacked_contributed = []
    stacked_interest = []
    
    for i in range(total_years + 1):
        if i == 0:
            stacked_initial.append(initial_capital)
            stacked_contributed.append(0)
            stacked_interest.append(0)
            continue
            
        year_num = i
        prev_balance = results_nominal[median_sim_idx, i-1]
        curr_balance = results_nominal[median_sim_idx, i]
        r_t = returns_matrix[median_sim_idx, i]
        contrib = annual_contributions_list[i-1]
        
        interest_generated = curr_balance - prev_balance - contrib
        
        median_details.append({
            "Año": year_num,
            "Saldo Inicial": prev_balance,
            "Aportación Anual": contrib,
            "Retorno (%)": r_t * 100,
            "Interés Generado": interest_generated,
            "Saldo Final": curr_balance
        })
        
        stacked_initial.append(initial_capital)
        stacked_contributed.append(cumulative_contributions[i])
        total_interest = curr_balance - initial_capital - cumulative_contributions[i]
        stacked_interest.append(total_interest)

    breakdown_df = pd.DataFrame({
        "Year": range(total_years + 1),
        "Capital Inicial": stacked_initial,
        "Aportaciones": stacked_contributed,
        "Interés Compuesto": stacked_interest
    })
    
    simulation_stats = {
        "max_drawdown": max_drawdown
    }
    
    # Retornamos todos los saldos finales REALES para calcular probabilidad de éxito
    final_balances_real = results_real[:, -1]

    return summary_df, median_details, breakdown_df, simulation_stats, final_balances_real

def calculate_kpis(initial_capital, total_contributed, final_balance, tax_rate):
    total_invested = initial_capital + total_contributed
    gross_profit = final_balance - total_invested
    
    taxes = max(0, gross_profit * tax_rate)
    net_profit = gross_profit - taxes
    final_net_balance = total_invested + net_profit
    
    profit_percentage = (net_profit / total_invested * 100) if total_invested > 0 else 0
    
    return {
        "Capital Total Invertido": total_invested,
        "Saldo Final Bruto": final_balance,
        "Impuestos Estimados": taxes,
        "Beneficio Neto": net_profit,
        "Saldo Final Neto": final_net_balance,
        "Rentabilidad (%)": profit_percentage
    }
