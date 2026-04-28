'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';

const STORAGE_KEY = 'i18n_desc_cache';

/** Read the localStorage-backed translation cache */
function readCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Write a single entry into the localStorage-backed cache */
function writeCache(key: string, value: string) {
  try {
    const c = readCache();
    c[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    // localStorage unavailable — ignore
  }
}

/**
 * Translates arbitrary English text to the currently selected language.
 * Returns the original text immediately (no flash of empty content)
 * and swaps to the translated version once the API responds.
 * Results are cached in localStorage so subsequent renders are instant.
 */
export function useTranslatedText(text: string | undefined | null): string {
  const { language } = useLocale();
  const fallback = text ?? '';

  const [translated, setTranslated] = useState<string>(() => {
    if (!text || language === 'en') return fallback;
    const cached = readCache()[`${language}:${text}`];
    return cached ?? fallback;
  });

  useEffect(() => {
    if (!text || language === 'en') {
      setTranslated(fallback);
      return;
    }

    const cacheKey = `${language}:${text}`;
    const cached = readCache()[cacheKey];
    if (cached) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: language }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.translated) {
          writeCache(cacheKey, data.translated);
          setTranslated(data.translated);
        }
      })
      .catch(() => {
        if (!cancelled) setTranslated(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [text, language, fallback]);

  return translated;
}
