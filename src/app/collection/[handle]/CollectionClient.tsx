'use client';

import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import type { CollectionDetail, Product, RecommendedProduct } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import NotifyMeModal from '@/components/NotifyMeModal';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import { useWishlist } from '@/context/WishlistContext';

const YmalCarousel = memo(function YmalCarousel({ recommended, toggle }: { recommended: RecommendedProduct[]; toggle: (item: any) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.scrollLeft + dir * 500;
    const start = el.scrollLeft;
    const diff = target - start;
    const duration = 600;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      el.scrollLeft = start + diff * ease;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <section className="ymal-section">
      <h2 className="ymal-title">TAMBIÉN TE PUEDE GUSTAR</h2>
      <div className="ymal-carousel-wrap">
        <button className={`ymal-arrow ymal-arrow-left${canLeft ? '' : ' ymal-arrow-hidden'}`} onClick={() => scroll(-1)} aria-label="Previous">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="ymal-carousel" ref={scrollRef}>
          {recommended.map((p) => {
            const href = p.collectionHandle
              ? `/collection/${p.collectionHandle}`
              : `/product/${p.handle}`;
            return (
              <a key={p.handle} href={href} className="ymal-card">
                <div className="ymal-img-wrap">
                  <button
                    className="ymal-wishlist"
                    onClick={(e) => { e.preventDefault(); toggle({ handle: p.handle, title: p.title, imageUrl: p.imageUrl, price: p.price, currencyCode: p.currencyCode, collectionTitle: '' }); }}
                    aria-label="Add to wishlist"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="ymal-img" />}
                </div>
                <div className="ymal-meta">
                  <div className="ymal-meta-row">
                    <span className="ymal-name">{p.title}</span>
                    <span className="ymal-price">&euro;{Number(p.price).toFixed(0)}</span>
                  </div>
                  {p.collectionHandle && (
                    <span className="ymal-subtitle">{p.collectionHandle.replace(/-/g, ' ')}</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
        <button className={`ymal-arrow ymal-arrow-right${canRight ? '' : ' ymal-arrow-hidden'}`} onClick={() => scroll(1)} aria-label="Next">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
});

function TranslatedDesc({ text }: { text?: string | null }) {
  const translated = useTranslatedText(text);
  const [expanded, setExpanded] = useState(false);
  if (!translated) return null;
  return (
    <div className="col-desc-wrapper">
      <div className={`col-desc${expanded ? ' expanded' : ''}`}>
        <p>{translated}</p>
        {!expanded && <div className="col-desc-blur" />}
      </div>
      <button className="col-desc-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '— Show less' : '+ Show more'}
      </button>
    </div>
  );
}

export default function CollectionClient({ collection }: { collection: CollectionDetail }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [showMobileBar, setShowMobileBar] = useState(true);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);

  // Hide mobile fixed bar once real info panel scrolls into view
  useEffect(() => {
    if (!infoRef.current) return;
    let observer: IntersectionObserver;
    const timer = setTimeout(() => {
      if (!infoRef.current) return;
      observer = new IntersectionObserver(
        ([entry]) => setShowMobileBar(!entry.isIntersecting),
        { threshold: 0.15 }
      );
      observer.observe(infoRef.current);
    }, 500);
    return () => { clearTimeout(timer); observer?.disconnect(); };
  }, []);

  useEffect(() => {
    const handle = collection.products[0]?.handle ?? '';
    if (!handle) return;
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(handle, 4)
        .then(setRecommended)
        .catch(() => {});
    });
  }, [collection.handle]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart } = useCart();
  const { openCart } = useUI();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { toggle, has } = useWishlist();

  const selectedProduct: Product | undefined = collection.products[selectedIdx];

  // Reset size + gallery position when switching products
  useEffect(() => {
    setSelectedSize('');
    setCurrentImageIdx(0);
    if (galleryRef.current) galleryRef.current.scrollLeft = 0;
  }, [selectedIdx]);

  const handleGalleryScroll = useCallback(() => {
    const el = galleryRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setCurrentImageIdx(idx);
  }, []);

  const sizeOptionName = useMemo(() => {
    if (!selectedProduct) return null;
    for (const v of selectedProduct.variants)
      for (const o of v.selectedOptions)
        if (o.name.toLowerCase() === 'size') return o.name;
    return null;
  }, [selectedProduct]);

  const sizeOptions = useMemo(() => {
    if (!sizeOptionName || !selectedProduct) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of selectedProduct.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) { seen.add(opt.value); result.push(opt.value); }
    }
    return result;
  }, [sizeOptionName, selectedProduct]);

  const selectedVariant = useMemo(() => {
    if (!selectedProduct) return undefined;
    if (sizeOptionName && selectedSize) {
      const match = selectedProduct.variants.find(v =>
        v.selectedOptions.find(o => o.name === sizeOptionName)?.value === selectedSize
      );
      if (match) return match;
    }
    return selectedProduct.variants.find(v => v.availableForSale) ?? selectedProduct.variants[0];
  }, [selectedProduct, sizeOptionName, selectedSize]);

  function isSizeAvailable(size: string): boolean {
    if (!selectedProduct || !sizeOptionName) return false;
    return selectedProduct.variants.find(v =>
      v.selectedOptions.find(o => o.name === sizeOptionName)?.value === size
    )?.availableForSale ?? false;
  }

  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const priceFormatted = selectedVariant
    ? parseFloat(selectedVariant.price.amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : selectedProduct
    ? new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(selectedProduct.price)
    : '';

  const currencyCode = selectedVariant?.price.currencyCode ?? selectedProduct?.currencyCode ?? 'EUR';

  async function handleAddToBag() {
    if (!selectedVariant?.id || adding) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  const galleryImages: string[] = selectedProduct
    ? (selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.imageUrl].filter(Boolean))
    : [collection.imageUrl].filter(Boolean);

  return (
    <>
      <div className="col-layout">

        {/* ── LEFT: vertical gallery, each image = full viewport ── */}
        <div className="col-gallery">
          {/* On mobile only the first image shows here; on desktop all images */}
          {galleryImages.map((url, i) => (
            <div key={`${selectedIdx}-${i}`} className={`col-gallery-slide${i > 0 ? ' col-rest-slide' : ''}`}>
              <img
                src={url}
                alt={`${selectedProduct?.title ?? collection.title} ${i + 1}`}
                className="col-main-img"
              />
            </div>
          ))}
          {/* Description block below gallery images */}
          {(collection.description || selectedProduct?.description) && (
            <div className="col-gallery-desc">
              <TranslatedDesc text={collection.description || selectedProduct?.description} />
            </div>
          )}
        </div>

        {/* ── RIGHT: Suitsupply-style info panel ── */}
        <div className="col-info" ref={infoRef}>

          {/* Title + Price */}
          <div className="col-header">
            <h1 className="col-title">{selectedProduct?.title ?? collection.title}</h1>
            {selectedProduct && (
              <span className="col-price">&euro;{priceFormatted}</span>
            )}
          </div>

          {/* Subtitle */}
          {selectedProduct && (
            <p className="col-subtitle">{selectedProduct.title}</p>
          )}

          {/* Product thumbnails */}
          <div className="col-thumbs-wrap">
            <div className="col-thumbs" ref={galleryRef}>
              {collection.products.length > 0 ? (
                collection.products.map((product, idx) => (
                  <button
                    key={product.handle}
                    className={`col-thumb${selectedIdx === idx ? ' active' : ''}`}
                    onClick={() => setSelectedIdx(idx)}
                    title={product.title}
                  >
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.title} />
                    )}
                  </button>
                ))
              ) : (
                <p className="col-no-products">No products in this collection.</p>
              )}
            </div>
            {collection.products.length > 5 && (
              <button
                className="col-thumbs-arrow"
                onClick={() => { if (galleryRef.current) galleryRef.current.scrollBy({ left: 140, behavior: 'smooth' }); }}
                aria-label="More variants"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>

          {/* Action row: bookmark + customize + select size */}
          {collection.products.length > 0 && (
            <div className="col-actions">
              <button
                className="col-bookmark"
                aria-label="Add to wishlist"
                onClick={() => selectedProduct && toggle({ handle: selectedProduct.handle, title: selectedProduct.title, imageUrl: selectedProduct.imageUrl, price: selectedProduct.price, currencyCode: selectedProduct.currencyCode, collectionTitle: collection.title })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={selectedProduct && has(selectedProduct.handle) ? '#111' : 'none'} stroke="#111" strokeWidth="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <button className="col-customize-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.76 6.76L3.93 3.93"/></svg>
                <span>Personalizar</span>
              </button>
              <button
                className="col-cta-btn"
                onClick={handleAddToBag}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {adding
                  ? t('common.adding')
                  : !selectedVariant?.availableForSale
                  ? t('common.soldOut')
                  : (sizeOptions.length > 0 && !selectedSize)
                  ? t('common.selectSize')
                  : t('common.addToBag')}
              </button>
            </div>
          )}

          {/* Size selector */}
          {sizeOptions.length > 0 && (
            <div className="col-size-grid">
              {STANDARD_SIZES.filter(s => sizeOptions.includes(s)).map((size) => {
                const available = isSizeAvailable(size);
                return (
                  <button
                    key={size}
                    className={`col-size-btn${selectedSize === size ? ' active' : ''}${!available ? ' sold-out' : ''}`}
                    onClick={() => available ? setSelectedSize(size) : undefined}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Delivery line */}
          <div className="col-delivery">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{t('common.freeDeliveryShort')}</span>
          </div>

          {/* Accordion sections */}
          <div className="col-accordions">
            <div className="col-accordion-item">
              <button className="col-accordion-header" onClick={() => setActiveDrawer(activeDrawer === 'sizefit' ? null : 'sizefit')}>
                <span>{t('common.sizeAndFit')}</span>
                <span className={`col-accordion-icon${activeDrawer === 'sizefit' ? ' open' : ''}`}>+</span>
              </button>
              {activeDrawer === 'sizefit' && (
                <div className="col-accordion-body">
                  {sizeOptions.length > 0 && (
                    <div className="col-inline-sizes">
                      {STANDARD_SIZES.filter(s => sizeOptions.includes(s)).map((size) => {
                        const available = isSizeAvailable(size);
                        return (
                          <button
                            key={size}
                            className={`col-inline-size${selectedSize === size ? ' active' : ''}${!available ? ' sold-out' : ''}`}
                            onClick={() => available ? setSelectedSize(size) : undefined}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="col-accordion-text">{t('common.deliveryEstimate')}</p>
                </div>
              )}
            </div>

            <div className="col-accordion-item">
              <button className="col-accordion-header" onClick={() => setActiveDrawer(activeDrawer === 'details' ? null : 'details')}>
                <span>{t('common.detailsAndCare')}</span>
                <span className={`col-accordion-icon${activeDrawer === 'details' ? ' open' : ''}`}>+</span>
              </button>
              {activeDrawer === 'details' && (
                <div className="col-accordion-body">
                  <TranslatedDesc text={selectedProduct?.description || collection.description} />
                </div>
              )}
            </div>

            <div className="col-accordion-item">
              <button className="col-accordion-header" onClick={() => setActiveDrawer(activeDrawer === 'delivery' ? null : 'delivery')}>
                <span>{t('common.deliveryAndReturns')}</span>
                <span className={`col-accordion-icon${activeDrawer === 'delivery' ? ' open' : ''}`}>+</span>
              </button>
              {activeDrawer === 'delivery' && (
                <div className="col-accordion-body">
                  <p className="col-accordion-text">
                    <strong>{t('common.drawerDeliveryLabel')}</strong><br />
                    {t('common.drawerDeliveryBody')}
                  </p>
                  <p className="col-accordion-text" style={{ marginTop: 12 }}>
                    <strong>{t('common.drawerReturnsLabel')}</strong><br />
                    {t('common.drawerReturnsBody')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Mobile only: remaining gallery images after info panel ── */}
        {galleryImages.length > 1 && (
          <div className="col-gallery-mobile-rest">
            {galleryImages.slice(1).map((url, i) => (
              <div key={`rest-${selectedIdx}-${i}`} className="col-gallery-slide">
                <img
                  src={url}
                  alt={`${selectedProduct?.title ?? collection.title} ${i + 2}`}
                  className="col-main-img"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <NotifyMeModal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        sizes={sizeOptions}
        preselectedSize={selectedSize}
        productTitle={selectedProduct?.title}
      />

      {/* ── YOU MAY ALSO LIKE — Suitsupply carousel ── */}
      {recommended.length > 0 && (
        <YmalCarousel recommended={recommended} toggle={toggle} />
      )}

      {/* Mobile fixed info bar — visible until real info scrolls into view */}
      <div className={`col-mobile-fixed-bar ${showMobileBar ? '' : 'hidden'}`}>
        <div className="col-mfb-info">
          <div className="col-mfb-row">
            <span className="col-mfb-title">{selectedProduct?.title ?? collection.title}</span>
            {selectedProduct && <span className="col-mfb-price">&euro;{priceFormatted}</span>}
          </div>
          {selectedProduct && <span className="col-mfb-subtitle">{selectedProduct.title}</span>}
        </div>
        <div className="col-mfb-actions">
          <button
            className="col-mfb-bookmark"
            aria-label="Add to wishlist"
            onClick={() => selectedProduct && toggle({ handle: selectedProduct.handle, title: selectedProduct.title, imageUrl: selectedProduct.imageUrl, price: selectedProduct.price, currencyCode: selectedProduct.currencyCode, collectionTitle: collection.title })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedProduct && has(selectedProduct.handle) ? '#111' : 'none'} stroke="#111" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button className="col-mfb-customize">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.76 6.76L3.93 3.93"/></svg>
            <span>Personalizar</span>
          </button>
          <button
            className="col-mfb-cta"
            onClick={handleAddToBag}
            disabled={adding || !selectedVariant?.availableForSale}
          >
            {adding
              ? t('common.adding')
              : !selectedVariant?.availableForSale
              ? t('common.soldOut')
              : (sizeOptions.length > 0 && !selectedSize)
              ? t('common.selectSize')
              : t('common.addToBag')}
          </button>
        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           SUITSUPPLY-STYLE COLLECTION/PRODUCT
        ══════════════════════════════════════ */
        .col-layout {
          display: flex;
          flex-direction: column;
          font-family: var(--font-primary);
          color: #111;
          margin-top: -48px;
        }

        /* ── GALLERY ── */
        .col-gallery {
          position: relative;
          background: #e8e4df;
          line-height: 0;
        }
        .col-gallery-slide {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #e8e4df;
        }
        .col-gallery-slide .col-main-img {
          width: 100%;
          height: 100% !important;
          max-width: none;
          object-fit: contain;
          display: block;
        }
        .col-gallery-desc {
          padding: 40px 24px 60px;
          background: #fff;
        }
        .col-desc-wrapper { margin: 0; }
        .col-desc {
          position: relative;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.7;
          color: #444;
          overflow: hidden;
          max-height: calc(1.7em * 6);
        }
        .col-desc.expanded { max-height: none; }
        .col-desc p { margin: 0; }
        .col-desc-blur {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2em;
          background: linear-gradient(to bottom, rgba(255,255,255,0), #fff);
          pointer-events: none;
        }
        .col-desc-toggle {
          background: none; border: none; padding: 6px 0 0; margin: 0;
          font: inherit; font-size: 12px; color: #111; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px;
        }

        /* ── INFO PANEL ── */
        .col-info {
          padding: 24px 20px 140px 20px;
          color: #111 !important;
          background: #fff;
        }
        .col-info h1,
        .col-info h2,
        .col-info h3,
        .col-info span,
        .col-info p {
          color: inherit;
        }

        /* Header: title + price */
        .col-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 6px;
        }
        .col-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          margin: 0;
          letter-spacing: 0.01em;
          color: #111 !important;
        }
        .col-price {
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          letter-spacing: 0.01em;
          color: #111;
        }

        /* Subtitle */
        .col-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: #666;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        /* Thumbnails — Suitsupply style: square, grey bg, rounded */
        .col-thumbs-wrap {
          position: relative;
          margin-bottom: 20px;
        }
        .col-thumbs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          max-width: 100%;
          padding-right: 32px;
        }
        .col-thumbs::-webkit-scrollbar { display: none; }
        .col-thumb {
          width: 60px;
          height: 60px;
          padding: 4px;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          background: #f0efed;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
          transition: border-color 0.15s, opacity 0.15s;
        }
        .col-thumb.active {
          border-color: #111;
        }
        .col-thumb:hover:not(.active) { opacity: 0.75; }
        .col-thumb img {
          width: 100%; height: 100%;
          object-fit: contain; display: block;
          border-radius: 4px;
        }
        .col-thumbs-arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
          z-index: 2;
        }
        .col-thumbs-arrow:hover { background: #f5f5f5; }
        .col-no-products {
          font-size: 12px; color: #888;
          margin-bottom: 16px;
        }

        /* Action row */
        .col-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          height: 44px;
          align-items: stretch;
        }
        .col-bookmark {
          width: 44px;
          height: 44px;
          border: 1px solid #d0d0d0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .col-bookmark:hover { background: #f5f5f5; }
        .col-customize-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 44px;
          padding: 0 16px;
          border: 1px solid #d0d0d0;
          background: #fff;
          border-radius: 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s;
        }
        .col-customize-btn:hover { border-color: #111; }
        .col-cta-btn {
          flex: 1;
          height: 44px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .col-cta-btn:hover:not(:disabled) { background: #333; }
        .col-cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Size grid */
        .col-size-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          border: 1px solid #e0e0e0;
          margin-bottom: 16px;
          background: #fff;
        }
        .col-size-btn {
          padding: 12px 8px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 400;
          text-align: center;
          border: none;
          border-right: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
          background: #fff;
          cursor: pointer;
          color: #111;
          transition: background 0.12s;
        }
        .col-size-btn:hover:not(.sold-out):not(.active) { background: #f5f5f5; }
        .col-size-btn.active { background: #111; color: #fff; }
        .col-size-btn.sold-out { color: #ccc; cursor: not-allowed; text-decoration: line-through; }

        /* Delivery line */
        .col-delivery {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 0;
          font-size: 12px;
          font-weight: 400;
          color: #444;
          border-bottom: 1px solid #e8e8e8;
        }

        /* Accordion sections */
        .col-accordions { margin-top: 0; }
        .col-accordion-item {
          border-bottom: 1px solid #e8e8e8;
        }
        .col-accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 400;
          color: #111;
          cursor: pointer;
          text-align: left;
          letter-spacing: 0.01em;
        }
        .col-accordion-header:hover { opacity: 0.7; }
        .col-accordion-icon {
          font-size: 18px;
          font-weight: 300;
          color: #111;
          transition: transform 0.2s;
          line-height: 1;
        }
        .col-accordion-icon.open { transform: rotate(45deg); }
        .col-accordion-body { padding: 0 0 16px; }
        .col-accordion-text {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.7;
          color: #555;
          margin: 0;
        }

        /* Inline size buttons */
        .col-inline-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .col-inline-size {
          padding: 8px 14px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid #d0d0d0;
          background: #fff;
          cursor: pointer;
          color: #111;
          border-radius: 0;
          transition: all 0.12s;
        }
        .col-inline-size:hover:not(.sold-out):not(.active) { border-color: #111; }
        .col-inline-size.active { background: #111; color: #fff; border-color: #111; }
        .col-inline-size.sold-out { color: #ccc; border-color: #eee; cursor: not-allowed; text-decoration: line-through; }

        /* ── MOBILE FIXED INFO BAR ── */
        .col-mobile-fixed-bar {
          display: none;
        }

        @media (max-width: 767px) {
          .col-mobile-fixed-bar {
            display: block;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 200;
            background: #fff;
            padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
          .col-mobile-fixed-bar.hidden {
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
          }
          .col-mfb-info {
            margin-bottom: 12px;
          }
          .col-mfb-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
          }
          .col-mfb-title {
            font-size: 15px;
            font-weight: 600;
            line-height: 1.3;
            color: #111;
          }
          .col-mfb-price {
            font-size: 15px;
            font-weight: 600;
            color: #111;
            white-space: nowrap;
          }
          .col-mfb-subtitle {
            font-size: 12px;
            font-weight: 400;
            color: #666;
            display: block;
            margin-top: 2px;
          }
          .col-mfb-actions {
            display: flex;
            gap: 8px;
            height: 42px;
            align-items: stretch;
          }
          .col-mfb-bookmark {
            width: 42px;
            height: 42px;
            border: 1px solid #d0d0d0 !important;
            border-radius: 6px !important;
            background: #fff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0 !important;
            letter-spacing: 0 !important;
            transform: none !important;
          }
          .col-mfb-customize {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            height: 42px;
            padding: 0 14px !important;
            border: 1px solid #d0d0d0 !important;
            background: #fff !important;
            border-radius: 6px !important;
            font-family: inherit;
            font-size: 11px;
            font-weight: 500;
            color: #111 !important;
            cursor: pointer;
            white-space: nowrap;
            letter-spacing: 0 !important;
            transform: none !important;
          }
          .col-mfb-cta {
            flex: 1;
            height: 42px;
            background: #111 !important;
            color: #fff !important;
            border: none !important;
            border-radius: 6px !important;
            font-family: inherit;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.08em !important;
            cursor: pointer;
            padding: 0 12px !important;
            transform: none !important;
          }
          .col-mfb-cta:disabled { opacity: 0.5; cursor: not-allowed; }
          .col-mfb-cta:active { transform: none !important; }

          /* Gallery: only first image visible on mobile */
          .col-gallery-slide {
            height: 125vh;
          }
          .col-rest-slide {
            display: none;
          }
          .col-gallery-desc {
            display: none;
          }
          .col-gallery-mobile-rest {
            display: block;
            background: #e8e4df;
            line-height: 0;
            font-size: 0;
          }
          .col-gallery-mobile-rest .col-gallery-slide {
            display: block;
            height: auto;
            overflow: visible;
          }
          .col-gallery-mobile-rest .col-main-img {
            width: 100%;
            height: auto !important;
            object-fit: cover;
          }
          .col-info {
            padding: 24px 16px 40px 16px;
          }
        }

        /* ══════════════════════════════════════
           DESKTOP: side-by-side layout
           Gallery = 5/8 (62.5%), Info = 3/8
        ══════════════════════════════════════ */
        @media (min-width: 768px) {
          .col-layout {
            flex-direction: row;
            min-height: 100vh;
          }

          .col-gallery {
            width: 62.5%;
            flex-shrink: 0;
          }
          .col-gallery-slide {
            height: 100vh;
          }
          .col-rest-slide {
            display: flex;
          }
          .col-gallery-desc {
            min-height: 50vh;
            display: flex;
            align-items: center;
            padding: 60px 48px;
          }
          .col-gallery-mobile-rest {
            display: none !important;
          }

          .col-info {
            width: 37.5%;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            padding: 100px 40px 80px 40px;
            scrollbar-width: none;
            box-sizing: border-box;
          }
          .col-info::-webkit-scrollbar { display: none; }

          .col-mobile-fixed-bar { display: none !important; }
        }

        @media (min-width: 1200px) {
          .col-info {
            padding: 100px 48px 80px 48px;
          }
        }

        /* ── YOU MAY ALSO LIKE — carousel ── */
        .ymal-section {
          padding: 60px 0 80px;
          overflow: hidden;
        }
        .ymal-title {
          font-family: 'DM Sans', serif;
          font-size: 26px;
          font-weight: 400;
          font-style: italic;
          color: #111;
          margin: 0 0 32px;
          padding-left: 60px;
          padding-right: 60px;
          text-transform: uppercase;
          letter-spacing: 0.01em;
        }
        .ymal-carousel-wrap {
          position: relative;
          padding-left: 0;
        }
        .ymal-carousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ymal-carousel::-webkit-scrollbar { display: none; }
        .ymal-card {
          flex: 0 0 46%;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .ymal-card:first-child {
          margin-left: 60px;
        }
        .ymal-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #e8e4df;
          overflow: hidden;
        }
        .ymal-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .ymal-wishlist {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50% !important;
          border: 1px solid rgba(0,0,0,0.12) !important;
          background: #fff !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: box-shadow 0.15s !important;
          padding: 0 !important;
          color: #111 !important;
          letter-spacing: 0 !important;
          transform: none !important;
        }
        .ymal-wishlist:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); opacity: 1 !important; }
        .ymal-wishlist:active { transform: none !important; }
        .ymal-meta {
          padding: 14px 0 0;
        }
        .ymal-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .ymal-name {
          font-size: 14px;
          font-weight: 500;
          color: #111;
          line-height: 1.3;
        }
        .ymal-price {
          font-size: 14px;
          font-weight: 500;
          color: #111;
          white-space: nowrap;
        }
        .ymal-subtitle {
          font-size: 12px;
          font-weight: 400;
          color: #666;
          margin-top: 2px;
          display: block;
          text-transform: capitalize;
        }
        .ymal-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%) !important;
          width: 40px;
          height: 40px;
          background: none !important;
          border: none !important;
          border-radius: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: none !important;
          z-index: 3;
          color: #111;
          padding: 0 !important;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          opacity: 1;
          transition: opacity 0.3s ease !important;
        }
        .ymal-arrow:hover { opacity: 1 !important; }
        .ymal-arrow:active,
        .ymal-arrow:focus { outline: none; transform: translateY(-50%) !important; }
        .ymal-arrow-left { left: 16px; }
        .ymal-arrow-right { right: 16px; }
        .ymal-arrow-hidden {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .ymal-section { padding: 40px 0 100px; }
          .ymal-title {
            font-size: 20px;
            padding: 0 16px;
            margin-bottom: 20px;
          }
          .ymal-carousel-wrap {
            padding-left: 0;
          }
          .ymal-carousel {
            gap: 12px;
          }
          .ymal-card {
            flex: 0 0 80%;
          }
          .ymal-card:first-child {
            margin-left: 16px;
          }
          .ymal-arrow { display: none !important; }
        }
      `}</style>
    </>
  );
}
