import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Currency } from '../utils/currency';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/preferences');
        setCurrencyState(response.data.currency as Currency);
        setThemeState(response.data.theme as 'light' | 'dark' | 'system');
      } catch (error) {
        console.error('Failed to fetch user preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [token]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, theme, setTheme, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};