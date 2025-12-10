// 👑 UNIFIED EXCHANGE - CUSTOM REACT HOOKS
// Reusable hooks for real-time data, auth, and trading

import { useState, useEffect, useCallback, useRef } from 'react';
import { marketData, auth, portfolio } from './api';

// ===================== MARKET DATA HOOKS =====================

/**
 * Hook for real-time market prices
 * Updates every 10 seconds with fresh data
 */
export function useMarketPrices(symbols = []) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    try {
      const data = await marketData.getAllMarkets();
      setPrices(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    // Refresh every 10 seconds
    intervalRef.current = setInterval(fetchPrices, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices]);

  return { prices, loading, error, refresh: fetchPrices };
}

/**
 * Hook for WebSocket connection to trading gateway
 */
export function useTradeWebSocket(symbol) {
  const [connected, setConnected] = useState(false);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const handleMessage = (data) => {
      if (data.type === 'trade' && data.symbol === symbol) {
        setTrades(prev => [data, ...prev].slice(0, 100));
        setLastPrice(data.price);
      } else if (data.type === 'orderbook' && data.symbol === symbol) {
        setOrderBook(data.book);
      }
    };

    wsRef.current = marketData.connectWebSocket(handleMessage);
    setConnected(true);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  const sendOrder = useCallback((order) => {
    return marketData.sendOrder({ ...order, symbol });
  }, [symbol]);

  return { connected, trades, orderBook, lastPrice, sendOrder };
}

/**
 * Hook for crypto prices only
 */
export function useCryptoPrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await marketData.getCryptoPrices();
      setPrices(data);
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
}

// ===================== AUTH HOOKS =====================

/**
 * Hook for authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = auth.getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await auth.login(email, password);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (userData) => {
    return await auth.register(userData);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };
}

// ===================== PORTFOLIO HOOKS =====================

/**
 * Hook for user positions
 */
export function usePositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await portfolio.getPositions();
      setPositions(data);
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  return { positions, loading };
}

/**
 * Hook for user balances
 */
export function useBalances() {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await portfolio.getBalances();
      setBalances(data);
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  return { balances, loading };
}

// ===================== UTILITY HOOKS =====================

/**
 * Hook for price formatting based on asset type
 */
export function usePriceFormatter() {
  const formatPrice = useCallback((price, type = 'crypto') => {
    if (typeof price !== 'number') return '---';
    
    switch (type) {
      case 'crypto':
        return price >= 1000 
          ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `$${price.toFixed(4)}`;
      case 'forex':
        return price.toFixed(5);
      case 'stock':
        return `$${price.toFixed(2)}`;
      case 'bond':
        return price.toFixed(3);
      default:
        return `$${price.toLocaleString()}`;
    }
  }, []);

  const formatChange = useCallback((change) => {
    if (typeof change !== 'number') return '0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }, []);

  const formatVolume = useCallback((volume) => {
    if (typeof volume !== 'number') return '---';
    if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(0)}`;
  }, []);

  return { formatPrice, formatChange, formatVolume };
}

/**
 * Hook for local storage with SSR support
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('LocalStorage Error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Hook for debounced values
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for window size
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
