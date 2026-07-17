'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/shopify';

interface CollectionLandingClientProps {
  products: Product[];
}

const getArchiveRef = (handle: string) => {
  const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const num = String((hash % 9000) + 1000).padStart(4, '0');
  return `ARC-26-${num}`;
};

const getCollectionInfo = (product: Product) => {
  const matchText = (product.title + ' ' + product.description).toLowerCase();
  if (matchText.includes('grey') || matchText.includes('gray') || matchText.includes('light') || matchText.includes('shadow')) {
    return 'HOUSE_02 — LIGHT & FORM';
  } else if (product.tags.some(t => /essential|core|foundation/i.test(t)) || matchText.includes('black')) {
    return 'HOUSE_01 — PERMANENCE';
  } else {
    return 'HOUSE_03 — ORGANIC CHROMATIC';
  }
};

const getGarmentType = (product: Product): 'tops' | 'bottoms' | 'outerwear' => {
  const title = product.title.toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase());

  const isOuterwear = tags.includes('outerwear') || tags.includes('jacket') || tags.includes('coat') || title.includes('jacket') || title.includes('coat') || title.includes('bomber') || title.includes('trench') || title.includes('hoodie');
  const isBottoms = tags.includes('pants') || tags.includes('shorts') || tags.includes('bottoms') || tags.includes('trousers') || title.includes('shorts') || title.includes('pants') || title.includes('trousers') || title.includes('jogger');

  if (isOuterwear) return 'outerwear';
  if (isBottoms) return 'bottoms';
  return 'tops';
};

const hasBlackColor = (product: Product): boolean => {
  return product.variants.some(v => 
    v.selectedOptions.some(opt => {
      const name = opt.name.toLowerCase();
      if (name === 'color' || name === 'colour') {
        const val = opt.value.toLowerCase();
        return val.includes('black') || val.includes('negro');
      }
      return false;
    })
  );
};

const philosophicalQuotes = [
  "We are not interested in trends. Only permanence and the raw truth of nature.",
  "Repetition is the ultimate form of restraint, mirroring the eternal cycles of landscapes.",
  "A garment is not a transaction. It is an artifact of the House of Tonet Torrentinni.",
  "Restraint is not the absence of design. It is the absolute presence of intention, shaped by natural simplicity.",
  "Garments are not products. They are pieces of a cumulative archive under nature's silent watch."
];

