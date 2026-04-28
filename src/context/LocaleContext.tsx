"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';
import { REGIONS, FALLBACK_LANGUAGE, isLanguageAvailable, detectSuggestedLocale } from '@/lib/i18n/regions';

const COOKIE_NAME = 'site_locale';

interface LocalePref {
  region: RegionCode;
  language: LanguageCode;
  remember: boolean;
}

interface LocaleContextType {
  region: RegionCode;
  language: LanguageCode;
  remember: boolean;
  selectorOpen: boolean;
  hasPreference: boolean;
  setLocale: (pref: LocalePref) => void;
  openSelector: () => void;
  closeSelector: () => void;
  formatPrice: (amount: number, currencyCode: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function readCookie(): LocalePref | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (parsed.region && parsed.language) return parsed as LocalePref;
  } catch { /* ignore */ }
  return null;
}

function writeCookie(pref: LocalePref) {
  const payload = encodeURIComponent(JSON.stringify(pref));
  const maxAge = pref.remember ? 60 * 60 * 24 * 365 : '';
  const expires = pref.remember ? `; max-age=${maxAge}` : '';
  document.cookie = `${COOKIE_NAME}=${payload}; path=/; SameSite=Lax${expires}`;
}

function writeStorage(pref: LocalePref) {
  const data = JSON.stringify(pref);
  try {
    if (pref.remember) {
      localStorage.setItem(COOKIE_NAME, data);
      sessionStorage.removeItem(COOKIE_NAME);
    } else {
      sessionStorage.setItem(COOKIE_NAME, data);
      localStorage.removeItem(COOKIE_NAME);
    }
  } catch { /* storage unavailable */ }
}

function readStorage(): LocalePref | null {
  try {
    const ls = localStorage.getItem(COOKIE_NAME);
    if (ls) return JSON.parse(ls);
    const ss = sessionStorage.getItem(COOKIE_NAME);
    if (ss) return JSON.parse(ss);
  } catch { /* ignore */ }
  return null;
}

interface ProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function LocaleProvider({ children, initialLanguage }: ProviderProps) {
  const [region, setRegion] = useState<RegionCode>('US');
  const [language, setLanguage] = useState<LanguageCode>((initialLanguage as LanguageCode) || FALLBACK_LANGUAGE);
  const [remember, setRemember] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [hasPreference, setHasPreference] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const cookiePref = readCookie();
    const storagePref = readStorage();
    const pref = cookiePref ?? storagePref;

    if (pref) {
      setRegion(pref.region);
      setLanguage(pref.language);
      setRemember(pref.remember);
      setHasPreference(true);
    } else {
      const suggested = detectSuggestedLocale();
      setRegion(suggested.region);
      setLanguage(suggested.language);
      setHasPreference(false);
      setSelectorOpen(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLocale = useCallback((pref: LocalePref) => {
    let lang = pref.language;
    if (!isLanguageAvailable(pref.region, lang)) {
      lang = REGIONS[pref.region].defaultLanguage;
    }
    const finalPref: LocalePref = { region: pref.region, language: lang, remember: pref.remember };
    setRegion(finalPref.region);
    setLanguage(finalPref.language);
    setRemember(finalPref.remember);
    setHasPreference(true);
    writeCookie(finalPref);
    writeStorage(finalPref);
    setSelectorOpen(false);
  }, []);

  const openSelector = useCallback(() => setSelectorOpen(true), []);
  const closeSelector = useCallback(() => {
    if (hasPreference) setSelectorOpen(false);
  }, [hasPreference]);

  const formatPrice = useCallback((amount: number, currencyCode: string): string => {
    const localeTag = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';
    try {
      return new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: currencyCode || 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  }, [language]);

  return (
    <LocaleContext.Provider value={{
      region, language, remember, selectorOpen, hasPreference,
      setLocale, openSelector, closeSelector, formatPrice,
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
