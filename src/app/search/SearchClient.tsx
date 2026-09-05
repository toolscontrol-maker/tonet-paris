'use client';

import Link from 'next/link';
import type { Product, CollectionSummary } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  query: string;
  products: Product[];
  collections: CollectionSummary[];
}

// Function to classify product for optical image scaling classes
function getProductImageClass(title: string, tags: string[]): string {
  const tLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase());

  const isSneaker = tLower.includes('sneaker') || tLower.includes('shoes') || tLower.includes('clog') || tagsLower.includes('footwear') || tagsLower.includes('sneakers');
  const isPants = tLower.includes('pants') || tLower.includes('shorts') || tLower.includes('trouser') || tagsLower.includes('bottoms') || tagsLower.includes('pants');
  const isAccessory = tLower.includes('ball') || tLower.includes('sunglasses') || tLower.includes('bag') || tagsLower.includes('accessories');
  
  if (isSneaker) return 'amiri-product-img--sneaker';
  if (isPants) return 'amiri-product-img--pants';
  if (isAccessory) return 'amiri-product-img--accessory';
  return 'amiri-product-img--top'; // Default
}

// Helper to determine gender category
function getProductGender(p: Product): 'men' | 'women' {
  const titleLower = p.title.toLowerCase();
  const tagsLower = p.tags.map(t => t.toLowerCase());
  
  const isWomen = tagsLower.includes('women') || 
                  tagsLower.includes('woman') || 
                  tagsLower.includes('women\'s') ||
                  tagsLower.includes('wmns') ||
                  titleLower.includes('women') || 
                  titleLower.includes('woman');
                  
  return isWomen ? 'women' : 'men';
}

