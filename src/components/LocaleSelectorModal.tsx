"use client";

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import {
  REGION_CODES,
  getRegionLabel,
  getLanguageLabel,
  getAvailableLanguages,
  REGIONS,
  detectSuggestedLocale,
} from '@/lib/i18n/regions';
import type { RegionCode, LanguageCode } from '@/lib/i18n/regions';
import { useTranslation } from '@/lib/i18n';

export default function LocaleSelectorModal() {
  const { selectorOpen, hasPreference, setLocale, closeSelector, region, language } = useLocale();
  const { t } = useTranslation();

  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(region);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language);
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    if (selectorOpen) {
      if (hasPreference) {
        setSelectedRegion(region);
        setSelectedLanguage(language);
      } else {
        const suggested = detectSuggestedLocale();
        setSelectedRegion(suggested.region);
        setSelectedLanguage(suggested.language);
      }
    }
  }, [selectorOpen, hasPreference, region, language]);

  const availableLanguages = getAvailableLanguages(selectedRegion);

  function handleRegionChange(code: RegionCode) {
    setSelectedRegion(code);
    if (!availableLanguages.includes(selectedLanguage) || !getAvailableLanguages(code).includes(selectedLanguage)) {
      setSelectedLanguage(REGIONS[code].defaultLanguage);
    }
  }

  function handleContinue() {
    setLocale({ region: selectedRegion, language: selectedLanguage, remember: rememberChoice });
  }

  if (!selectorOpen) return null;

  const isBlocking = !hasPreference;
  const displayLang = hasPreference ? language : selectedLanguage;

  return (
    <>
      <div className="ls-overlay" onClick={isBlocking ? undefined : closeSelector} />
      <div className="ls-modal" role="dialog" aria-modal="true">
        <div className="ls-logo">★ TONET PARIS®</div>

        <h2 className="ls-title">{t('locale.title')}</h2>

        <label className="ls-label">{t('locale.region')}</label>
        <select
          className="ls-select"
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value as RegionCode)}
        >
          {REGION_CODES.map((code) => (
            <option key={code} value={code}>
              {getRegionLabel(code, displayLang)}
            </option>
          ))}
        </select>

        <label className="ls-label">{t('locale.language')}</label>
        <select
          className="ls-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
        >
          {getAvailableLanguages(selectedRegion).map((code) => (
            <option key={code} value={code}>
              {getLanguageLabel(code, displayLang)}
            </option>
          ))}
        </select>

        <label className="ls-remember">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
          />
          <span>{t('locale.remember')}</span>
        </label>

        <button className="ls-continue" onClick={handleContinue}>
          {t('locale.continue')}
        </button>

        {!isBlocking && (
          <button className="ls-close-btn" onClick={closeSelector} aria-label="Close">✕</button>
        )}
      </div>

      <style>{`
        .ls-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 9998;
        }
        .ls-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: #fff;
          width: 380px;
          max-width: calc(100vw - 40px);
          padding: 48px 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 0;
          font-family: 'Creato Display', sans-serif;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }
        .ls-logo {
          font-family: var(--font-brand);
          font-size: 26px;
          font-weight: normal;
          letter-spacing: 0.01em;
          text-align: center;
          margin-bottom: 32px;
          color: #111;
        }
        .ls-title {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #0000cc;
          margin: 0 0 28px;
          text-align: center;
        }
        .ls-label {
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
          margin-bottom: 6px;
        }
        .ls-select {
          width: 100%;
          padding: 12px 14px;
          border: none;
          border-bottom: 1px solid #ccc;
          font-size: 13px;
          font-family: inherit;
          font-weight: 400;
          color: #111;
          background: transparent;
          outline: none;
          margin-bottom: 24px;
          cursor: pointer;
          appearance: none;
          border-radius: 0;
        }
        .ls-select:focus { border-bottom-color: #111; }
        .ls-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0 28px;
          cursor: pointer;
        }
        .ls-remember input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #111;
          cursor: pointer;
        }
        .ls-remember span {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #111;
        }
        .ls-continue {
          width: 100%;
          padding: 16px;
          border: 1px solid #111;
          background: #fff;
          color: #111;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ls-continue:hover {
          background: #111;
          color: #fff;
        }
        .ls-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #999;
          padding: 4px;
          line-height: 1;
        }
        .ls-close-btn:hover { color: #111; }

        @media (max-width: 480px) {
          .ls-modal {
            width: 100vw;
            max-width: 100vw;
            height: 100vh;
            top: 0; left: 0;
            transform: none;
            padding: 60px 28px 40px;
            justify-content: center;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
}
