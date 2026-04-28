export type RegionCode = 'ES' | 'US' | 'FR';
export type LanguageCode = 'es' | 'en' | 'fr';

export interface RegionConfig {
  code: RegionCode;
  currency: string;
  languages: LanguageCode[];
  defaultLanguage: LanguageCode;
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  ES: { code: 'ES', currency: 'EUR', languages: ['es', 'en'], defaultLanguage: 'es' },
  US: { code: 'US', currency: 'USD', languages: ['en', 'es'], defaultLanguage: 'en' },
  FR: { code: 'FR', currency: 'EUR', languages: ['fr', 'en'], defaultLanguage: 'fr' },
};

export const REGION_CODES: RegionCode[] = ['ES', 'US', 'FR'];
export const LANGUAGE_CODES: LanguageCode[] = ['es', 'en', 'fr'];

export const FALLBACK_LANGUAGE: LanguageCode = 'en';

export const regionLabels: Record<RegionCode, Record<LanguageCode, string>> = {
  ES: { es: 'España', en: 'Spain', fr: 'Espagne' },
  US: { es: 'Estados Unidos', en: 'United States', fr: 'États-Unis' },
  FR: { es: 'Francia', en: 'France', fr: 'France' },
};

export const languageLabels: Record<LanguageCode, Record<LanguageCode, string>> = {
  es: { es: 'Español', en: 'Spanish', fr: 'Espagnol' },
  en: { es: 'Inglés', en: 'English', fr: 'Anglais' },
  fr: { es: 'Francés', en: 'French', fr: 'Français' },
};

export function getRegionLabel(region: RegionCode, lang: LanguageCode): string {
  return regionLabels[region]?.[lang] ?? regionLabels[region]?.en ?? region;
}

export function getLanguageLabel(language: LanguageCode, displayLang: LanguageCode): string {
  return languageLabels[language]?.[displayLang] ?? languageLabels[language]?.en ?? language;
}

export function getAvailableLanguages(region: RegionCode): LanguageCode[] {
  return REGIONS[region]?.languages ?? ['en'];
}

export function isLanguageAvailable(region: RegionCode, lang: LanguageCode): boolean {
  return getAvailableLanguages(region).includes(lang);
}

export function detectSuggestedLocale(): { region: RegionCode; language: LanguageCode } {
  if (typeof navigator === 'undefined') return { region: 'US', language: 'en' };
  const navLang = navigator.language?.toLowerCase() ?? '';
  if (navLang.startsWith('es')) return { region: 'ES', language: 'es' };
  if (navLang.startsWith('fr')) return { region: 'FR', language: 'fr' };
  return { region: 'US', language: 'en' };
}
