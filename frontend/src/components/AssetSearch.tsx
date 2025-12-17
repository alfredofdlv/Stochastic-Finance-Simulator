'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchTickers } from '@/lib/api';
import { TickerSearchResponse } from '@/types';

export default function AssetSearch({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Simple debounce implementation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await searchTickers(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">Activo / Ticker</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? <Loader2 className="animate-spin h-4 w-4 text-slate-400" /> : <Search className="h-4 w-4 text-slate-400" />}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar (ej. SPY, VWRL.AS)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((result) => (
            <li
              key={result.symbol}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-slate-900"
              onClick={() => {
                setQuery(result.symbol);
                onSelect(result.symbol);
                setIsOpen(false);
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">{result.symbol}</span>
                <span className="text-xs text-slate-500">{result.shortName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
