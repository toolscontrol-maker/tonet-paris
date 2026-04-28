'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { CollectionDetail, Product, RecommendedProduct } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import ProductInfoBlock from '@/components/ProductInfoBlock';
import ProductInfoDrawer from '@/components/ProductInfoDrawer';
import NotifyMeModal from '@/components/NotifyMeModal';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useWishlist } from '@/context/WishlistContext';

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
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);

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

        {/* ── LEFT: swipeable gallery (mobile) / stacked (desktop) ── */}
        <div className="col-gallery-wrap">
          <div className="col-gallery" ref={galleryRef} onScroll={handleGalleryScroll}>
            {galleryImages.map((url, i) => (
              <img
                key={`${selectedIdx}-${i}`}
                src={url}
                alt={`${selectedProduct?.title ?? collection.title} ${i + 1}`}
                className="col-main-img"
              />
            ))}
          </div>
          {galleryImages.length > 1 && (
            <div className="col-gallery-dots">
              {galleryImages.map((_, i) => (
                <span key={i} className={`col-gallery-dot${currentImageIdx === i ? ' active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: info panel (identical structure to PDP) ── */}
        <div className="col-info">

          {/* Sticky block: collection title + selected product name + price */}
          <div className="col-sticky-block">
            <div className="col-product-row">
              <h1 className="col-collection-name">{collection.title}</h1>
              {selectedProduct && (
                <span className="col-price">{priceFormatted} {currencyCode}</span>
              )}
            </div>
            {selectedProduct && (
              <p className="col-variant-label">{selectedProduct.title}</p>
            )}

            {/* ATB + wishlist row — inside sticky block so they pin together */}
            {collection.products.length > 0 && (
              <div className="col-atb-row">
                <button
                  className="col-atb-btn"
                  onClick={handleAddToBag}
                  disabled={adding || !selectedVariant?.availableForSale}
                >
                  {adding
                    ? t('common.adding')
                    : selectedVariant?.availableForSale
                    ? t('common.addToBag')
                    : t('common.soldOut')}
                </button>
                <button className="col-wish-btn" aria-label="Add to wishlist" onClick={() => selectedProduct && toggle({ handle: selectedProduct.handle, title: selectedProduct.title, imageUrl: selectedProduct.imageUrl, price: selectedProduct.price, currencyCode: selectedProduct.currencyCode, collectionTitle: collection.title })}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={selectedProduct && has(selectedProduct.handle) ? '#111' : 'none'} stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Product thumbnails — replaces colour swatches */}
          <div className="col-swatches">
            {collection.products.length > 0 ? (
              collection.products.map((product, idx) => (
                <button
                  key={product.handle}
                  className={`swatch-thumb${selectedIdx === idx ? ' active' : ''}`}
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

          {/* Size selector */}
          {sizeOptions.length > 0 && (
            <>
              <div className="pdp-sizes">
                {STANDARD_SIZES.filter(s => sizeOptions.includes(s)).map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      className={`pdp-size-btn${selectedSize === size ? ' active' : ''}${!available ? ' sold-out' : ''}`}
                      onClick={() => available ? setSelectedSize(size) : undefined}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="pdp-out-of-stock">{t('common.outOfStock')} <button type="button" className="pdp-notify-link" onClick={() => setNotifyOpen(true)}>{t('common.getNotified')}</button></p>
            </>
          )}

          {/* Info blocks — identical to PDP */}
          <ProductInfoBlock
            title={t('common.freeDelivery')}
            badge={t('common.enterPostalCode')}
            subtitle={t('common.deliveryEstimate')}
            onClick={() => setActiveDrawer('delivery')}
          />
          <ProductInfoBlock
            title={t('common.giftWrapping')}
            subtitle={t('common.giftWrappingDesc')}
            borderBottom
            onClick={() => setActiveDrawer('gift')}
          />

          <ProductInfoDrawer
            isOpen={activeDrawer === 'delivery'}
            onClose={() => setActiveDrawer(null)}
            title={t('common.drawerDeliveryTitle')}
          >
            <p><strong>{t('common.drawerDeliveryLabel')}</strong><br />{t('common.drawerDeliveryBody')}</p>
            <p style={{ marginTop: '16px' }}><strong>{t('common.drawerReturnsLabel')}</strong><br />{t('common.drawerReturnsBody')}</p>
          </ProductInfoDrawer>

          <ProductInfoDrawer
            isOpen={activeDrawer === 'gift'}
            onClose={() => setActiveDrawer(null)}
            title={t('common.drawerGiftTitle')}
            heroImage="/logotipo.png"
          >
            <p>{t('common.drawerGiftBody')}</p>
            <p style={{ marginTop: '14px' }}>{t('common.drawerGiftNote1')}</p>
          </ProductInfoDrawer>

          {/* Collection / product description (auto-translated) */}
          <TranslatedDesc text={collection.description || selectedProduct?.description} />



          <div className="col-need-help">
            <Link href="/contact">{t('common.needHelp')}</Link>
          </div>
        </div>
      </div>

      <NotifyMeModal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        sizes={sizeOptions}
        preselectedSize={selectedSize}
        productTitle={selectedProduct?.title}
      />

      {/* ── RECOMMENDED SECTION ── */}
      {recommended.length > 0 && (
        <section className="rec-section">
          <p className="rec-label">{t('common.recommended')}</p>
          <div className="rec-grid">
            {recommended.map((p) => (
              <RecommendedCard key={p.handle} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="col-mobile-sticky">
        <button
          className="col-atb-btn"
          onClick={handleAddToBag}
          disabled={adding || !selectedVariant?.availableForSale}
        >
          {adding ? t('common.adding') : selectedVariant?.availableForSale ? t('common.addToBag') : t('common.soldOut')}
        </button>
        <button className="col-wish-btn" aria-label="Add to wishlist" onClick={() => selectedProduct && toggle({ handle: selectedProduct.handle, title: selectedProduct.title, imageUrl: selectedProduct.imageUrl, price: selectedProduct.price, currencyCode: selectedProduct.currencyCode, collectionTitle: collection.title })}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={selectedProduct && has(selectedProduct.handle) ? '#111' : 'none'} stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <style>{`
        .col-layout {
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #000;
        }

        /* ── Mobile: horizontal swipe gallery ── */
        .col-gallery-wrap {
          position: relative;
          overflow: hidden;
        }
        .col-gallery {
          display: flex;
          flex-direction: row;
          overflow-x: scroll;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .col-gallery::-webkit-scrollbar { display: none; }
        .col-main-img {
          width: 100%;
          flex-shrink: 0;
          scroll-snap-align: start;
          aspect-ratio: 3 / 4;
          object-fit: contain;
          display: block;
          background: #f5f5f5;
        }
        /* Rectangle indicators — overlaid bottom-left of image */
        .col-gallery-dots {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10;
          pointer-events: none;
        }
        .col-gallery-dot {
          width: 18px;
          height: 3px;
          border-radius: 0;
          background: rgba(0,0,0,0.2);
          transition: background 0.2s, width 0.2s;
          display: inline-block;
        }
        .col-gallery-dot.active {
          background: #111;
          width: 28px;
        }

        .col-info {
          padding: 24px 20px 140px 20px;
        }

        /* Product name + price row */
        .col-product-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 6px;
        }
        .col-collection-name {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          line-height: 1.2;
          margin: 0;
          flex: 1;
        }
        .col-price {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .col-variant-label {
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: #555;
          margin: 4px 0 14px;
          padding: 0;
        }

        /* Product thumbnails — same style as colour swatches */
        .col-swatches {
          display: flex;
          gap: 0;
          margin-bottom: 16px;
          flex-wrap: wrap;
          border: 1px solid #e0e0e0;
          width: fit-content;
        }
        .swatch-thumb {
          width: 53px;
          height: 84px;
          padding: 0;
          border: 2px solid transparent;
          border-right: 1px solid #e0e0e0;
          border-radius: 0;
          cursor: pointer;
          background: #f5f5f5;
          transition: border-color 0.15s;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        .swatch-thumb:last-child { border-right: none; }
        .swatch-thumb.active { border: 2px solid #99bbff; }
        .swatch-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; background: #f5f5f5; }

        /* Size selector (same as PDP) */
        .pdp-sizes {
          display: flex;
          flex-wrap: wrap;
          margin: 12px 0 20px;
          border: 1px solid #e0e0e0;
        }
        .pdp-size-btn {
          flex: 1 0 auto;
          padding: 12px 16px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: none;
          border-right: 1px solid #e0e0e0;
          border-radius: 0;
          background: #FAF8F5;
          cursor: pointer;
          color: #111;
          min-width: 44px;
          text-align: center;
          transition: background 0.12s;
        }
        .pdp-size-btn:last-child { border-right: none; }
        .pdp-size-btn:hover:not(.sold-out):not(.active) { background: #f5f5f5; }
        .pdp-size-btn.active { background: #99bbff; color: #111; box-shadow: inset 0 0 0 2px #6699ee; }
        .pdp-size-btn.sold-out { color: #ccc; cursor: not-allowed; text-decoration: line-through; }
        .pdp-out-of-stock {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #666;
          margin: -8px 0 18px;
        }
        .pdp-notify-link {
          color: #0000cc; text-decoration: none;
          background: none; border: none; padding: 0; margin: 0;
          font: inherit; font-size: 11px; cursor: pointer; letter-spacing: inherit;
        }
        .pdp-notify-link:hover { text-decoration: underline; }

        /* ATB + wishlist */
        .col-atb-row {
          display: flex;
          height: 50px;
          margin-bottom: 36px;
          border: 1px solid #111;
        }
        .col-atb-btn {
          flex: 1;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 0;
          padding: 0 24px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          line-height: 1.2;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.2s;
        }
        .col-atb-btn:hover { opacity: 0.85; }
        .col-atb-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .col-wish-btn {
          width: 50px;
          align-self: stretch;
          border: none;
          border-left: 1px solid #111;
          border-radius: 0;
          background: #FAF8F5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }

        .col-no-products {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }

        /* Description */
        .col-desc-wrapper {
          margin: 20px 0 16px 0;
        }
        .col-desc {
          position: relative;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.75;
          letter-spacing: 0.01em;
          overflow: hidden;
          max-height: calc(1.75em * 6);
        }
        .col-desc.expanded {
          max-height: none;
        }
        .col-desc p {
          margin: 0;
        }
        .col-desc-blur {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2em;
          background: linear-gradient(to bottom, rgba(250,248,245,0) 0%, rgba(250,248,245,1) 100%);
          pointer-events: none;
        }
        .col-desc-toggle {
          background: none;
          border: none;
          padding: 6px 0 0 0;
          font: inherit;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #0000cc;
          cursor: pointer;
          text-decoration: none;
        }
        .col-desc-toggle:hover {
          text-decoration: underline;
        }

        /* Need help / view full product */
        .col-need-help { margin-bottom: 12px; }
        .col-need-help a { color: #0000cc; font-size: 11px; font-weight: 400; letter-spacing: 0.04em; text-decoration: none; }
        .col-need-help a:hover { text-decoration: underline; }

        /* Mobile sticky */
        .col-mobile-sticky {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          padding: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: #FAF8F5;
          border-top: 1px solid #ededed;
          z-index: 200;
          gap: 0;
          box-sizing: border-box;
          height: 56px;
        }
        .col-mobile-sticky .col-atb-btn {
          flex: 1;
          height: 100%;
          border: none;
          border-radius: 0;
        }
        .col-mobile-sticky .col-wish-btn {
          border: none;
          border-left: 1px solid #ededed;
          height: 100%;
          width: 56px;
        }

        /* ── DESKTOP ── */
        @media (min-width: 768px) {
          .col-layout {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }

          /* Desktop: vertical stacked gallery */
          .col-gallery-wrap { position: static; }
          .col-gallery {
            display: flex;
            flex-direction: column;
            overflow-x: unset;
            scroll-snap-type: unset;
          }
          .col-main-img {
            width: 100%;
            flex-shrink: unset;
            scroll-snap-align: unset;
            aspect-ratio: 3 / 4;
            object-fit: contain;
            display: block;
            background: #f5f5f5;
          }
          .col-gallery-dots { display: none; }

          .col-info {
            position: sticky;
            top: 120px;
            padding: 0 48px 80px 48px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .col-info::-webkit-scrollbar { display: none; }

          .col-sticky-block {
            position: sticky;
            top: 0;
            z-index: 5;
            background: #FAF8F5;
            padding-top: 40px;
            padding-bottom: 12px;
            margin: 0 -48px;
            padding-left: 48px;
            padding-right: 48px;
          }

          .col-atb-row {
            margin-bottom: 0;
          }

          .col-mobile-sticky { display: none; }
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
          .rec-section { padding: 32px 0 120px; }
          .rec-label { padding-left: 16px; }
          .rec-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
