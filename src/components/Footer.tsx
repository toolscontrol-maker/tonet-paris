"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { getRegionLabel, getLanguageLabel, REGIONS } from "@/lib/i18n/regions";

export default function Footer() {
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  const { region, language, openSelector } = useLocale();
  const regionLabel = getRegionLabel(region, language);
  const languageLabel = getLanguageLabel(language, language);
  const currency = REGIONS[region]?.currency || 'EUR';

  const toggleCol = (colName: string) => {
    setExpandedCol(prev => prev === colName ? null : colName);
  };

  return (
    <footer className="ft">

      {/* ── MAIN BODY ── */}
      <div className="ft-body">

        {/* Left: Newsletter + Socials */}
        <div className="ft-left">
          <p className="ft-nl-label">newsletter</p>
          <div className="ft-nl">
            <div className="ft-nl-row">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email address"
                className="ft-nl-input"
              />
              <button className="ft-nl-btn" aria-label="Submit">→</button>
            </div>
            <p className="ft-nl-sub">subscribe to receive updates, launches and more.</p>
          </div>
          <div className="ft-socials-text">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">tiktok</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">youtube</a>
          </div>
        </div>

        {/* Right: Nav columns */}
        <div className="ft-nav">
          <div className="ft-nav-col">
            <p className="ft-col-head" onClick={() => toggleCol('customer-service')}>
              customer service
              <span className="ft-col-toggle">{expandedCol === 'customer-service' ? ' —' : ' +'}</span>
            </p>
            <ul className={`ft-links ${expandedCol === 'customer-service' ? 'open' : ''}`}>
              <li><Link href="/contact">contact us</Link></li>
              <li><Link href="#">shipping</Link></li>
              <li><Link href="#">returns</Link></li>
              <li><Link href="#">size guide</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head" onClick={() => toggleCol('corporate-info')}>
              corporate info
              <span className="ft-col-toggle">{expandedCol === 'corporate-info' ? ' —' : ' +'}</span>
            </p>
            <ul className={`ft-links ${expandedCol === 'corporate-info' ? 'open' : ''}`}>
              <li><Link href="/about">about tonet torrentinni</Link></li>
              <li><Link href="#">careers</Link></li>
              <li><Link href="#">stockists</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head" onClick={() => toggleCol('brand-world')}>
              brand world
              <span className="ft-col-toggle">{expandedCol === 'brand-world' ? ' —' : ' +'}</span>
            </p>
            <ul className={`ft-links ${expandedCol === 'brand-world' ? 'open' : ''}`}>
              <li><Link href="/collection">runways</Link></li>
              <li><Link href="/collection">campaigns</Link></li>
              <li><Link href="/stores">stores</Link></li>
              <li><Link href="/stores">store locator</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ── */}
      <div className="ft-bottom">
        <span className="ft-copy">© 2026 tonet torrentinni</span>
        <span className="ft-locale" onClick={openSelector}>
          {`${regionLabel} / ${languageLabel} / ${currency}`.toLowerCase()}
        </span>
      </div>

      <style>{`
        .ft {
          background: #333333;
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          text-transform: lowercase;
        }
        .ft a { text-decoration: none; }

        /* ── BODY ── */
        .ft-body {
          display: flex;
          padding: 80px 40px 60px;
          border-bottom: 1px solid #2d2d2d;
        }

        /* ── LEFT ── */
        .ft-left {
          flex: 0 0 40%;
          padding-right: 60px;
          display: flex;
          flex-direction: column;
        }
        .ft-nl-label {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #ffffff;
          margin: 0 0 32px;
          text-transform: lowercase;
        }
        .ft-nl { margin-bottom: 40px; }
        .ft-nl-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #ffffff;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .ft-nl-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 300;
          color: #ffffff;
          padding: 0;
          letter-spacing: 0.02em;
        }
        .ft-nl-input::placeholder { color: #888888; }
        .ft-nl-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          padding: 0 0 0 8px;
          line-height: 1;
          transition: opacity 0.3s ease;
        }
        .ft-nl-btn:hover { opacity: 0.6; }
        .ft-nl-sub {
          font-size: 10px;
          font-weight: 300;
          color: #888888;
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* ── SOCIALS TEXT LINKS ── */
        .ft-socials-text {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-top: auto;
        }
        .ft-socials-text a {
          color: rgba(255, 255, 255, 0.55);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }
        .ft-socials-text a:hover { color: #ffffff; }

        /* ── NAV ── */
        .ft-nav {
          flex: 1;
          display: flex;
          padding-left: 60px;
          gap: 60px;
        }
        .ft-nav-col { flex: 1; }
        .ft-col-head {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin: 0 0 24px;
          text-transform: lowercase;
        }
        .ft-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-links li a {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }
        .ft-links li a:hover { color: #ffffff; }

        /* ── BOTTOM ── */
        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
        }
        .ft-copy {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.55) !important;
          letter-spacing: 0.05em;
          font-family: var(--font-primary), sans-serif !important;
        }
        .ft-locale {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .ft-locale:hover { color: #ffffff; }
        
        .ft-col-toggle {
          display: none;
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .ft-body {
            flex-direction: column;
            padding: 40px 20px 30px;
            gap: 0;
          }
          .ft-left {
            flex: none;
            padding-right: 0;
            border-bottom: 1px solid #2d2d2d;
            padding-bottom: 40px;
            margin-bottom: 40px;
          }
          .ft-socials-text {
            margin-top: 24px;
            justify-content: flex-start;
          }
          .ft-nav {
            padding-left: 0;
            flex-direction: column;
            gap: 20px;
            width: 100%;
          }
          .ft-nav-col {
            width: 100%;
          }
          .ft-col-head {
            margin-bottom: 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #2d2d2d;
            padding: 14px 0; /* Ensures >= 44px tap target */
          }
          .ft-col-toggle {
            display: inline;
            font-size: 12px;
            font-weight: 300;
            color: #888888;
          }
          .ft-links {
            display: none;
            padding-top: 12px;
            padding-bottom: 16px;
            gap: 10px;
          }
          .ft-links.open {
            display: flex;
          }
          .ft-bottom {
            padding: 20px;
          }
          .ft-nl-input {
            font-size: 16px; /* Prevents auto-zoom on iOS */
          }
          .ft-col-head:active {
            background-color: #262626;
          }
          .ft-links li a:active,
          .ft-socials-text a:active,
          .ft-locale:active {
            opacity: 0.5;
          }
        }
      `}</style>

    </footer>
  );
}
