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
      getRecommendedProducts(product.handle, 5)
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
  const infoRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef(false);
  const recCarouselRef = useRef<HTMLDivElement>(null);
  const recDragStart = useRef(0);
  const recScrollStart = useRef(0);
  const recIsDragging = useRef(false);
  const recDragMoved = useRef(false);

  function recPointerDown(e: React.PointerEvent) {
    recDragStart.current = e.clientX;
    recScrollStart.current = recCarouselRef.current?.scrollLeft ?? 0;
    recIsDragging.current = true;
    recDragMoved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function recPointerMove(e: React.PointerEvent) {
    if (!recIsDragging.current) return;
    const dx = e.clientX - recDragStart.current;
    if (Math.abs(dx) > 5) {
      recDragMoved.current = true;
      recCarouselRef.current?.classList.add('dragging');
      if (recCarouselRef.current) recCarouselRef.current.scrollLeft = recScrollStart.current - dx;
    }
  }
  function recPointerUp() {
    recIsDragging.current = false;
    recCarouselRef.current?.classList.remove('dragging');
  }
  function recCarouselClick(e: React.MouseEvent) {
    if (recDragMoved.current) { e.preventDefault(); e.stopPropagation(); recDragMoved.current = false; }
  }

  useEffect(() => {
    const el = recCarouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const pageY = window.scrollY;
      el.style.transform = `translateX(${pageY * 0.04}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = infoRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0 });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  function startAutoPlay() {
    if (images.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveImage(prev => {
          const next = prev < images.length - 1 ? prev + 1 : 0;
          setDisplayImageUrl(images[next]);
          carouselRef.current?.scrollTo({ left: next * (carouselRef.current.offsetWidth || 0), behavior: 'smooth' });
          return next;
        });
      }
    }, 2000);
  }

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [images.length]);

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
    // Gift card: use first option (e.g. Denomination, Amount) as the "type" selector
    if (product.handle === 'e-gift-card') {
      const first = product.variants[0]?.selectedOptions[0];
      return first?.name ?? null;
    }
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

  const allSizes = useMemo(() => {
    if (!sizeOptionName) return sizeOptions;
    if (product.handle === 'e-gift-card') return sizeOptions;
    const norm = sizeOptions.map(s => s.toUpperCase());
    if (norm.includes('XS') || norm.includes('X-SMALL')) return sizeOptions;
    return ['XS', ...sizeOptions];
  }, [sizeOptions, sizeOptionName]);

  const isGiftCard = product.handle === 'e-gift-card';
  const hasMultipleVariants = product.variants.length > 1;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  function handleSizeSelectInDrawer(sizeValue: string) {
    setSelectedSize(sizeValue);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
  }

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) { setSizeOpen(true); return; }
    setSizeOpen(false);
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
        {/* ── GALLERY ── */}
        <div className="ss-gallery">
          {/* Mobile: horizontal carousel */}
          <div className="ss-mobile-gallery">
            <div
              className="ss-carousel"
              ref={carouselRef}
              onTouchStart={handleCarouselTouchStart}
              onTouchEnd={handleCarouselTouchEnd}
              onMouseDown={handleCarouselMouseDown}
              onMouseMove={handleCarouselMouseMove}
              onMouseUp={handleCarouselMouseUp}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
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
          </div>

          {/* Desktop: vertically stacked images */}
          <div className="ss-desktop-gallery">
            {images.map((img, i) => (
              <div key={i} className="ss-desktop-img-block">
                <img
                  src={img}
                  alt={`${product.title} – ${i + 1}`}
                  className="ss-gallery-img"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── INFO PANEL ── */}
        <div className="ss-info" ref={infoRef}>
          {/* Title */}
          <h1 className="ss-title">{product.title}</h1>

          {/* Price + variant name on second line */}
          <div className="ss-price-row">
            <span className="ss-price">{priceFormatted}</span>
            {(selectedColor || descriptionFirstLine) && (
              <span className="ss-subtitle">{selectedColor || descriptionFirstLine}</span>
            )}
          </div>

          {/* Variant / image thumbnails — only when >1 color variant */}
          {colorOptions.length > 1 && (
            <div className="ss-thumbs-wrap">
              {colorOptions.length > 4 && (
                <button className="ss-thumbs-arrow ss-thumbs-arrow-left" onClick={() => scrollThumbs(-1)} aria-label="Previous">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}
              <div className="ss-thumbs" ref={thumbsRef}>
                {colorOptions.map((co) => (
                  <button
                    key={co.value}
                    className={`ss-thumb ${selectedColor === co.value ? 'active' : ''}`}
                    onClick={() => handleColorChange(co.value)}
                    title={co.value}
                  >
                    <img src={co.imageUrl} alt={co.value} />
                  </button>
                ))}
              </div>
              {colorOptions.length > 4 && (
                <button className="ss-thumbs-arrow ss-thumbs-arrow-right" onClick={() => scrollThumbs(1)} aria-label="Next">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
            </div>
          )}

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
                ? (
                  <span style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                    <span style={{width:7,height:7,borderRadius:'50%',background:'#fff',display:'inline-block',flexShrink:0}}/>
                    {isGiftCard ? 'SELECT TYPE' : t('common.selectSize')}
                  </span>
                )
                : t('common.addToBag')}
            </button>
          </div>


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
              <button className="ss-accordion-header" onClick={() => toggleAccordion('description')}>
                <span>Description</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'description' ? ' open' : ''}`}>+</span>
              </button>
              {expandedAccordion === 'description' && (
                <div className="ss-accordion-body">
                  <TranslatedDesc text={product.description} className="ss-accordion-text" />
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
                  <p className="ss-accordion-text">{t('common.deliveryEstimate')}</p>
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

      {/* ── SIZE DRAWER ── */}
      <div className={`ss-size-drawer${sizeOpen && hasSizes ? ' open' : ''}`}>
        <div className="ss-size-drawer-header">
          <span className="ss-size-drawer-title">{product.title}</span>
          <div className="ss-size-header-right">
            <span className="ss-size-guide">SIZE GUIDE</span>
            <button className="ss-size-close" onClick={() => setSizeOpen(false)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="ss-size-drawer-list">
          {allSizes.map((size) => {
            const available = isSizeAvailable(size);
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                className={`ss-size-row${isSelected ? ' selected' : ''}${!available ? ' oos' : ''}`}
                onClick={() => handleSizeSelectInDrawer(size)}
              >
                <span className="ss-size-row-name">
                  {isSelected && <span className="ss-size-bullet">•&nbsp;</span>}
                  {size}
                </span>
                {!available && (
                  <div className="ss-size-oos-wrap">
                    <span className="ss-sold-out">SOLD OUT</span>
                    <span className="ss-get-notified">GET NOTIFIED</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="ss-size-drawer-footer">
          <button
            className="ss-size-add-btn"
            onClick={handleAddToBag}
            disabled={!selectedSize || adding || !isSizeAvailable(selectedSize)}
          >
            {adding ? 'ADDING...' : 'ADD TO BAG'}
          </button>
        </div>
      </div>

      {/* ── RECOMMENDED ── */}
      {recommended.length > 0 && (
        <section className="rec-section">
          <h2 className="rec-label">YOU MAY ALSO LIKE</h2>
          <div className="rec-carousel-wrap">
            <div
              className="rec-carousel"
              ref={recCarouselRef}
              onPointerDown={recPointerDown}
              onPointerMove={recPointerMove}
              onPointerUp={recPointerUp}
              onPointerCancel={recPointerUp}
              onClick={recCarouselClick}
            >
              <div style={{flexShrink: 0, width: 16, minWidth: 16}} />
              {recommended.map((p) => (
                <div className="rec-carousel-item" key={p.handle}>
                  <RecommendedCard key={p.handle} product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


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

        /* ── GALLERY ── */
        .ss-gallery {
          position: relative;
          background: #EEEDED;
          overflow: hidden;
        }
        /* Mobile: show carousel, hide desktop stack */
        .ss-mobile-gallery { display: block; }
        .ss-desktop-gallery { display: none; }
        .ss-carousel {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          overflow: hidden;
          user-select: none;
          cursor: grab;
        }
        .ss-carousel:active { cursor: grabbing; }
        .ss-carousel-slide {
          width: 100%;
          flex-shrink: 0;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EEEDED;
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
          gap: 14px;
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
          background: #EEEDED;
        }

        .ss-title {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 8px 0;
          letter-spacing: 0;
          text-transform: none;
          text-align: center;
        }
        .ss-price-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ss-price {
          font-size: 16px;
          font-weight: 500;
          white-space: nowrap;
          letter-spacing: 0;
        }
        .ss-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: #555;
          line-height: 1.5;
          letter-spacing: 0;
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
        .ss-thumbs-arrow-left { left: -14px; }
        .ss-thumbs-arrow-right { right: -14px; }
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

        /* ── SIZE DRAWER ── */
        .ss-size-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(100vw, 400px);
          background: #fff;
          border-left: 1px solid #e0e0e0;
          z-index: 1002;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-primary, 'HK Grotesk', 'Inter', sans-serif);
        }
        .ss-size-drawer.open { transform: translateX(0); }

        .ss-size-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e8e8e8;
          flex-shrink: 0;
          gap: 12px;
        }
        .ss-size-drawer-title {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ss-size-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .ss-size-guide {
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          cursor: pointer;
        }
        .ss-size-close {
          background: none; border: none;
          cursor: pointer; color: #000;
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; padding: 4px;
        }

        .ss-size-drawer-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ss-size-drawer-list::-webkit-scrollbar { display: none; }

        .ss-size-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          background: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .ss-size-row.oos { cursor: default; }
        .ss-size-row-name {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111;
          display: flex;
          align-items: center;
        }
        .ss-size-row.oos .ss-size-row-name { color: #bbb; }
        .ss-size-bullet { color: #111; }
        .ss-size-oos-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .ss-sold-out {
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #bbb;
        }
        .ss-get-notified {
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111;
          text-decoration: underline;
        }

        .ss-size-drawer-footer {
          flex-shrink: 0;
          padding: 16px 20px 20px;
          border-top: 1px solid #e8e8e8;
        }
        .ss-size-add-btn {
          display: block;
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          padding: 15px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ss-size-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ss-size-add-btn:not(:disabled):hover { background: #333; }

        /* Delivery line */
        .ss-delivery {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 0;
          font-size: 10px;
          font-weight: 500;
          color: #444;
          letter-spacing: 0.06em;
          text-transform: uppercase;
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
          font-size: 11px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          text-align: left;
          letter-spacing: 0.08em;
          text-transform: uppercase;
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

        /* ── MOBILE STICKY BAR (removed) ── */
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
           Gallery = 58%, Info = 42%
        ══════════════════════════════════════ */
        @media (min-width: 768px) {
          .ss-pdp-layout {
            flex-direction: row;
            min-height: 100vh;
          }

          /* Desktop: hide mobile carousel, show stacked images */
          .ss-mobile-gallery { display: none; }
          .ss-desktop-gallery { display: block; }

          /* Gallery column */
          .ss-gallery {
            width: 58%;
            flex-shrink: 0;
            background: transparent;
            overflow: visible;
          }

          /* Each image block: full width, 3:4 */
          .ss-desktop-img-block {
            width: 100%;
            aspect-ratio: 3 / 4;
            background: #EEEDED;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ss-desktop-img-block .ss-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          /* Info panel: sticky on the right, full viewport height */
          .ss-info {
            width: 42%;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            padding: 130px 70px 80px 70px;
            scrollbar-width: none;
            box-sizing: border-box;
          }
          .ss-info::-webkit-scrollbar { display: none; }

          .ss-mobile-sticky { display: none; }
        }

        @media (min-width: 1200px) {
          .ss-info {
            padding: 130px 80px 80px 80px;
          }
        }

        /* ── RECOMMENDED ── */
        .rec-section {
          padding: 60px 0 80px;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          overflow: hidden;
        }
        .rec-label {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #111;
          margin: 0 0 28px;
          padding-left: 0;
          text-align: center;
        }
        .rec-carousel-wrap {
          overflow: hidden;
        }
        .rec-carousel {
          display: flex;
          flex-direction: row;
          gap: 0;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          cursor: grab;
          user-select: none;
          padding-left: 0;
          padding-bottom: 4px;
          scroll-padding-left: 16px;
          will-change: transform;
        }
        .rec-carousel:active { cursor: grabbing; }
        .rec-carousel.dragging { cursor: grabbing; }
        .rec-carousel.dragging * { pointer-events: none; user-select: none; }
        .rec-carousel::-webkit-scrollbar { display: none; }
        .rec-carousel { scrollbar-width: none; }
        .rec-carousel-item {
          flex: 0 0 calc(25% - 18px);
          min-width: calc(25% - 18px);
          scroll-snap-align: start;
          padding-right: 1px;
        }
        @media (max-width: 767px) {
          .rec-section { padding: 40px 0 60px; }
          .rec-label { font-size: 14px; }
          .rec-carousel { padding-left: 0; }
          .rec-carousel-item {
            flex: 0 0 83.333vw;
            min-width: 83.333vw;
          }
        }
      `}</style>
    </>
  );
}
