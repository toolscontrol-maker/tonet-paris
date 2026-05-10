"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct } from '@/lib/shopify';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
  relatedProductsByTag?: Product[];
}

function TranslatedDesc({ text, className }: { text?: string | null; className?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return <p className={className}>{translated}</p>;
}

export default function ProductClient({ product, relatedProductsByTag }: Props) {
  const router = useRouter();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 4)
        .then(setRecommended)
        .catch(() => {});
    });
  }, [product.handle]);

  const images = product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  const [displayImageUrl, setDisplayImageUrl] = useState<string>(() => images[0] ?? product.imageUrl);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants[0] ?? { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] }
  );
  const [adding, setAdding] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const { t } = useTranslation();
  useLocale();
  const { toggle, has } = useWishlist();
  const inWishlist = has(product.handle);
  const wishlistItem = {
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    price: product.price,
    currencyCode: product.currencyCode,
    collectionTitle: '',
  };
  const [selectedColor, setSelectedColor] = useState<string>(
    () => product.variants[0]?.selectedOptions.find(o => {
      const n = o.name.toLowerCase(); return n === 'color' || n === 'colour';
    })?.value ?? ''
  );
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { openCart } = useUI();
  const { addToCart } = useCart();
  const thumbsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef(false);

  function goToSlide(idx: number) {
    const next = Math.max(0, Math.min(idx, images.length - 1));
    setActiveImage(next);
    setDisplayImageUrl(images[next]);
    carouselRef.current?.scrollTo({ left: next * carouselRef.current.offsetWidth, behavior: 'smooth' });
  }

  function handleCarouselTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleCarouselTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goToSlide(activeImage + (dx < 0 ? 1 : -1));
    }
  }

  function handleCarouselMouseDown(e: React.MouseEvent) {
    isDragging.current = false;
    touchStartX.current = e.clientX;
  }

  function handleCarouselMouseMove(e: React.MouseEvent) {
    if (Math.abs(e.clientX - touchStartX.current) > 5) isDragging.current = true;
  }

  function handleCarouselMouseUp(e: React.MouseEvent) {
    const dx = e.clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      goToSlide(activeImage + (dx < 0 ? 1 : -1));
    }
  }

  const colorOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n === 'color' || n === 'colour') return o.name;
      }
    return null;
  }, []);

  const sizeOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions)
        if (o.name.toLowerCase() === 'size') return o.name;
    return null;
  }, []);

  const colorOptions = useMemo(() => {
    if (!colorOptionName) return [];
    const seen = new Set<string>();
    const result: { value: string; imageUrl: string }[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === colorOptionName);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        result.push({ value: opt.value, imageUrl: v.image?.url ?? '' });
      }
    }
    return result;
  }, [colorOptionName]);

  const sizeOptions = useMemo(() => {
    if (!sizeOptionName) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) { seen.add(opt.value); result.push(opt.value); }
    }
    return result;
  }, [sizeOptionName]);

  const priceNum = parseFloat(selectedVariant.price.amount);
  const priceFormatted = Number.isInteger(priceNum)
    ? `€${priceNum}`
    : `€${priceNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const hasMultipleVariants = product.variants.length > 1;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) { setSizeOpen(true); return; }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  function findVariant(color: string, size: string): ShopifyVariant | undefined {
    return product.variants.find(v => {
      const c = colorOptionName ? v.selectedOptions.find(o => o.name === colorOptionName)?.value : undefined;
      const s = sizeOptionName ? v.selectedOptions.find(o => o.name === sizeOptionName)?.value : undefined;
      if (colorOptionName && sizeOptionName) return c === color && s === size;
      if (colorOptionName) return c === color;
      if (sizeOptionName) return s === size;
      return false;
    });
  }

  function handleColorChange(colorValue: string) {
    setSelectedColor(colorValue);
    const colorImg = colorOptions.find(c => c.value === colorValue)?.imageUrl;
    if (colorImg) {
      setDisplayImageUrl(colorImg);
      const idx = images.indexOf(colorImg);
      setActiveImage(idx >= 0 ? idx : 0);
    }
    const next = findVariant(colorValue, selectedSize);
    if (next) {
      setSelectedVariant(next);
    } else {
      const fallback = product.variants.find(v =>
        colorOptionName
          ? v.selectedOptions.find(o => o.name === colorOptionName)?.value === colorValue
          : false
      );
      if (fallback) {
        setSelectedVariant(fallback);
        setSelectedSize('');
      }
    }
  }

  function handleSizeSelect(sizeValue: string) {
    setSelectedSize(sizeValue);
    setSizeOpen(false);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
  }

  function isSizeAvailable(size: string): boolean {
    const v = findVariant(selectedColor, size);
    return v?.availableForSale ?? false;
  }

  function toggleAccordion(key: string) {
    setExpandedAccordion(prev => prev === key ? null : key);
  }

  function scrollThumbs(dir: number) {
    if (thumbsRef.current) {
      thumbsRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' });
    }
  }

  const descriptionFirstLine = product.description?.split(/[.\n]/)[0]?.trim() || '';

  return (
    <>
      <div className="ss-pdp-layout">
        {/* ── CAROUSEL ── */}
        <div className="ss-gallery">
          <div
            className="ss-carousel"
            ref={carouselRef}
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
            onMouseDown={handleCarouselMouseDown}
            onMouseMove={handleCarouselMouseMove}
            onMouseUp={handleCarouselMouseUp}
          >
            {images.map((img, i) => (
              <div key={i} className="ss-carousel-slide">
                <img
                  src={img}
                  alt={`${product.title} – ${i + 1}`}
                  className="ss-gallery-img"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="ss-carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`ss-carousel-dot${activeImage === i ? ' active' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Arrow buttons (desktop) */}
          {images.length > 1 && (
            <>
              <button className="ss-carousel-arrow prev" onClick={() => goToSlide(activeImage - 1)} aria-label="Previous" disabled={activeImage === 0}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="ss-carousel-arrow next" onClick={() => goToSlide(activeImage + 1)} aria-label="Next" disabled={activeImage === images.length - 1}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
        </div>

        {/* ── INFO PANEL ── */}
        <div className="ss-info">
          {/* Title + Price */}
          <div className="ss-header">
            <h1 className="ss-title">{product.title}</h1>
            <span className="ss-price">{priceFormatted}</span>
          </div>

          {/* Subtitle / description line */}
          {descriptionFirstLine && (
            <p className="ss-subtitle">{descriptionFirstLine}</p>
          )}

          {/* Image thumbnails */}
          <div className="ss-thumbs-wrap">
            <div className="ss-thumbs" ref={thumbsRef}>
              {(relatedProductsByTag && relatedProductsByTag.length > 0)
                ? [product, ...relatedProductsByTag].map((vp) => (
                    <button
                      key={vp.handle}
                      className={`ss-thumb ${vp.handle === product.handle ? 'active' : ''}`}
                      onClick={() => { if (vp.handle !== product.handle) router.push(`/product/${vp.handle}`) }}
                      title={vp.title}
                    >
                      <img src={vp.imageUrl} alt={vp.title} />
                    </button>
                  ))
                : images.map((img, i) => (
                    <button
                      key={i}
                      className={`ss-thumb ${activeImage === i ? 'active' : ''}`}
                      onClick={() => { setActiveImage(i); setDisplayImageUrl(img); }}
                    >
                      <img src={img} alt={`View ${i + 1}`} />
                    </button>
                  ))
              }
            </div>
            {images.length > 5 && (
              <button className="ss-thumbs-arrow" onClick={() => scrollThumbs(1)} aria-label="More images">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>

          {/* Action row: bookmark + select size / add to bag */}
          <div className="ss-actions">
            <button
              className="ss-bookmark"
              aria-label="Add to wishlist"
              onClick={() => toggle(wishlistItem)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? '#111' : 'none'} stroke="#111" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button
              className="ss-cta-btn"
              onClick={handleAddToBag}
              disabled={adding || !selectedVariant.availableForSale}
            >
              {adding
                ? t('common.adding')
                : !selectedVariant.availableForSale
                ? t('common.soldOut')
                : needsSizeSelection
                ? t('common.selectSize')
                : t('common.addToBag')}
            </button>
          </div>

          {/* Size selector dropdown */}
          {sizeOpen && hasSizes && (
            <div className="ss-size-dropdown">
              {sizeOptions.map((size) => {
                const available = isSizeAvailable(size);
                return (
                  <button
                    key={size}
                    className={`ss-size-option${selectedSize === size ? ' active' : ''}${!available ? ' unavailable' : ''}`}
                    onClick={() => available && handleSizeSelect(size)}
                    disabled={!available}
                  >
                    <span>{size}</span>
                    {!available && <span className="ss-size-oos">—</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Delivery info */}
          <div className="ss-delivery">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{t('common.freeDeliveryShort')}</span>
          </div>

          {/* Accordion sections */}
          <div className="ss-accordions">
            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('sizefit')}>
                <span>{t('common.sizeAndFit')}</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'sizefit' ? ' open' : ''}`}>+</span>
              </button>
              {expandedAccordion === 'sizefit' && (
                <div className="ss-accordion-body">
                  {hasSizes && (
                    <div className="ss-inline-sizes">
                      {sizeOptions.map((size) => {
                        const available = isSizeAvailable(size);
                        return (
                          <button
                            key={size}
                            className={`ss-inline-size${selectedSize === size ? ' active' : ''}${!available ? ' sold-out' : ''}`}
                            onClick={() => available && handleSizeSelect(size)}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="ss-accordion-text">{t('common.deliveryEstimate')}</p>
                </div>
              )}
            </div>

            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('details')}>
                <span>{t('common.detailsAndCare')}</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'details' ? ' open' : ''}`}>+</span>
              </button>
              {expandedAccordion === 'details' && (
                <div className="ss-accordion-body">
                  <TranslatedDesc text={product.description} className="ss-accordion-text" />
                </div>
              )}
            </div>

            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('delivery')}>
                <span>{t('common.deliveryAndReturns')}</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'delivery' ? ' open' : ''}`}>+</span>
              </button>
              {expandedAccordion === 'delivery' && (
                <div className="ss-accordion-body">
                  <p className="ss-accordion-text">
                    <strong>{t('common.drawerDeliveryLabel')}</strong><br />
                    {t('common.drawerDeliveryBody')}
                  </p>
                  <p className="ss-accordion-text" style={{ marginTop: 12 }}>
                    <strong>{t('common.drawerReturnsLabel')}</strong><br />
                    {t('common.drawerReturnsBody')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>



      {/* ── MOBILE STICKY BAR ── */}
      <div className="ss-mobile-sticky">
        <button
          className="ss-mobile-bookmark"
          aria-label="Add to wishlist"
          onClick={() => toggle(wishlistItem)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? '#111' : 'none'} stroke="#111" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button
          className="ss-mobile-cta"
          onClick={handleAddToBag}
          disabled={adding || !selectedVariant.availableForSale}
        >
          {adding
            ? t('common.adding')
            : !selectedVariant.availableForSale
            ? t('common.soldOut')
            : needsSizeSelection
            ? t('common.selectSize')
            : t('common.addToBag')}
        </button>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           SUITSUPPLY-STYLE PRODUCT PAGE
        ══════════════════════════════════════ */

        .ss-pdp-layout {
          display: flex;
          flex-direction: column;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          color: #111;
        }

        /* ── CAROUSEL ── */
        .ss-gallery {
          position: relative;
          background: #e8e4df;
          overflow: hidden;
        }
        .ss-carousel {
          width: 100%;
          aspect-ratio: 2 / 3;
          display: flex;
          overflow: hidden;
          user-select: none;
          cursor: grab;
        }
        .ss-carousel:active { cursor: grabbing; }
        .ss-carousel-slide {
          width: 100%;
          flex-shrink: 0;
          aspect-ratio: 2 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e4df;
          overflow: hidden;
        }
        .ss-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }
        /* Dots */
        .ss-carousel-dots {
          position: absolute;
          bottom: 14px;
          left: 0; right: 0;
          display: flex;
          justify-content: center;
          gap: 6px;
          z-index: 5;
        }
        .ss-carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.25);
          padding: 0;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .ss-carousel-dot.active {
          background: #111;
          transform: scale(1.3);
        }
        /* Arrow buttons */
        .ss-carousel-arrow {
          display: none;
        }

        /* ── INFO PANEL ── */
        .ss-info {
          padding: 24px 20px 140px 20px;
        }

        /* Header: title + price */
        .ss-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 6px;
        }
        .ss-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          margin: 0;
          letter-spacing: 0.01em;
        }
        .ss-price {
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        /* Subtitle */
        .ss-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: #666;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        /* Thumbnails */
        .ss-thumbs-wrap {
          position: relative;
          margin-bottom: 20px;
        }
        .ss-thumbs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border: 1px solid #e0e0e0;
          width: fit-content;
          max-width: 100%;
        }
        .ss-thumbs::-webkit-scrollbar { display: none; }
        .ss-thumb {
          width: 56px;
          height: 72px;
          padding: 0;
          border: none;
          border-right: 1px solid #e0e0e0;
          border-radius: 0;
          cursor: pointer;
          background: #fff;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
          transition: opacity 0.15s;
        }
        .ss-thumb:last-child { border-right: none; }
        .ss-thumb.active { box-shadow: inset 0 0 0 2px #111; }
        .ss-thumb:hover:not(.active) { opacity: 0.7; }
        .ss-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .ss-thumbs-arrow {
          position: absolute;
          right: -4px;
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
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          z-index: 2;
        }
        .ss-thumbs-arrow:hover { background: #f5f5f5; }

        /* Action row */
        .ss-actions {
          display: flex;
          gap: 0;
          margin-bottom: 16px;
          height: 48px;
        }
        .ss-bookmark {
          width: 48px;
          height: 48px;
          border: 1px solid #d0d0d0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          border-radius: 0;
          transition: background 0.15s;
        }
        .ss-bookmark:hover { background: #f5f5f5; }
        .ss-cta-btn {
          flex: 1;
          height: 48px;
          background: #111;
          color: #fff;
          border: 1px solid #111;
          border-left: none;
          border-radius: 0;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ss-cta-btn:hover:not(:disabled) { background: #333; }
        .ss-cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Size dropdown */
        .ss-size-dropdown {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 0;
          border: 1px solid #e0e0e0;
          margin-bottom: 16px;
          background: #fff;
        }
        .ss-size-option {
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .ss-size-option:hover:not(.unavailable):not(.active) { background: #f5f5f5; }
        .ss-size-option.active { background: #111; color: #fff; }
        .ss-size-option.unavailable { color: #ccc; cursor: not-allowed; }
        .ss-size-oos { color: #ccc; }

        /* Delivery line */
        .ss-delivery {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 0;
          font-size: 12px;
          font-weight: 400;
          color: #444;
          border-bottom: 1px solid #e8e8e8;
          margin-bottom: 0;
        }

        /* Accordion sections */
        .ss-accordions {
          margin-top: 0;
        }
        .ss-accordion-item {
          border-bottom: 1px solid #e8e8e8;
        }
        .ss-accordion-header {
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
        .ss-accordion-header:hover { opacity: 0.7; }
        .ss-accordion-icon {
          font-size: 18px;
          font-weight: 300;
          color: #111;
          transition: transform 0.2s ease;
          line-height: 1;
        }
        .ss-accordion-icon.open { transform: rotate(45deg); }
        .ss-accordion-body {
          padding: 0 0 16px 0;
        }
        .ss-accordion-text {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.7;
          color: #555;
          margin: 0;
        }

        /* Inline size buttons inside accordion */
        .ss-inline-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .ss-inline-size {
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
        .ss-inline-size:hover:not(.sold-out):not(.active) { border-color: #111; }
        .ss-inline-size.active { background: #111; color: #fff; border-color: #111; }
        .ss-inline-size.sold-out { color: #ccc; border-color: #eee; cursor: not-allowed; text-decoration: line-through; }

        /* ── MOBILE STICKY BAR ── */
        .ss-mobile-sticky {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          height: 56px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: #fff;
          border-top: 1px solid #e0e0e0;
          z-index: 200;
        }
        .ss-mobile-bookmark {
          width: 56px;
          height: 56px;
          border: none;
          border-right: 1px solid #e0e0e0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .ss-mobile-cta {
          flex: 1;
          height: 56px;
          background: #111;
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
        }
        .ss-mobile-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ══════════════════════════════════════
           DESKTOP: side-by-side layout
           Gallery = 4/6 (66.66%), Info = 2/6
        ══════════════════════════════════════ */
        @media (min-width: 768px) {
          .ss-pdp-layout {
            flex-direction: row;
            min-height: 100vh;
          }

          /* Gallery: 4/6 width, scrollable vertically */
          .ss-gallery {
            width: 66.666%;
            flex-shrink: 0;
          }
          .ss-carousel {
            aspect-ratio: 2 / 3;
            height: auto;
          }
          .ss-carousel-slide {
            aspect-ratio: 2 / 3;
          }
          /* Show arrows on desktop */
          .ss-carousel-arrow {
            display: flex;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 5;
            color: #111;
            transition: background 0.15s, opacity 0.15s;
          }
          .ss-carousel-arrow:disabled { opacity: 0.25; cursor: default; }
          .ss-carousel-arrow:hover:not(:disabled) { background: #fff; }
          .ss-carousel-arrow.prev { left: 14px; }
          .ss-carousel-arrow.next { right: 14px; }
          .ss-gallery-desc {
            min-height: 50vh;
            display: flex;
            align-items: center;
            padding: 60px 48px;
          }

          /* Info panel: sticky on the right, full viewport height */
          .ss-info {
            width: 33.334%;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            padding: 100px 40px 80px 40px;
            scrollbar-width: none;
            box-sizing: border-box;
          }
          .ss-info::-webkit-scrollbar { display: none; }

          .ss-mobile-sticky { display: none; }
        }

        @media (min-width: 1200px) {
          .ss-info {
            padding: 100px 48px 80px 48px;
          }
        }

        /* ── RECOMMENDED ── */
        .rec-section {
          padding: 48px 24px 80px;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
        }
        .rec-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #111;
          margin: 0 0 24px;
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        @media (max-width: 767px) {
          .rec-section { padding: 32px 0 100px; }
          .rec-label { padding-left: 16px; }
          .rec-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
