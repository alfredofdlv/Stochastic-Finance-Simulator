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
    num_simulations=1000
):
    """
    Ejecuta una simulación de Monte Carlo avanzada.
    
    Args:
        contribution_schedule: Lista de tuplas (años, mensualidad).
        mean_return: Retorno medio anual (decimal).
        volatility: Volatilidad anual (decimal).
        black_swan_enabled: Si se activan los eventos extremos.
        
    Retorna:
        - summary_df: DataFrame con percentiles.
        - median_details: Detalle año a año del escenario mediano.
        - breakdown_df: DataFrame para el gráfico de barras apiladas (Capital, Aportado, Interés).
    """
    
    # 1. Expandir el calendario de aportaciones a una lista año a año
    annual_contributions_list = []
    for duration, monthly_amount in contribution_schedule:
        # Aseguramos que duration sea entero
        years_in_tranche = int(duration)
        annual_amount = monthly_amount * 12
        annual_contributions_list.extend([annual_amount] * years_in_tranche)
        
    total_years = len(annual_contributions_list)
    
    # Matriz de resultados (Simulaciones x Años+1)
    results = np.zeros((num_simulations, total_years + 1))
    results[:, 0] = initial_capital
    
    # Matriz de retornos para análisis
    returns_matrix = np.zeros((num_simulations, total_years + 1))
    
    # Factor de normalización para t-student (df=3, var=3, std=sqrt(3))
    # Queremos que la volatilidad de entrada sea la std dev final.
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
                # Caída entre 20% y 50%
                r_t = np.random.uniform(-0.50, -0.20)
            else:
                # Distribución T de Student con colas pesadas (df=3)
                # Normalizamos dividiendo por sqrt(3) para que la 'volatility' sea la std real
                t_random = np.random.standard_t(3) / t_std_dev
                r_t = mean_return + volatility * t_random
            
            returns_matrix[sim, year_num] = r_t
            
            # Cálculo del saldo
            # Asumimos aportación al final o promediada, simplificamos:
            # Saldo crece, luego se añade aportación.
            balance = balance * (1 + r_t) + contribution
            results[sim, year_num] = balance

    # --- Procesar Resultados ---
    
    # Percentiles
    p10 = np.percentile(results, 10, axis=0)
    p50 = np.percentile(results, 50, axis=0)
    p90 = np.percentile(results, 90, axis=0)
    
    # Calcular acumulados "deterministas" (sin mercado) para gráficos
    # Capital Inicial es constante
    # Aportaciones Acumuladas
    cumulative_contributions = [0] * (total_years + 1)
    current_contrib_sum = 0
    for i in range(total_years):
        current_contrib_sum += annual_contributions_list[i]
        cumulative_contributions[i+1] = current_contrib_sum
        
    invested_capital_total = [initial_capital + c for c in cumulative_contributions]
    
    summary_df = pd.DataFrame({
        "Year": range(total_years + 1),
        "Invested": invested_capital_total,
        "P10": p10,
        "Median": p50,
        "P90": p90
    })
    
    # --- Detalle Escenario Mediano ---
    final_balances = results[:, -1]
    median_val = np.median(final_balances)
    median_sim_idx = (np.abs(final_balances - median_val)).argmin()
    
    median_details = []
    
    # Para el gráfico de barras apiladas (basado en la mediana)
    stacked_initial = []
    stacked_contributed = []
    stacked_interest = []
    
    for i in range(total_years + 1):
        # Año 0
        if i == 0:
            stacked_initial.append(initial_capital)
            stacked_contributed.append(0)
            stacked_interest.append(0)
            continue
            
        year_num = i
        prev_balance = results[median_sim_idx, i-1]
        curr_balance = results[median_sim_idx, i]
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
        
        # Datos para Stacked Bar
        stacked_initial.append(initial_capital)
        stacked_contributed.append(cumulative_contributions[i])
        # El resto es interés
        total_interest = curr_balance - initial_capital - cumulative_contributions[i]
        stacked_interest.append(total_interest)

    breakdown_df = pd.DataFrame({
        "Year": range(total_years + 1),
        "Capital Inicial": stacked_initial,
        "Aportaciones": stacked_contributed,
        "Interés Compuesto": stacked_interest
    })

    return summary_df, median_details, breakdown_df

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