export default function SearchClient({ query, products, collections }: Props) {
  const { formatPrice } = useLocale();

  const menProducts = useMemo(() => products.filter(p => getProductGender(p) === 'men'), [products]);
  const womenProducts = useMemo(() => products.filter(p => getProductGender(p) === 'women'), [products]);

  const totalResults = products.length;

  return (
    <div className="amiri-search-container">
      
      {/* TOP SEARCH HEADER BLOCK */}
      <div className="amiri-search-top">
        <h1 className="amiri-search-title">Search results</h1>
        
        {query && (
          <p className="amiri-search-counter">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found for
          </p>
        )}
        
        <div className="amiri-search-term-line">
          <span>{query ? query : 'Empty Search'}</span>
        </div>
      </div>

      {/* RESULTS SPLIT LAYOUT */}
      {totalResults > 0 ? (
        <div className="amiri-search-split">
          
          {/* MEN COLUMN */}
          <div className="amiri-search-column">
            <h2 className="amiri-search-column-title">
              MEN <span className="amiri-search-column-count">[{menProducts.length}]</span>
            </h2>
            
            {menProducts.length > 0 ? (
              <div className="amiri-search-grid">
                {menProducts.map(p => {
                  const imageClass = getProductImageClass(p.title, p.tags);
                  return (
                    <Link key={p.handle} href={`/product/${p.handle}`} className={`amiri-search-card ${p.images && p.images.length > 1 ? 'amiri-search-card--has-hover' : ''}`}>
                      <span className="amiri-search-card-tag">NEW IN</span>
                      <div className={`amiri-search-img-wrap ${p.isManual ? 'amiri-search-img-wrap--custom tonet-custom-slide-fill' : ''}`}>
                        {p.imageUrl && (
                          <img 
                            src={p.imageUrl} 
                            alt={p.title} 
                            className={`amiri-search-img amiri-search-img--primary ${imageClass} ${p.isManual ? 'tonet-custom-img-fill' : ''}`} 
                          />
                        )}
                        {p.images && p.images.length > 1 && (
                          <img 
                            src={p.images[1]} 
                            alt={p.title} 
                            className={`amiri-search-img amiri-search-img--secondary ${imageClass} ${p.isManual ? 'tonet-custom-img-fill' : ''}`} 
                          />
                        )}
                      </div>
                      <div className="amiri-search-meta">
                        <span className="amiri-search-name">{p.title}</span>
                        <span className="amiri-search-price">
                          {formatPrice(p.price, p.currencyCode)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="amiri-search-column-empty">
                <span>NO MEN PRODUCTS MATCHING THE ACTIVE SEARCH TERM</span>
              </div>
            )}
          </div>

          {/* CENTRAL DIVIDER */}
          <div className="amiri-search-divider" aria-hidden="true" />

          {/* WOMEN COLUMN */}
          <div className="amiri-search-column">
            <h2 className="amiri-search-column-title">
              WOMEN <span className="amiri-search-column-count">[{womenProducts.length}]</span>
            </h2>
            
            {womenProducts.length > 0 ? (
              <div className="amiri-search-grid">
                {womenProducts.map(p => {
                  const imageClass = getProductImageClass(p.title, p.tags);
                  return (
                    <Link key={p.handle} href={`/product/${p.handle}`} className={`amiri-search-card ${p.images && p.images.length > 1 ? 'amiri-search-card--has-hover' : ''}`}>
                      <span className="amiri-search-card-tag">NEW IN</span>
                      <div className={`amiri-search-img-wrap ${p.isManual ? 'amiri-search-img-wrap--custom tonet-custom-slide-fill' : ''}`}>
                        {p.imageUrl && (
                          <img 
                            src={p.imageUrl} 
                            alt={p.title} 
                            className={`amiri-search-img amiri-search-img--primary ${imageClass} ${p.isManual ? 'tonet-custom-img-fill' : ''}`} 
                          />
                        )}
                        {p.images && p.images.length > 1 && (
                          <img 
                            src={p.images[1]} 
                            alt={p.title} 
                            className={`amiri-search-img amiri-search-img--secondary ${imageClass} ${p.isManual ? 'tonet-custom-img-fill' : ''}`} 
                          />
                        )}
                      </div>
                      <div className="amiri-search-meta">
                        <span className="amiri-search-name">{p.title}</span>
                        <span className="amiri-search-price">
                          {formatPrice(p.price, p.currencyCode)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="amiri-search-column-empty">
                <span>NO WOMEN PRODUCTS MATCHING THE ACTIVE SEARCH TERM</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="amiri-search-empty">
          <p>NO RESULTS FOUND FOR &ldquo;{query}&rdquo;.</p>
          <p className="amiri-search-empty-sub">TRY A DIFFERENT TERM OR BROWSE OUR COLLECTIONS.</p>
          <Link href="/collection/frontpage" className="amiri-search-empty-link">
            VIEW ALL COLLECTIONS
          </Link>
        </div>
      )}



      <style>{`
        /* AMIRI LUXURY EDITORIAL SEARCH RESULTS PAGE STYLE REPLICA */
        .amiri-search-container {
          padding-top: 56px;
          padding-bottom: 120px;
          background-color: #ffffff;
        }

        /* TOP SEARCH HEADER BLOCK */
        .amiri-search-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 40px 64px;
          box-sizing: border-box;
          text-align: center;
        }
        .amiri-search-title {
          font-family: var(--font-brand), var(--font-serif), serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 300;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 16px;
          line-height: 1.1;
        }
        .amiri-search-counter {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.4);
          margin: 0 0 24px;
        }
        .amiri-search-term-line {
          display: inline-block;
          border-bottom: 1px solid #000000;
          padding-bottom: 6px;
          min-width: 280px;
          max-width: 80%;
        }
        .amiri-search-term-line span {
          font-family: var(--font-primary), sans-serif;
          font-size: 20px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
        }

        /* RESULTS SPLIT LAYOUT */
        .amiri-search-split {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0;
          padding: 0 2px; /* almost a thread / hairline spacing at the left and right outer borders */
          box-sizing: border-box;
          align-items: stretch;
          width: 100%;
        }

        .amiri-search-column {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .amiri-search-column:first-of-type {
          padding-right: 40px;
        }
        .amiri-search-column:last-of-type {
          padding-left: 40px;
        }

        .amiri-search-column-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #000000;
          margin: 0 0 32px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .amiri-search-column-count {
          color: rgba(0, 0, 0, 0.4);
          font-weight: 300;
          margin-left: 4px;
        }

        /* CENTRAL DIVIDER */
        .amiri-search-divider {
          width: 1px;
          background-color: rgba(0, 0, 0, 0.08);
          align-self: stretch;
        }

        /*独立 GENDER GRID */
        .amiri-search-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px; /* tight spacing matching the carousel */
          background-color: transparent;
          border: none;
        }

        .amiri-search-column-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 24px;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #888888;
          text-align: center;
          border: 1px dashed rgba(0, 0, 0, 0.06);
          background-color: #fafafa;
        }

        /* CARD STYLE */
        .amiri-search-card {
          background-color: #f7f8fa;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          aspect-ratio: 3 / 5; /* matches collection page */
        }
        .amiri-search-card-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #000000;
          z-index: 2;
        }
        .amiri-search-img-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px; /* clean spacing for garments */
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          position: relative;
          isolation: isolate;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
        }
        @media (max-width: 767px) {
          .amiri-search-img-wrap {
            padding: 8px; /* optimized spacing on mobile */
          }
        }

        .amiri-search-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain; /* contained inside the wrapper */
          mix-blend-mode: multiply;
        }

        .amiri-search-img--primary {
          opacity: 1;
          transition: opacity 0.2s ease-in-out;
        }
        .amiri-search-img--secondary {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          bottom: 12px;
          width: calc(100% - 24px);
          height: calc(100% - 24px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-in-out;
        }
        @media (max-width: 767px) {
          .amiri-search-img--secondary {
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
            width: calc(100% - 16px);
            height: calc(100% - 16px);
          }
        }

        /* Hover behaviors */
        .amiri-search-card:hover {
          opacity: 1 !important; /* prevent transparent white overlay */
        }
        .amiri-search-card--has-hover:hover .amiri-search-img--primary {
          opacity: 0;
        }
        .amiri-search-card--has-hover:hover .amiri-search-img--secondary {
          opacity: 1;
        }

        /* Optical Scaling classes - Overridden for full fill */
        .amiri-product-img--top,
        .amiri-product-img--pants,
        .amiri-product-img--sneaker,
        .amiri-product-img--accessory {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .amiri-search-meta {
          padding: 16px 20px;
          background-color: #f7f8fa;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-sizing: border-box;
          z-index: 2;
          width: 100%;
          align-items: flex-start;
          text-align: left;
        }
        .amiri-search-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #000000;
          margin: 0;
          line-height: 1.3;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .amiri-search-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 300;
          color: #555555;
          letter-spacing: 0.08em;
          margin: 0;
        }

        /* EMPTY STATE */
        .amiri-search-empty {
          padding: 80px 24px;
          text-align: center;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #888888;
        }
        .amiri-search-empty-sub {
          font-size: 9.5px;
          margin-top: 12px;
          color: rgba(0, 0, 0, 0.4);
          letter-spacing: 0.1em;
        }
        .amiri-search-empty-link {
          display: inline-block;
          margin-top: 32px;
          color: #000000;
          border-bottom: 1px solid #000000;
          padding-bottom: 4px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* FLOATING MONOGRAM BADGE */
        .amiri-monogram-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: #ffffff;
          font-family: var(--font-brand);
          font-size: 18px;
          z-index: 999;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .amiri-monogram-badge:hover {
          transform: scale(1.05);
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1023px) {
          .amiri-search-split {
            grid-template-columns: 1fr 1px 1fr;
          }
          .amiri-search-column:first-of-type {
            padding-right: 20px;
          }
          .amiri-search-column:last-of-type {
            padding-left: 20px;
          }
          .amiri-search-grid {
            grid-template-columns: 1fr; /* single column on tablet sides */
          }
        }

        @media (max-width: 767px) {
          .amiri-search-top {
            padding: 40px 20px 48px;
          }
          .amiri-search-split {
            grid-template-columns: 1fr; /* stack columns vertically on mobile */
            padding: 0 2px;
          }
          .amiri-search-column:first-of-type {
            padding-right: 0;
            margin-bottom: 48px;
          }
          .amiri-search-column:last-of-type {
            padding-left: 0;
          }
          .amiri-search-divider {
            height: 1px;
            width: 100%;
            margin: 24px 0 48px 0;
            background-color: rgba(0, 0, 0, 0.08);
          }
          .amiri-search-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns inside each gender on mobile */
          }
        }
      `}</style>

    </div>
  );
}

// React useMemo import helper
import { useMemo } from 'react';
