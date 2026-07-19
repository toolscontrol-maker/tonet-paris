"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';
import { detectSuggestedLocale } from '@/lib/i18n/regions';

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

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${date.toUTCString()};SameSite=Lax`;
}

export function LocaleProvider({ children }: ProviderProps) {
  const [region, setRegion] = useState<RegionCode>('US');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [remember, setRemember] = useState<boolean>(true);
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [hasPreference, setHasPreference] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    const cookieRegion = getCookie('tonet_locale_region') as RegionCode | undefined;
    const localRegion = typeof window !== 'undefined' ? localStorage.getItem('tonet_locale_region') as RegionCode | null : null;
    const savedRegion = cookieRegion || localRegion;

    if (savedRegion) {
      setRegion(savedRegion);
      setLanguage('en');
      setHasPreference(true);
    } else {
      const suggested = detectSuggestedLocale();
      setRegion(suggested.region);
      setLanguage('en');
      setHasPreference(false);
      setSelectorOpen(true);
    }
  }, []);

  const openSelector = useCallback(() => {
    setSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    if (hasPreference) {
      setSelectorOpen(false);
    }
  }, [hasPreference]);

  const setLocale = useCallback((pref: { region: RegionCode; language: LanguageCode; remember: boolean }) => {
    setRegion(pref.region);
    setLanguage('en');
    setRemember(pref.remember);
    setHasPreference(true);
    setSelectorOpen(false);

    if (pref.remember) {
      setCookie('tonet_locale_region', pref.region);
      setCookie('tonet_locale_lang', 'en');
      if (typeof window !== 'undefined') {
        localStorage.setItem('tonet_locale_region', pref.region);
        localStorage.setItem('tonet_locale_lang', 'en');
      }
    } else {
      setCookie('tonet_locale_region', '', -1);
      setCookie('tonet_locale_lang', '', -1);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tonet_locale_region');
        localStorage.removeItem('tonet_locale_lang');
      }
    }

    // Force clear googtrans cookie if any exists to prevent browser translations
    if (typeof document !== 'undefined') {
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      const hostParts = window.location.hostname.split('.');
      if (hostParts.length > 1) {
        const domain = '.' + hostParts.slice(-2).join('.');
        document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }

    // Reload page to apply regional settings immediately
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  const formatPrice = useCallback((amount: number, currencyCode: string): string => {
    const code = currencyCode || 'EUR';
    try {
      let formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      formatted = formatted.replace('€', '€ ').replace('$', '$ ');
      return `${formatted} ${code}`;
    } catch {
      const symbol = code === 'USD' ? '$ ' : '€ ';
      return `${symbol}${amount.toFixed(2)} ${code}`;
    }
  }, []);

  return (
    <LocaleContext.Provider value={{
      region,
      language,
      remember,
      selectorOpen: isMounted ? selectorOpen : false,
      hasPreference,
      setLocale,
      openSelector,
      closeSelector,
      formatPrice,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      region: 'ES' as const,
      language: 'en' as const,
      remember: false,
      selectorOpen: false,
      hasPreference: false,
      setLocale: () => {},
      openSelector: () => {},
      closeSelector: () => {},
      formatPrice: (amount: number, currencyCode: string) => `${currencyCode} ${amount}`,
    };
  }
  return context;
}