export default function CollectionLandingClient({ products }: CollectionLandingClientProps) {
  // Advanced Archive Indexing State
  const [filterGarmentType, setFilterGarmentType] = useState<'all' | 'tops' | 'bottoms' | 'outerwear'>('all');
  const [filterCollection, setFilterCollection] = useState<'all' | 'HOUSE_01' | 'HOUSE_02' | 'HOUSE_03'>('all');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'archived'>('all');

  const registryStartRef = useRef<HTMLDivElement>(null);

  // Cinematic Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('.archive-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filterGarmentType, filterCollection, filterState]);

  const scrollToRegistry = () => {
    if (registryStartRef.current) {
      registryStartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine availability of a product
  const isAvailable = (product: Product) => {
    return product.variants.some(v => v.availableForSale);
  };

  // Live museum metadata statistics calculation
  const stats = useMemo(() => {
    const total = products.length;
    const collections = 3;
    const archived = products.filter(p => !isAvailable(p)).length;
    const active = total - archived;

    return { total, collections, archived, active };
  }, [products]);

  // Archive filtered grid
  const filteredProducts = useMemo(() => {
    // Validate: filter out invalid products
    const validProducts = products.filter(p => p && typeof p === 'object' && p.handle);
    
    // Log missing images for debugging
    validProducts.forEach((product) => {
      if (!product.imageUrl) console.warn("Missing image:", product);
    });

    const filtered = validProducts.filter(product => {
      // 1. Garment Type filter
      if (filterGarmentType !== 'all') {
        if (getGarmentType(product) !== filterGarmentType) return false;
      }

      // 2. Collection filter
      if (filterCollection !== 'all') {
        const col = getCollectionInfo(product);
        if (!col.includes(filterCollection)) return false;
      }

      // 3. House State filter
      if (filterState !== 'all') {
        const available = isAvailable(product);
        if (filterState === 'active' && !available) return false;
        if (filterState === 'archived' && available) return false;
      }

      return true;
    });

    // Sort by color first (black first), then by garment type (tops/camisetas first, bottoms/pantalones second, outerwear/others third)
    return [...filtered].sort((a, b) => {
      const blackA = hasBlackColor(a) ? 0 : 1;
      const blackB = hasBlackColor(b) ? 0 : 1;
      if (blackA !== blackB) return blackA - blackB;

      const typeA = getGarmentType(a);
      const typeB = getGarmentType(b);
      const scoreA = typeA === 'tops' ? 0 : typeA === 'bottoms' ? 1 : 2;
      const scoreB = typeB === 'tops' ? 0 : typeB === 'bottoms' ? 1 : 2;
      return scoreA - scoreB;
    });
  }, [products, filterGarmentType, filterCollection, filterState]);

  return (
    <div className="tonet-archive">
            {/* ── HEADER / HERO (Compact 35-45vh Viewport) ── */}
      <section className="tonet-archive-hero">
        <div className="tonet-archive-hero__bg-overlay" />
        <img
          src="/hero/collection_garden_landscape.png"
          alt="TONET TORRENTINNI Archival Imagery"
          className="tonet-archive-hero__image"
          draggable={false}
        />
        <div className="tonet-archive-hero__content">
          <p className="tonet-archive-hero__eyebrow">HOUSE OF TONET TORRENTINNI</p>
          <h1 className="tonet-archive-hero__title">THE COLLECTION</h1>
          <p className="tonet-archive-hero__subtitle">
            A registry of garments produced and preserved by the House, inspired by the geometry of natural landscapes.
          </p>
          
          {/* Subtle Museum Metadata Stats */}
          <div className="tonet-archive-stats">
            <span className="tonet-archive-stats__item">PIECES · {stats.total}</span>
            <span className="tonet-archive-stats__divider">|</span>
            <span className="tonet-archive-stats__item">COLLECTIONS · {stats.collections}</span>
            <span className="tonet-archive-stats__divider">|</span>
            <span className="tonet-archive-stats__item">ARCHIVED · {stats.archived}</span>
            <span className="tonet-archive-stats__divider">|</span>
            <span className="tonet-archive-stats__item">ACTIVE · {stats.active}</span>
          </div>
        </div>
      </section>

      {/* ── COMPACT FILTER BAR (1 Compact Row, Max Height 80-100px) ── */}
      <section className="tonet-archive-controls" ref={registryStartRef}>
        <div className="tonet-archive-controls__container">
          
          {/* Column 1: Count */}
          <div className="tonet-archive-controls__col tonet-archive-controls__col--info">
            <span className="tonet-archive-controls__text">
              ALL PIECES · {filteredProducts.length} GARMENTS
            </span>
          </div>

          <div className="tonet-archive-controls__divider-vertical" />

          {/* Column 2: Garment Type */}
          <div className="tonet-archive-controls__col tonet-archive-controls__col--types">
            <div className="tonet-archive-filter__options">
              {(['all', 'tops', 'bottoms', 'outerwear'] as const).map(t => (
                <button
                  key={t}
                  className={`tonet-archive-filter__btn ${filterGarmentType === t ? 'active' : ''}`}
                  onClick={() => setFilterGarmentType(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="tonet-archive-controls__divider-vertical" />

          {/* Column 3: Collection */}
          <div className="tonet-archive-controls__col tonet-archive-controls__col--collections">
            <div className="tonet-archive-filter__options">
              {(['all', 'HOUSE_01', 'HOUSE_02', 'HOUSE_03'] as const).map(c => (
                <button
                  key={c}
                  className={`tonet-archive-filter__btn ${filterCollection === c ? 'active' : ''}`}
                  onClick={() => setFilterCollection(c)}
                >
                  {c === 'all' ? 'ALL COLLECTIONS' : c.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="tonet-archive-controls__divider-vertical" />

          {/* Column 4: House State */}
          <div className="tonet-archive-controls__col tonet-archive-controls__col--states">
            <div className="tonet-archive-filter__options">
              {(['all', 'active', 'archived'] as const).map(s => (
                <button
                  key={s}
                  className={`tonet-archive-filter__btn ${filterState === s ? 'active' : ''}`}
                  onClick={() => setFilterState(s)}
                >
                  {s === 'all' ? 'ALL ARCHIVE' : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN PRODUCT GRID (2-Column Architectural Layout) ── */}
      <section className="tonet-archive-grid-section">
        <div className="tonet-archive-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const archiveRef = getArchiveRef(product.handle);
              const collectionInfo = getCollectionInfo(product);
              const available = isAvailable(product);
              const hasImage = product.imageUrl && product.imageUrl.trim().length > 0;
              const secondImage = product.images && product.images.length > 1 ? product.images[1] : null;

              // Insert an editorial quote block periodically
              const shouldShowQuote = index > 0 && index % 6 === 0;
              const quoteIndex = Math.floor(index / 6) % philosophicalQuotes.length;
              const quoteText = philosophicalQuotes[quoteIndex];

              return (
                <div key={product.handle} className="tonet-archive-grid__wrapper">
                  
                  {shouldShowQuote && (
                    <div className="tonet-archive-quote archive-reveal">
                      <p className="tonet-archive-quote__text">"{quoteText}"</p>
                      <span className="tonet-archive-quote__sub">TONET TORRENTINNI RESEARCH ARCHIVE</span>
                    </div>
                  )}

                  <Link href={`/product/${product.handle}`} className="tonet-archive-card archive-reveal">
                    {/* Architectural Image Wrapper with museum stone background */}
                    <div className="tonet-archive-card__image-wrap">
                      {hasImage ? (
                        <>
                          <img
                            src={product.imageUrl}
                            alt={product.title || "TONET garment"}
                            className="tonet-archive-card__image tonet-archive-card__image--primary"
                            loading="lazy"
                          />
                          {secondImage && (
                            <img
                              src={secondImage}
                              alt={product.title || "TONET garment"}
                              className="tonet-archive-card__image tonet-archive-card__image--secondary"
                              loading="lazy"
                            />
                          )}
                        </>
                      ) : (
                        <div className="tonet-archive-card__image-placeholder">
                          <span>Image Unavailable</span>
                        </div>
                      )}
                      
                      {/* Minimal hover metadata overlay */}
                      <div className="tonet-archive-hover-panel">
                        <div className="tonet-archive-hover-panel__rows">
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">REGISTRY STATUS</span>
                            <span className="val">{available ? 'ACTIVE ARCHIVE' : 'ARCHIVED'}</span>
                          </div>
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">AVAILABILITY</span>
                            <span className="val">{available ? 'AVAILABLE' : 'TEMPORARILY RECALLED'}</span>
                          </div>
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">ARCHIVE REF.</span>
                            <span className="val">{archiveRef}</span>
                          </div>
                        </div>
                        <div className="tonet-archive-hover-panel__actions">
                          <span className="action-btn">VIEW RECORD</span>
                        </div>
                      </div>
                    </div>

                    {/* Museum-like metadata block */}
                    <div className="tonet-archive-card__metadata">
                      <span className="tonet-archive-card__collection">{collectionInfo}</span>
                      <h2 className="tonet-archive-card__title">{product.title}</h2>
                      <div className="tonet-archive-card__bottom-row">
                        <span className="tonet-archive-card__ref">Archive Ref. {archiveRef}</span>
                        {!available && (
                          <span className="tonet-archive-card__status tonet-archive-card__status--archived">
                            PERMANENTLY ARCHIVED
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                </div>
              );
            })
          ) : (
            <div className="tonet-archive-empty">
              <p>NO GARMENTS REGISTERED UNDER THE SELECTED CRITERIA.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER (Silent, Editorial) ── */}
      <footer className="tonet-archive-footer">
        <div className="tonet-archive-footer__content">
          <p className="tonet-archive-footer__label">PRIVATE RELEASES</p>
          <p className="tonet-archive-footer__note">
            New garments are introduced quietly. No campaigns. No restocks.
          </p>
          <div className="tonet-archive-footer__socials">
            <a href="https://instagram.com/tonetparis" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
            <span className="tonet-archive-footer__sep">·</span>
            <a href="mailto:contact@tonetparis.com">CONTACT</a>
          </div>
        </div>
      </footer>

      {/* ── STYLE ── */}
      <style>{`
        .tonet-archive {
          background: #060606;
          color: #ffffff;
          overflow-x: hidden;
          min-height: 100vh;
          font-family: var(--font-primary), sans-serif;
        }

        /* Cinematic Intersection Observer Reveals */
        .archive-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .archive-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── HERO SECTION (Compact 35-45vh) ── */
        .tonet-archive-hero {
          position: relative;
          width: 100%;
          height: 40vh;
          min-height: 280px;
          max-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060606;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .tonet-archive-hero__bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(6, 6, 6, 0.2) 50%, rgba(6, 6, 6, 0.95) 100%);
          z-index: 1;
        }
        .tonet-archive-hero__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.55;
          filter: brightness(0.7) contrast(1.05);
        }
        .tonet-archive-hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 700px;
          padding: 32px 24px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tonet-archive-hero__eyebrow {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.52em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .tonet-archive-hero__title {
          font-size: clamp(20px, 3.5vw, 34px);
          font-weight: 200;
          letter-spacing: 0.28em;
          line-height: 1.2;
          margin-bottom: 10px;
          color: #fff;
        }
        .tonet-archive-hero__subtitle {
          font-size: 10.5px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.38);
          margin-bottom: 18px;
        }

        /* ── STATS (Inline Museum Metadata) ── */
        .tonet-archive-stats {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 2px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tonet-archive-stats__item {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.32);
        }
        .tonet-archive-stats__divider {
          font-size: 8px;
          color: rgba(255,255,255,0.08);
        }

        /* ── COMPACT FILTER BAR (Max 80-100px) ── */
        .tonet-archive-controls {
          background: #060606;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          padding: 0 40px;
          min-height: 56px;
        }
        .tonet-archive-controls__container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 12px 0;
        }
        .tonet-archive-controls__col {
          display: flex;
          align-items: center;
        }
        .tonet-archive-controls__text {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.4);
        }
        .tonet-archive-controls__divider-vertical {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.06);
        }
        .tonet-archive-filter__options {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        .tonet-archive-filter__btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.35);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.3s;
          position: relative;
        }
        .tonet-archive-filter__btn:hover,
        .tonet-archive-filter__btn.active {
          color: #ffffff;
        }
        .tonet-archive-filter__btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.5);
        }

        /* ── ARCHITECTURAL GRID ── */
        .tonet-archive-grid-section {
          background: #060606;
          padding: 48px 40px 120px;
        }
        .tonet-archive-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 64px 48px;
        }
        .tonet-archive-grid__wrapper {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* ── PRODUCT CARD ── */
        .tonet-archive-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .tonet-archive-card__image-wrap {
          position: relative;
          aspect-ratio: 4 / 5;
          background: #E7E4DF;
          border-radius: 2px;
          overflow: hidden;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tonet-archive-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 400ms ease-in-out;
        }
        .tonet-archive-card__image--secondary {
          position: absolute;
          inset: 0;
          opacity: 0;
        }
        .tonet-archive-card__image-placeholder {
          width: 100%;
          height: 100%;
          background: rgba(231, 228, 223, 0.05);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tonet-archive-card__image-placeholder span {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        /* Hover behaviors */
        .tonet-archive-card:hover .tonet-archive-card__image--primary {
          opacity: 0;
        }
        .tonet-archive-card:hover .tonet-archive-card__image--secondary {
          opacity: 1;
        }

        /* Minimal hover metadata overlay */
        .tonet-archive-hover-panel {
          position: absolute;
          inset: 0;
          background: rgba(6, 6, 6, 0.88);
          opacity: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px;
          transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 2px;
        }
        .tonet-archive-card:hover .tonet-archive-hover-panel {
          opacity: 1;
        }
        .tonet-archive-hover-panel__rows {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .tonet-archive-hover-panel__row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 5px;
        }
        .tonet-archive-hover-panel__row .lbl {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.3);
        }
        .tonet-archive-hover-panel__row .val {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: #ffffff;
        }
        .tonet-archive-hover-panel__actions {
          display: flex;
          align-items: center;
          margin-top: auto;
        }
        .tonet-archive-hover-panel__actions .action-btn {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.5);
        }

        /* Card Metadata labels */
        .tonet-archive-card__metadata {
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .tonet-archive-card__collection {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
        }
        .tonet-archive-card__title {
          font-family: Georgia, serif;
          font-size: 13px;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.5;
          margin: 0;
          white-space: normal;
        }
        .tonet-archive-card__bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2px;
        }
        .tonet-archive-card__ref {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.45);
        }
        .tonet-archive-card__status--archived {
          font-size: 7.5px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: #8f4b4b;
        }

        /* ── EDITORIAL EXCERPT BREAKS ── */
        .tonet-archive-quote {
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.03);
          padding: 56px 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          grid-column: 1 / -1;
        }
        .tonet-archive-quote__text {
          font-family: Georgia, serif;
          font-size: clamp(13px, 1.8vw, 18px);
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.08em;
          line-height: 1.8;
          color: rgba(255,255,255,0.48);
          max-width: 600px;
          margin: 0;
        }
        .tonet-archive-quote__sub {
          font-size: 7.5px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.18);
        }

        .tonet-archive-empty {
          grid-column: 1 / -1;
          padding: 100px 24px;
          text-align: center;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.3);
        }

        /* ── FOOTER ── */
        .tonet-archive-footer {
          background: #060606;
          border-top: 1px solid rgba(255,255,255,0.03);
          padding: 80px 40px;
          text-align: center;
        }
        .tonet-archive-footer__content {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .tonet-archive-footer__label {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.25);
        }
        .tonet-archive-footer__note {
          font-size: 10.5px;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.35);
        }
        .tonet-archive-footer__socials {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 8px;
        }
        .tonet-archive-footer__socials a {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.3s;
        }
        .tonet-archive-footer__socials a:hover {
          color: rgba(255,255,255,0.7);
        }
        .tonet-archive-footer__sep {
          font-size: 8px;
          color: rgba(255,255,255,0.1);
        }

        /* ── RESPONSIVE ADAPTATIONS ── */
        @media (max-width: 1024px) {
          .tonet-archive-controls {
            padding: 0 24px;
          }
          .tonet-archive-grid-section {
            padding: 36px 24px 100px;
          }
          .tonet-archive-grid {
            gap: 48px 32px;
          }
          .tonet-archive-footer {
            padding: 60px 24px;
          }
        }

        @media (max-width: 900px) {
          .tonet-archive-controls__container {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .tonet-archive-controls__divider-vertical {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .tonet-archive-hero {
            height: 35vh;
            min-height: 240px;
            max-height: 340px;
          }
          .tonet-archive-hero__content {
            padding-top: 20px;
          }
          .tonet-archive-hero__title {
            font-size: 24px;
            letter-spacing: 0.2em;
          }
          .tonet-archive-stats {
            gap: 10px;
          }
          .tonet-archive-stats__item {
            font-size: 7.5px;
          }
          .tonet-archive-filter__options {
            gap: 10px;
            flex-wrap: wrap;
          }
          .tonet-archive-filter__btn {
            font-size: 7.5px;
            letter-spacing: 0.15em;
          }
          .tonet-archive-controls__text {
            font-size: 7.5px;
          }
          .tonet-archive-grid-section {
            padding: 24px 16px 80px;
          }
          .tonet-archive-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .tonet-archive-grid__wrapper {
            gap: 48px;
          }
          .tonet-archive-hover-panel {
            display: none !important;
          }
          .tonet-archive-footer {
            padding: 48px 16px;
          }
        }
      `}</style>
    </div>
  );
}
