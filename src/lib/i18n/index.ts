import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { LanguageCode } from './regions';
import { FALLBACK_LANGUAGE } from './regions';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

type LocaleMap = Record<string, unknown>;

const catalogs: Record<LanguageCode, LocaleMap> = { en, es, fr };

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

export function useTranslation() {
  const { language } = useLocale();

  const t = useMemo(() => {
    const lang = language as LanguageCode;
    const catalog = catalogs[lang] ?? catalogs[FALLBACK_LANGUAGE];
    const fallback = catalogs[FALLBACK_LANGUAGE];

    return (key: string, vars?: Record<string, string | number>): string => {
      const value =
        getNestedValue(catalog, key) ??
        getNestedValue(fallback, key) ??
        key;
      return interpolate(value, vars);
    };
  }, [language]);

  return { t };
}
