# Documentación Técnica de la API

## Endpoints

### `POST /simulate`
Ejecuta una simulación de Monte Carlo.

**Request Body:**
```json
{
  "initial_capital": 10000,
  "contribution_schedule": [{"years": 20, "monthly_amount": 500}],
  "ticker": "VWRL.AS",
  "inflation_rate": 0.02,
  "tax_rate": 0.19,
  "financial_goal": 500000
}
```

**Response:**
*   `fan_chart`: Array de puntos para el gráfico de áreas (P10, P50, P90).
*   `median_scenario`: Detalle año a año del escenario mediano.
*   `risk_metrics`: Probabilidad de éxito, Max Drawdown, etc.

### `POST /backtest`
Ejecuta un backtest histórico.

**Request Body:**
```json
{
  "initial_capital": 10000,
  "contribution_schedule": [...],
  "ticker": "SPY",
  "start_year": 2000,
  "inflation_rate": 0.02
}
```

### `GET /tickers/search`
Busca activos financieros.
Query param: `query` (string).
