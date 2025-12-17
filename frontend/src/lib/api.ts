import axios from 'axios';
import { 
  SimulationRequest, 
  SimulationResponse, 
  BacktestRequest, 
  BacktestResponse, 
  TickerSearchResponse 
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchTickers = async (query: string): Promise<TickerSearchResponse[]> => {
  const response = await api.get<TickerSearchResponse[]>('/tickers/search', {
    params: { query },
  });
  return response.data;
};

export const runSimulation = async (data: SimulationRequest): Promise<SimulationResponse> => {
  const response = await api.post<SimulationResponse>('/simulate', data);
  return response.data;
};

export const runBacktest = async (data: BacktestRequest): Promise<BacktestResponse> => {
  const response = await api.post<BacktestResponse>('/backtest', data);
  return response.data;
};
