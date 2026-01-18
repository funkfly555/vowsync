/**
 * Currency context for managing user currency preferences
 * @feature 020-dashboard-settings-fix
 */

import { createContext, useContext, ReactNode } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency, getCurrencySymbol, CURRENCIES } from '@/lib/currency';
import type { CurrencyCode } from '@/types/settings';
import { DEFAULT_PREFERENCES } from '@/types/settings';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { preferences, isLoading, updatePreferences } = useUserPreferences();

  const currency = preferences.currency || DEFAULT_PREFERENCES.currency;

  const setCurrency = (newCurrency: CurrencyCode) => {
    updatePreferences.mutate({ currency: newCurrency });
  };

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    formatCurrency: (amount: number) => formatCurrency(amount, currency),
    getCurrencySymbol: () => getCurrencySymbol(currency),
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency context
 * Must be used within CurrencyProvider
 */
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Re-export CURRENCIES for use in settings form
export { CURRENCIES };
