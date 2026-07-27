'use client';

import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/shopify';
import type { RecommendedProduct } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  product: RecommendedProduct;
}

export default function RecommendedCard({ product }: Props) {
  const { formatPrice, language } = useLocale();
  const displayHref = `/product/${product.handle}`;
  const primaryImage = getOptimizedImageUrl(product.imageUrl, 600);
  const secondImage = product.siblings.length > 0 ? getOptimizedImageUrl(product.siblings[0].imageUrl, 600) : null;

  return (
    <div className="tonet-house-carousel__card-wrap">
      <div className="tonet-house-carousel__card">
        <Link href={displayHref} className="tonet-house-carousel__image-link">
          <div className="tonet-house-carousel__image-wrap">
            {product.imageUrl && (
              <img 
                src={primaryImage} 
                alt={product.title} 
                className="tonet-house-carousel__image tonet-house-carousel__image--primary" 
              />
            )}
            {secondImage && (
              <img 
                src={secondImage} 
                alt={product.title} 
                className="tonet-house-carousel__image tonet-house-carousel__image--secondary" 
              />
            )}
          </div>
        </Link>
        <div className="tonet-house-carousel__meta">
          <Link href={displayHref} className="tonet-house-carousel__meta-left">
            <span className="tonet-house-carousel__title">{product.title}</span>
            <span className="tonet-house-carousel__price">
              {formatPrice(product.price, product.currencyCode || 'EUR')}
            </span>
          </Link>
          <Link href={displayHref} className="tonet-house-carousel__buy-btn">
            {language === 'es' ? 'Comprar' : 'Buy'}
          </Link>
        </div>
      </div>

      <style>{`
        .tonet-house-carousel__card-wrap {
          position: relative;
        }
        .tonet-house-carousel__card {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .tonet-house-carousel__image-link {
          display: block;
          text-decoration: none;
        }
        .tonet-house-carousel__image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f7f8fa;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          isolation: isolate;
          padding: 2px;
          box-sizing: border-box;
        }
        .tonet-house-carousel__image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 0;
          transition: opacity 300ms ease-in-out, transform 0.4s ease;
          mix-blend-mode: multiply;
        }
        .tonet-house-carousel__image--secondary {
          position: absolute;
          inset: 2px;
          opacity: 0;
        }
        .tonet-house-carousel__card:hover .tonet-house-carousel__image-wrap {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
        }
        .tonet-house-carousel__card:hover .tonet-house-carousel__image {
          transform: scale(1.04);
        }
        .tonet-house-carousel__card:hover .tonet-house-carousel__image--primary {
          opacity: ${secondImage ? 0 : 1};
        }
        .tonet-house-carousel__card:hover .tonet-house-carousel__image--secondary {
          opacity: 1;
        }
        .tonet-house-carousel__meta {
          padding-top: 18px;
          padding-bottom: 24px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
          text-decoration: none;
        }
        .tonet-house-carousel__meta-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          flex: 1;
          text-decoration: none;
          color: inherit;
        }
        .tonet-house-carousel__title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: capitalize;
          letter-spacing: 0.05em;
          line-height: 1.3;
          color: #111;
          margin: 0;
          white-space: normal;
          text-align: left;
        }
        .tonet-house-carousel__price {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: left;
        }
        .tonet-house-carousel__buy-btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: var(--w-medium);
          letter-spacing: 0.05em;
          text-transform: capitalize;
          text-decoration: underline;
          text-underline-offset: 3px;
          color: #111111;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .tonet-house-carousel__buy-btn:hover {
          opacity: 0.7;
        }

        @media (max-width: 767px) {
          .tonet-house-carousel__meta {
            padding: 12px 0;
            gap: 8px;
          }
          .tonet-house-carousel__meta-left {
            gap: 2px;
          }
          .tonet-house-carousel__title {
            font-size: 9.5px;
          }
          .tonet-house-carousel__price {
            font-size: 9.5px;
          }
          .tonet-house-carousel__buy-btn {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
}
