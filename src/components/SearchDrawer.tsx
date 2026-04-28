"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CollectionSummary } from "@/lib/shopify";
import { useUI } from "@/context/UIContext";
import { useTranslation } from "@/lib/i18n";

interface GridProduct {
  handle: string;
  title: string;
  imageUrl: string;
}

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [gridProducts, setGridProducts] = useState<GridProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    if (loaded) return;
    import("@/lib/shopify").then(({ getCollections }) => {
      getCollections(6).then((cols) => {
        setCollections(cols);
        setGridProducts(
          cols.slice(0, 6).map(c => ({ handle: c.handle, title: c.title, imageUrl: c.imageUrl }))
        );
        setLoaded(true);
      });
    });
  }, [loaded]);

  return (
    <>
      <div className={`sd-backdrop ${isSearchOpen ? "open" : ""}`} aria-hidden="true" />
      
      <div className={`sd-drawer ${isSearchOpen ? "open" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">
        
        {/* HEADER */}
        <div className="sd-header">
          <span className="sd-title">{t('search.title')}</span>
          <button className="sd-close" onClick={closeSearch} aria-label="Close search">
            {t('search.close')}
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="sd-input-sec">
          <div className="sd-input-box">
            <svg className="sd-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder={t('search.placeholder')} className="sd-input" autoFocus={isSearchOpen} />
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="sd-section">
          <div className="sd-section-title">{t('search.suggestions')}</div>
          <div className="sd-suggestions-list">
            {collections.length > 0
              ? collections.map((col) => (
                  <Link
                    href={`/collection/${col.handle}`}
                    key={col.handle}
                    className="sd-suggestion-link"
                    onClick={closeSearch}
                  >
                    {col.title}
                  </Link>
                ))
              : <span className="sd-empty">{t('search.noCollections')}</span>
            }
          </div>
        </div>

        {/* SUGGESTED PRODUCTS */}
        <div className="sd-section sd-section-products">
          <div className="sd-section-title">{t('search.suggestedProducts')}</div>
          <div className="sd-products-grid">
            {gridProducts.map((p) => (
              <Link href={`/collection/${p.handle}`} onClick={closeSearch} key={p.handle} className="sd-product-card">
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} />}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        /* BACKDROP */
        .sd-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.32);
          opacity: 0; pointer-events: none;
          transition: none;
          z-index: 1000;
        }
        .sd-backdrop.open { opacity: 1; pointer-events: auto; }

        /* DRAWER — single vertical column */
        .sd-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 60px;
          width: 370px; max-width: 100%;
          background: #FAF8F5; color: #000;
          z-index: 1001;
          transform: translateX(100%);
          transition: none;
          display: flex; flex-direction: column;
          overflow-y: auto;
          border-left: 1px solid #d0d0d0;
          font-family: Arial, Helvetica, sans-serif;
        }
        .sd-drawer.open { transform: translateX(0); }

        /* HEADER ROW */
        .sd-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 16px 20px 10px;
          border-bottom: 1px solid #111;
          flex-shrink: 0;
          background: #FAF8F5;
        }
        .sd-title {
          font-size: 11.5px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #111;
        }
        .sd-close {
          background: none; border: none;
          font-family: inherit;
          font-size: 11.5px; font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0033bb; cursor: pointer;
          padding: 0;
        }

        /* INPUT ROW — compact with bordered box */
        .sd-input-sec {
          padding: 5px 12px;
          border-bottom: 1px solid #111;
          background: #FAF8F5;
          flex-shrink: 0;
          transition: background 0.1s;
        }
        .sd-input-sec:focus-within { background: #ddeeff; }
        .sd-input-box {
          display: flex; align-items: center;
          gap: 7px;
          border: 1px solid #aaa;
          padding: 4px 8px;
          background: inherit;
        }
        .sd-search-icon { flex-shrink: 0; color: #888; }
        .sd-input {
          flex: 1; border: none; background: transparent;
          font-family: inherit;
          font-size: 11px; text-transform: uppercase;
          color: #111; outline: none;
        }
        .sd-input::placeholder { color: #bbb; }
        .sd-input:focus { caret-color: #0033bb; }

        /* SECTIONS */
        .sd-section {
          border-bottom: 1px solid #111;
          flex-shrink: 0;
        }
        .sd-section-products {
          border-bottom: none;
          flex-shrink: 0;
        }
        .sd-section-title {
          padding: 7px 16px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #444;
          background: #f0f0f0;
          border-bottom: 1px solid #ddd;
        }

        /* SUGGESTIONS — grey bg, blue links, grey separators */
        .sd-suggestions-list {
          display: flex; flex-direction: column;
          background: #f2f2f2;
        }
        .sd-suggestion-link {
          display: block;
          padding: 9px 16px;
          font-size: 12px;
          color: #0033bb;
          text-decoration: none;
          border-bottom: 1px solid #e0e0e0;
        }
        .sd-suggestion-link:last-child { border-bottom: none; }
        .sd-suggestion-link:hover { background: #eeeeee; }
        .sd-empty {
          display: block; padding: 8px 16px;
          font-size: 11px; color: #999;
          background: #f7f7f7;
        }

        /* PRODUCT GRID — uniform cells, contained images */
        .sd-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #ccc;
        }
        .sd-product-card {
          aspect-ratio: 1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FAF8F5;
          padding: 6px;
        }
        .sd-product-card:hover { background: #f5f5f5; }
        .sd-product-card img {
          width: 100%; height: 100%;
          display: block;
          object-fit: contain;
        }

        @media (max-width: 480px) {
          .sd-drawer { width: 100vw; border-left: none; }
        }
      `}</style>
    </>
  );
}
