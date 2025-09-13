import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Currency } from '../utils/currency';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
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
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrencyState(response.data.currency as Currency);
      } catch (error) {
        console.error('Failed to fetch user currency preference');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCurrency();
  }, [token]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};