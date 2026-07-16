"use client";

import { useLocale } from "@/context/LocaleContext";
import { getRegionLabel, getLanguageLabel, REGIONS } from "@/lib/i18n/regions";

export default function Footer() {
  const { region, language, openSelector } = useLocale();
  const regionLabel = getRegionLabel(region, language);
  const languageLabel = getLanguageLabel(language, language);
  const currency = REGIONS[region]?.currency || 'EUR';

  return (
    <footer className="ft">
      <div className="ft-inner">
        <span className="ft-copy">© 2026 TONET</span>
        <span className="ft-locale" onClick={openSelector}>
          {`${regionLabel} / ${languageLabel} / ${currency}`.toLowerCase()}
        </span>
      </div>

      <style>{`
        .ft {
          background: #ffffff;
          color: #888888;
          font-family: var(--font-primary), sans-serif;
          border-top: 1px solid #e5e5e5;
          text-transform: lowercase;
        }
        .ft-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          max-width: 1400px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .ft-copy {
          font-size: 11px;
          font-weight: 300;
          color: #888888;
          letter-spacing: 0.05em;
        }
        .ft-locale {
          font-size: 10px;
          font-weight: 300;
          color: #888888;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .ft-locale:hover {
          color: #000000;
        }
        @media (max-width: 767px) {
          .ft-inner {
            flex-direction: column;
            gap: 12px;
            padding: 20px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
