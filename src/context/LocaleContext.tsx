"use client";

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';

interface LocaleContextType {
  region: RegionCode;
  language: LanguageCode;
  remember: boolean;
  selectorOpen: boolean;
  hasPreference: boolean;
  setLocale: (pref: { region: RegionCode; language: LanguageCode; remember: boolean }) => void;
  openSelector: () => void;
  closeSelector: () => void;
  formatPrice: (amount: number, currencyCode: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function LocaleProvider({ children }: ProviderProps) {
  const formatPrice = useCallback((amount: number, currencyCode: string): string => {
    const code = currencyCode || 'EUR';
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      return `${formatted} ${code}`;
    } catch {
      return `${amount.toFixed(2)} ${code}`;
    }
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <LocaleContext.Provider value={{
      region: 'US',
      language: 'en',
      remember: true,
      selectorOpen: false,
      hasPreference: true,
      setLocale: noop,
      openSelector: noop,
      closeSelector: noop,
      formatPrice,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
}
