"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct } from '@/lib/shopify';
import ProductInfoBlock from '@/components/ProductInfoBlock';
import ProductInfoDrawer from '@/components/ProductInfoDrawer';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
}

function TranslatedDesc({ text, className }: { text?: string | null; className?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return <p className={className}>{translated}</p>;
}

export default function ProductClient({ product }: Props) {
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
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants[0] ?? { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] }
  );
  const [adding, setAdding] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
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
  const [selectedSize, setSelectedSize] = useState<string>(
    () => product.variants[0]?.selectedOptions.find(o =>
      o.name.toLowerCase() === 'size'
    )?.value ?? ''
  );
  const { openCart } = useUI();
  const { addToCart } = useCart();

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

  const priceFormatted = parseFloat(selectedVariant.price.amount).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const hasMultipleVariants = product.variants.length > 1;

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
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
        const s = sizeOptionName ? fallback.selectedOptions.find(o => o.name === sizeOptionName)?.value ?? '' : '';
        setSelectedSize(s);
      }
    }
  }

  function handleSizeChange(sizeValue: string) {
    setSelectedSize(sizeValue);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
  }

  function isSizeAvailable(size: string): boolean {
    const v = findVariant(selectedColor, size);
    return v?.availableForSale ?? false;
  }

  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  return (
    <>
      <div className="pdp-layout">
        <div className="pdp-gallery">
          <img
            key={displayImageUrl}
            src={displayImageUrl}
            alt={product.title}
            className="pdp-main-img"
          />
        </div>

        <div className="pdp-info">
          <div className="pdp-sticky-block">
            <div className="pdp-title-row">
              <h1 className="pdp-title">{product.title}</h1>
              <span className="pdp-price">{priceFormatted} {selectedVariant.price.currencyCode}</span>
            </div>
            {(selectedColor || selectedVariant.title) && (
              <p className="pdp-colour-label">
                {selectedColor || selectedVariant.title}
              </p>
            )}
          </div>

          <div className="pdp-swatches">
            {colorOptions.length > 0
              ? colorOptions.map((col) => (
                  <button
                    key={col.value}
                    className={`swatch-thumb ${selectedColor === col.value ? 'active' : ''}`}
                    onClick={() => handleColorChange(col.value)}
                    title={col.value}
                  >
                    <img src={col.imageUrl || product.imageUrl} alt={col.value} />
                  </button>
                ))
              : images.map((img, i) => (
                  <button
                    key={i}
                    className={`swatch-thumb ${activeImage === i ? 'active' : ''}`}
                    onClick={() => { setActiveImage(i); setDisplayImageUrl(img); }}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))
            }
          </div>

          {sizeOptions.length > 0 ? (
            <>
              <div className="pdp-sizes">
                {STANDARD_SIZES.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      className={`pdp-size-btn${selectedSize === size ? ' active' : ''}${!available ? ' sold-out' : ''}`}
                      onClick={() => available ? handleSizeChange(size) : undefined}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="pdp-out-of-stock">Out of stock? <a href="mailto:contact@tonetstudios.com" className="pdp-notify-link">Get notified</a></p>
            </>
          ) : hasMultipleVariants && (
            <div className="pdp-variants">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  className={`pdp-variant-btn ${selectedVariant.id === v.id ? 'active' : ''} ${!v.availableForSale ? 'sold-out' : ''}`}
                  onClick={() => setSelectedVariant(v)}
                  disabled={!v.availableForSale}
                >
                  {v.title}
                </button>
              ))}
            </div>
          )}

          <div className="pdp-atb-row">
            <button
              className="pdp-atb-btn"
              onClick={handleAddToBag}
              disabled={adding || !selectedVariant.availableForSale}
            >
              {adding ? t('common.adding') : selectedVariant.availableForSale ? t('common.addToBag') : t('common.soldOut')}
            </button>
            <button className="pdp-wish-btn" aria-label="Add to wishlist" onClick={() => toggle(wishlistItem)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? '#111' : 'none'} stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

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
            {product.description && (
              <TranslatedDesc text={product.description} />
            )}
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
            <p style={{ marginTop: '14px' }}>{t('common.drawerGiftNote2')}</p>
          </ProductInfoDrawer>

          <TranslatedDesc text={product.description} className="pdp-desc" />

          <div className="pdp-need-help">
            <Link href="/contact">{t('common.needHelp')}</Link>
          </div>
        </div>
      </div>

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

      <div className="pdp-mobile-sticky">
        <button
          className="pdp-atb-btn"
          onClick={handleAddToBag}
          disabled={adding || !selectedVariant.availableForSale}
        >
          {adding ? t('common.adding') : selectedVariant.availableForSale ? t('common.addToBag') : t('common.soldOut')}
        </button>
        <button className="pdp-wish-btn" aria-label="Add to wishlist" onClick={() => toggle(wishlistItem)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? '#111' : 'none'} stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <style>{`
        .pdp-layout {
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #000;
        }

        .pdp-main-img {
          width: 100%;
          height: 80vw;
          object-fit: cover;
          display: block;
        }

        .pdp-info {
          padding: 24px 20px 120px 20px;
        }

        .pdp-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
          gap: 16px;
        }
        .pdp-title {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          line-height: 1.2;
          margin: 0;
          flex: 1;
        }
        .pdp-price {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .pdp-colour-label { margin: 5px 0 14px 0; font-size: 11px; font-weight: 400; color: #555; text-transform: uppercase; letter-spacing: 0.10em; }

        .pdp-swatches {
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
        .swatch-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; background: #f5f5f5; border-radius: 0; }

        /* SIZE SELECTOR — Tonet Studios style */
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
          transition: background 0.12s, box-shadow 0.12s;
        }
        .pdp-size-btn:last-child { border-right: none; }
        .pdp-size-btn:hover:not(.sold-out):not(.active) { background: #f5f5f5; }
        .pdp-size-btn.active { background: #99bbff; color: #111; box-shadow: inset 0 0 0 2px #6699ee; border-radius: 0; }
        .pdp-size-btn.sold-out { color: #ccc; cursor: not-allowed; text-decoration: line-through; }

        .pdp-out-of-stock {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #666;
          margin: -8px 0 18px;
        }
        .pdp-notify-link { color: #0000cc; text-decoration: none; }
        .pdp-notify-link:hover { text-decoration: underline; }

        /* Fallback variant buttons */
        .pdp-variants {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 12px 0 20px;
        }
        .pdp-variant-btn {
          padding: 8px 14px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid #ccc;
          background: #FAF8F5;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .pdp-variant-btn.active { border-color: #000; background: #000; color: #fff; }
        .pdp-variant-btn.sold-out { opacity: 0.4; cursor: not-allowed; }
        .pdp-variant-btn:hover:not(.sold-out):not(.active) { border-color: #000; }

        .pdp-atb-row {
          display: flex;
          height: 50px;
          margin-bottom: 36px;
          border: 1px solid #111;
        }
        .pdp-atb-btn {
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
        .pdp-atb-btn:hover { opacity: 0.85; }
        .pdp-wish-btn {
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


        .pdp-desc { margin: 20px 0 16px 0; font-size: 12px; font-weight: 400; line-height: 1.75; letter-spacing: 0.01em; }
        .pdp-details { list-style: none; padding: 0; margin: 0 0 8px 0; font-size: 11px; font-weight: 400; line-height: 1.9; letter-spacing: 0.02em; }
        .pdp-details .faded { color: #bbb; }
        .pdp-show-more {
          background: none; border: none; color: #0000cc;
          font-size: 11px; font-weight: 400; padding: 0; cursor: pointer; font-family: inherit; margin-bottom: 24px; letter-spacing: 0.04em;
        }
        .pdp-need-help a { color: #0000cc; font-size: 11px; font-weight: 400; letter-spacing: 0.04em; text-decoration: none; }
        .pdp-need-help a:hover { text-decoration: underline; }

        .pdp-mobile-sticky {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          padding: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: #FAF8F5;
          border-top: 1px solid #ededed;
          z-index: 200;
          gap: 0;
          height: 56px;
        }
        .pdp-mobile-sticky .pdp-atb-btn {
          flex: 1;
          height: 100%;
          border: none;
          border-radius: 0;
        }
        .pdp-mobile-sticky .pdp-wish-btn {
          border: none;
          border-left: 1px solid #ededed;
          height: 100%;
          width: 56px;
        }

        @media (min-width: 768px) {
          .pdp-breadcrumb {
            padding-top: 70px;
            padding-left: 0;
          }

          .pdp-layout {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }

          .pdp-main-img {
            width: 100%;
            height: calc(100vh - 60px);
            object-fit: cover;
            position: sticky;
            top: 60px;
          }

          .pdp-info {
            position: sticky;
            top: 120px;
            padding: 0 48px 80px 48px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .pdp-info::-webkit-scrollbar { display: none; }

          .pdp-sticky-block {
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

          .pdp-atb-row {
            position: sticky;
            top: 114px;
            z-index: 4;
            background: #FAF8F5;
            margin-bottom: 36px;
          }

          .pdp-mobile-sticky { display: none; }
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
