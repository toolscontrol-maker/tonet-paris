'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product, getOptimizedImageUrl } from '@/lib/shopify';

interface HomeCollectionProps {
  products: Product[];
}

function extractUniqueOptions(product: Product, optionName: string) {
  const vals = new Set<string>();
  product.variants.forEach(v => {
    v.selectedOptions.forEach(o => {
      if (o.name.toLowerCase().includes(optionName.toLowerCase())) {
        vals.add(o.value);
      }
    });
  });
  return Array.from(vals);
}

function colorToCss(color: string): string {
  const map: Record<string, string> = {
    black: '#0a0a0a', white: '#f5f5f5', grey: '#666', gray: '#666',
    navy: '#1a1a2e', beige: '#d4c4a8', cream: '#f0efe9',
    brown: '#5c4033', camel: '#c19a6b', olive: '#556b2f',
  };
  const lc = color.toLowerCase().trim();
  return map[lc] || lc;
}

export default function HomeCollection({ products }: HomeCollectionProps) {
  const [activeTab, setActiveTab] = useState<'him' | 'her'>('him');

  const himProducts = useMemo(() => {
    const tagged = products.filter(p =>
      p.tags.some(t => /men|him|male|hombre/i.test(t))
    );
    return tagged.length > 0 ? tagged.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const herProducts = useMemo(() => {
    const tagged = products.filter(p =>
      p.tags.some(t => /women|her|female|mujer/i.test(t))
    );
    return tagged.length > 0 ? tagged.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const display = activeTab === 'him' ? himProducts : herProducts;

  return (
    <section className="hc">
      <div className="hc-header">
        <p className="hc-season">TONET TORRENTINNI — SS MMXXVI</p>
        <h2 className="hc-title">The Collection</h2>
        <div className="hc-tabs">
          <button
            className={`hc-tab${activeTab === 'him' ? ' active' : ''}`}
            onClick={() => setActiveTab('him')}
          >
            FOR HIM
          </button>
          <span className="hc-divider" />
          <button
            className={`hc-tab${activeTab === 'her' ? ' active' : ''}`}
            onClick={() => setActiveTab('her')}
          >
            FOR HER
          </button>
        </div>
        <p className="hc-editorial-sub">Curated for permanence</p>
      </div>

      <div className="hc-grid">
        {display.map(product => {
          const colors = extractUniqueOptions(product, 'color');
          const sizes = extractUniqueOptions(product, 'size');
          return (
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="hc-card"
            >
              <div className="hc-img-wrap">
                {product.imageUrl && (
                  <img
                    src={getOptimizedImageUrl(product.imageUrl, 700)}
                    alt={product.title}
                    className="hc-img"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className="hc-info">
                <span className="hc-name">{product.title}</span>
                <span className="hc-price">
                  {product.currencyCode === 'USD' ? '$ ' : '€ '}
                  {Number(product.price).toFixed(2)}
                </span>
                {colors.length > 0 && (
                  <div className="hc-swatches">
                    {colors.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="hc-swatch"
                        style={{ background: colorToCss(c) }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
                {sizes.length > 0 && (
                  <div className="hc-sizes">
                    {sizes.slice(0, 5).map((s, i) => (
                      <span key={i} className="hc-size">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/search" className="hc-all">Enter the Collection</Link>

      <style>{`
        .hc {
          background: #0a0a0a;
          padding: 140px 80px 120px;
        }
        .hc-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .hc-season {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin: 0 0 18px;
        }
        .hc-title {
          font-family: var(--font-primary);
          font-size: clamp(22px, 2.8vw, 36px);
          font-weight: 200;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.85);
          text-transform: uppercase;
          margin: 0 0 48px;
        }
        .hc-tabs {
          display: inline-flex;
          align-items: center;
          gap: 28px;
          margin-bottom: 24px;
        }
        .hc-editorial-sub {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin: 0;
        }
        .hc-tab {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          background: none;
          border: none;
          border-bottom: 1px solid transparent;
          padding: 0 0 6px;
          cursor: pointer;
          transition: color 0.5s ease, border-color 0.5s ease;
        }
        .hc-tab:hover {
          color: rgba(255,255,255,0.55);
        }
        .hc-tab.active {
          color: rgba(255,255,255,0.75);
          border-bottom-color: rgba(255,255,255,0.35);
        }
        .hc-divider {
          display: inline-block;
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.1);
        }
        .hc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          max-width: 1400px;
          margin: 0 auto 72px;
        }
        .hc-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #100f0d;
          overflow: hidden;
          transition: background 0.6s ease;
        }
        .hc-card:hover {
          background: #161410;
        }
        .hc-img-wrap {
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #100f0d;
        }
        .hc-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          opacity: 0.7;
          transition: opacity 0.8s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .hc-card:hover .hc-img {
          opacity: 1;
          transform: scale(1.02);
        }
        .hc-info {
          padding: 18px 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: transparent;
        }
        .hc-name {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hc-price {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.06em;
        }
        .hc-swatches {
          display: flex;
          gap: 6px;
          margin-top: 2px;
        }
        .hc-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          flex-shrink: 0;
          transition: border-color 0.4s ease;
        }
        .hc-swatch:hover {
          border-color: rgba(255,255,255,0.6);
        }
        .hc-sizes {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .hc-size {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          padding: 3px 7px;
          line-height: 1;
          text-transform: uppercase;
          transition: border-color 0.4s ease, color 0.4s ease;
        }
        .hc-size:hover {
          border-color: rgba(255,255,255,0.4);
          color: #fff;
        }
        .hc-all {
          display: block;
          text-align: center;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 5px;
          width: fit-content;
          margin: 0 auto;
          transition: color 0.5s, border-color 0.5s;
        }
        .hc-all:hover {
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.3);
          opacity: 1 !important;
        }

        @media (max-width: 1024px) {
          .hc { padding: 100px 40px 80px; }
          .hc-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 767px) {
          .hc { padding: 80px 20px 60px; }
          .hc-grid { grid-template-columns: 1fr; gap: 2px; }
          .hc-title { font-size: 22px; margin-bottom: 32px; }
          .hc-tabs { gap: 20px; }
          .hc-tab { font-size: 9px; letter-spacing: 0.35em; }
        }
      `}</style>
    </section>
  );
}
