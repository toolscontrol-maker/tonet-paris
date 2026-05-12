'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { RecommendedProduct } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  product: RecommendedProduct;
}

export default function RecommendedCard({ product }: Props) {
  const { formatPrice } = useLocale();
  const [hoveredSibling, setHoveredSibling] = useState<{ handle: string; imageUrl: string } | null>(null);
  const [showSwatches, setShowSwatches] = useState(false);

  const displayImage = hoveredSibling?.imageUrl ?? product.imageUrl;
  const displayHref = product.collectionHandle
    ? `/collection/${product.collectionHandle}`
    : `/product/${product.handle}`;

  // Total colour count = self + siblings
  const colourCount = product.siblings.length + 1;

  return (
    <div
      className="rec-card-wrap"
      onMouseEnter={() => setShowSwatches(true)}
      onMouseLeave={() => { setShowSwatches(false); setHoveredSibling(null); }}
    >
      <Link href={displayHref} className="rec-card">
        <div className="rec-img-wrap">
          {displayImage && (
            <img src={displayImage} alt={product.title} className="rec-img" />
          )}
          {/* Collection sibling swatches — shown on hover, bottom-left */}
          {showSwatches && product.siblings.length > 0 && (
            <div className="rec-swatches">
              {/* Current product swatch */}
              <div
                className={`rec-swatch${!hoveredSibling ? ' active' : ''}`}
                onMouseEnter={(e) => { e.preventDefault(); setHoveredSibling(null); }}
              >
                <img src={product.imageUrl} alt={product.title} className="rec-swatch-img" />
              </div>
              {/* Sibling swatches */}
              {product.siblings.slice(0, 3).map((s) => (
                <div
                  key={s.handle}
                  className={`rec-swatch${hoveredSibling?.handle === s.handle ? ' active' : ''}`}
                  onMouseEnter={(e) => { e.preventDefault(); setHoveredSibling(s); }}
                >
                  <img src={s.imageUrl} alt={s.handle} className="rec-swatch-img" />
                </div>
              ))}
              {product.siblings.length > 3 && (
                <span className="rec-swatch-more">+</span>
              )}
            </div>
          )}
        </div>
        <div className="rec-meta">
          <span className="rec-title">{product.title}</span>
          <span className="rec-price">{formatPrice(product.price, product.currencyCode)}</span>
          {colourCount > 1 && (
            <span className="rec-collection">{colourCount} Colours</span>
          )}
        </div>
      </Link>

      <style>{`
        .rec-card-wrap {
          position: relative;
        }
        .rec-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border: 1px solid transparent;
          transition: border-color 0.15s;
          cursor: pointer;
        }
        .rec-card-wrap:hover .rec-card {
          border-color: #e0e0e0;
        }
        .rec-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #ffffff;
          overflow: hidden;
        }
        .rec-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity 0.15s ease;
        }

        /* ── Swatches ── */
        .rec-swatches {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          gap: 6px;
          align-items: center;
          z-index: 2;
        }
        .rec-swatch {
          width: 32px;
          height: 32px;
          border: 1px solid #d0d0d0;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.12s;
        }
        .rec-swatch:hover,
        .rec-swatch.active {
          border-color: #111;
        }
        .rec-swatch-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .rec-swatch-more {
          font-size: 13px;
          font-weight: 500;
          color: #666;
          padding-left: 2px;
        }

        /* ── Meta ── */
        .rec-meta {
          padding-top: 10px;
          padding-right: 12px;
          padding-bottom: 16px;
          padding-left: 1px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rec-title {
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          line-height: 1.3;
          color: #111;
        }
        .rec-price {
          font-size: 13px;
          font-weight: 400;
          color: #111;
        }
        .rec-collection {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.03em;
          color: #999;
        }
      `}</style>
    </div>
  );
}
