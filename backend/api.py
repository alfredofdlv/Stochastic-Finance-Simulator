from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import yfinance as yf
from finance_sim import run_monte_carlo_simulation, get_historical_stats, calculate_kpis, run_backtest

app = FastAPI(title="Finance Simulator API")

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:3000", # Assuming a common frontend port
    # Add your frontend domain here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class ContributionTranche(BaseModel):
    years: int
    monthly_amount: float

class SimulationRequest(BaseModel):
    initial_capital: float
    contribution_schedule: List[ContributionTranche]
    ticker: str
    inflation_rate: float
    tax_rate: float
    financial_goal: float
    black_swan_enabled: bool = True
    custom_return: Optional[float] = None
    custom_volatility: Optional[float] = None
    t_df: int = 3

class BacktestRequest(BaseModel):
    initial_capital: float
    contribution_schedule: List[ContributionTranche]
    ticker: str
    start_year: int
    inflation_rate: float # To calculate real values

class TickerSearchResponse(BaseModel):
    symbol: str
    shortName: Optional[str] = None

# --- Endpoints ---

@app.get("/tickers/search", response_model=List[TickerSearchResponse])
def search_tickers(query: str):
    """
    Search for tickers using Yahoo Finance.
    Note: yfinance doesn't have a direct search method exposed easily without private APIs or scraping.
    However, we can try to use a known list or a simple lookup if the user provides a valid ticker.
    For a real search, we might need an external API or a workaround.
    
    For this implementation, we will try to fetch info for the exact ticker 
    or return a dummy list if it's a keyword search (since yfinance search is limited).
    """
    try:
        # Simple check if it's a valid ticker
        ticker = yf.Ticker(query)
        info = ticker.info
        if info and 'symbol' in info:
             return [{"symbol": info['symbol'], "shortName": info.get('shortName', info.get('longName'))}]
        return []
    except:
        return []

@app.post("/simulate")
def simulate(request: SimulationRequest):
    # 1. Get Stats for Ticker
    if request.ticker == 'CUSTOM' and request.custom_return is not None and request.custom_volatility is not None:
        mean_return = request.custom_return / 100.0
        volatility = request.custom_volatility / 100.0
    else:
        stats = get_historical_stats(request.ticker)
        if not stats:
            raise HTTPException(status_code=404, detail=f"Ticker {request.ticker} not found or no data available.")
        
        mean_return = stats["mean_return"]
        volatility = stats["volatility"]
    
    # 2. Prepare Schedule
    schedule = [(t.years, t.monthly_amount) for t in request.contribution_schedule]
    
    # 3. Run Simulation
    summary_df, median_details, breakdown_df, simulation_stats, final_balances_real = run_monte_carlo_simulation(
        initial_capital=request.initial_capital,
        contribution_schedule=schedule,
        mean_return=mean_return,
        volatility=volatility,
        inflation_rate=request.inflation_rate,
        black_swan_enabled=request.black_swan_enabled,
        t_df=request.t_df
    )
    
    # 4. Process Results
    
    # Fan Chart Data
    fan_chart = summary_df[["Year", "Invested", "Invested_Real", "P10_Nominal", "Median_Nominal", "P90_Nominal", "P10_Real", "Median_Real", "P90_Real"]].to_dict(orient="records")
    
    # Portfolio Composition Data (Stacked Bar)
    portfolio_composition = breakdown_df.to_dict(orient="records")
    
    # Median Scenario Breakdown
    # median_details is a list of dicts
    
    # Calculate KPIs for the median scenario
    # We need total contributed. breakdown_df has cumulative contributions.
    total_contributed = breakdown_df["Aportaciones"].iloc[-1]
    median_final_balance = median_details[-1]["Saldo Final"] if median_details else request.initial_capital
    
    kpis = calculate_kpis(
        initial_capital=request.initial_capital,
        total_contributed=total_contributed,
        final_balance=median_final_balance,
        tax_rate=request.tax_rate
    )

    # Risk Metrics
    # Success Probability: % of simulations where final real balance >= financial_goal
    success_count = np.sum(final_balances_real >= request.financial_goal)
    success_prob = float((success_count / len(final_balances_real)) * 100)
    
    return {
        "fan_chart": fan_chart,
        "portfolio_composition": portfolio_composition,
        "median_scenario": median_details,
        "kpis": kpis,
        "risk_metrics": {
            "max_drawdown": float(simulation_stats["max_drawdown"]),
            "success_probability": success_prob,
            "median_final_balance_real": float(np.median(final_balances_real))
        },
        "ticker_stats": stats
    }

@app.post("/backtest")
def backtest(request: BacktestRequest):
    schedule = [(t.years, t.monthly_amount) for t in request.contribution_schedule]
    
    result = run_backtest(
        initial_capital=request.initial_capital,
        contribution_schedule=schedule,
        ticker=request.ticker,
        start_year=request.start_year,
        inflation_rate=request.inflation_rate
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Could not run backtest. Check ticker or date.")
        
    return result
