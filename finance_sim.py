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

def calculate_weighted_stats(ticker1, ticker2, weight1, period="5y"):
    """
    Calcula estadísticas ponderadas para una cartera de dos activos,
    considerando la correlación real entre ellos.
    
    Args:
        ticker1 (str): Primer activo (ej. 'IWDA.AS').
        ticker2 (str): Segundo activo (ej. 'EEM').
        weight1 (float): Peso del primer activo (0.0 a 1.0).
        period (str): Periodo histórico para correlación.
        
    Returns:
        dict: Stats de la cartera combinada.
    """
    weight2 = 1.0 - weight1
    try:
        # Descargar datos conjuntos para asegurar alineación de fechas
        data = yf.download([ticker1, ticker2], period=period, progress=False)['Close']
        
        if data.empty or len(data.columns) < 2:
            return None
            
        # Calcular retornos diarios
        returns = data.pct_change().dropna()
        
        # Medias y Covarianzas anualizadas
        mean_returns = returns.mean() * 252
        cov_matrix = returns.cov() * 252
        
        # Retorno esperado de la cartera
        # Nota: yfinance devuelve columnas con los tickers, accedemos por nombre
        r1 = mean_returns[ticker1]
        r2 = mean_returns[ticker2]
        portfolio_return = r1 * weight1 + r2 * weight2
        
        # Volatilidad de la cartera (Formula: w1^2*s1^2 + w2^2*s2^2 + 2*w1*w2*cov12)
        var1 = cov_matrix.loc[ticker1, ticker1]
        var2 = cov_matrix.loc[ticker2, ticker2]
        cov12 = cov_matrix.loc[ticker1, ticker2]
        
        portfolio_variance = (weight1**2 * var1) + (weight2**2 * var2) + (2 * weight1 * weight2 * cov12)
        portfolio_volatility = np.sqrt(portfolio_variance)
        
        # Correlación (para mostrar al usuario)
        correlation = returns.corr().loc[ticker1, ticker2]
        
        return {
            "mean_return": portfolio_return,
            "volatility": portfolio_volatility,
            "correlation": correlation,
            "details": {
                ticker1: {"return": r1, "vol": np.sqrt(var1)},
                ticker2: {"return": r2, "vol": np.sqrt(var2)}
            }
        }
    except Exception as e:
        print(f"Error en cartera mixta: {e}")
        return None

def run_monte_carlo_simulation(
    initial_capital,
    contribution_schedule,
    mean_return=0.08,
    volatility=0.15,
    black_swan_enabled=True,
    black_swan_prob=0.02,
    inflation_rate=0.02,
    num_simulations=1000,
    t_df=3
):
    """
    Ejecuta una simulación de Monte Carlo avanzada.
    
    Args:
        contribution_schedule: Lista de tuplas (años, mensualidad).
        mean_return: Retorno medio anual (decimal).
        volatility: Volatilidad anual (decimal).
        black_swan_enabled: Si se activan los eventos extremos.
        inflation_rate: Tasa de inflación anual (decimal).
        t_df: Grados de libertad para la distribución t-Student.
        
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
    
    # Matriz para rastrear Black Swans
    black_swan_matrix = np.zeros((num_simulations, total_years + 1), dtype=bool)
    
    # Factor de normalización para t-student (df=t_df, var=df/(df-2) para df>2)
    # Para estandarizar t-student a varianza 1, dividimos por sqrt(df/(df-2))
    if t_df > 2:
        t_std_dev = np.sqrt(t_df / (t_df - 2))
    else:
        t_std_dev = 1.0 # Fallback para df bajos donde varianza es infinita o indefinida
    
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
                black_swan_matrix[sim, year_num] = True
            else:
                t_random = np.random.standard_t(t_df) / t_std_dev
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
    
    # Calcular Capital Invertido REAL (Deflactado) - Representa el poder adquisitivo del efectivo si se hubiera guardado bajo el colchón
    invested_capital_real = []
    for i, val in enumerate(invested_capital_total):
        deflator = (1 + inflation_rate) ** i
        invested_capital_real.append(val / deflator)
    
    # DataFrame Resumen (Contiene datos Nominales y Reales)
    summary_df = pd.DataFrame({
        "Year": range(total_years + 1),
        "Invested": invested_capital_total,
        "Invested_Real": invested_capital_real,
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
        is_bs = bool(black_swan_matrix[median_sim_idx, i])
        
        interest_generated = curr_balance - prev_balance - contrib
        
        median_details.append({
            "Año": int(year_num),
            "Saldo Inicial": float(prev_balance),
            "Aportación Anual": float(contrib),
            "Retorno (%)": float(r_t * 100),
            "Interés Generado": float(interest_generated),
            "Saldo Final": float(curr_balance),
            "Is_Black_Swan": is_bs
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
    
    # Añadimos columna Is_Black_Swan al breakdown_df para facilitar el ploteo
    # Ojo: breakdown_df tiene fila 0 (año 0), median_details empieza en año 1.
    # Rellenamos con False el año 0.
    bs_column = [False] + [d["Is_Black_Swan"] for d in median_details]
    breakdown_df["Is_Black_Swan"] = bs_column
    
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

def run_backtest(
    initial_capital,
    contribution_schedule,
    ticker,
    start_year,
    inflation_rate=0.02
):
    """
    Ejecuta un backtest histórico real.
    
    Args:
        initial_capital: Capital inicial.
        contribution_schedule: Lista de tuplas (años, mensualidad).
        ticker: Símbolo del activo.
        start_year: Año de inicio (int).
        inflation_rate: Tasa de inflación para ajuste real.
        
    Returns:
        dict: Resultados del backtest.
    """
    # 1. Expandir calendario de aportaciones (mensual para mayor precisión en backtest)
    monthly_contributions = []
    for duration, monthly_amount in contribution_schedule:
        years_in_tranche = int(duration)
        monthly_contributions.extend([monthly_amount] * (years_in_tranche * 12))
        
    total_months = len(monthly_contributions)
    
    # 2. Obtener datos históricos
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(start=f"{start_year}-01-01")
        
        if hist.empty:
            return None
            
        data = hist['Close']
        
        # Resamplear a mensual (usando el último precio de cada mes)
        monthly_data = data.resample('M').last()
        monthly_returns = monthly_data.pct_change().dropna()
        
        # Alinear longitud
        limit = min(total_months, len(monthly_returns))
        
        dates = monthly_returns.index[:limit]
        returns = monthly_returns.values[:limit]
        contributions = monthly_contributions[:limit]
        
        balance = initial_capital
        history = []
        
        cumulative_invested = initial_capital
        
        for i in range(limit):
            date = dates[i]
            r_m = returns[i]
            contrib = contributions[i]
            
            # Aplicar retorno y aportación
            balance = balance * (1 + r_m) + contrib
            cumulative_invested += contrib
            
            # Ajuste Real (aproximado mensual)
            years_elapsed = (date.year - start_year) + (date.month - 1) / 12.0
            deflator = (1 + inflation_rate) ** years_elapsed
            balance_real = balance / deflator
            
            history.append({
                "Date": date.strftime("%Y-%m-%d"),
                "Balance_Nominal": balance,
                "Balance_Real": balance_real,
                "Invested": cumulative_invested,
                "Return_Pct": r_m * 100
            })
            
        return {
            "history": history,
            "final_balance": balance,
            "final_balance_real": history[-1]["Balance_Real"] if history else initial_capital,
            "total_invested": cumulative_invested
        }
    except Exception as e:
        print(f"Error en backtest: {e}")
        return None

