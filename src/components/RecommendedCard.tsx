'use client';

import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/shopify';
import type { RecommendedProduct } from '@/lib/shopify';

interface Props {
  product: RecommendedProduct;
}

const getArchiveRef = (handle: string) => {
  const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const num = String((hash % 9000) + 1000).padStart(4, '0');
  return `ARC-26-${num}`;
};

export default function RecommendedCard({ product }: Props) {
  const displayHref = `/product/${product.handle}`;
  const primaryImage = getOptimizedImageUrl(product.imageUrl, 600);
  const secondImage = product.siblings.length > 0 ? getOptimizedImageUrl(product.siblings[0].imageUrl, 600) : null;

  return (
    <div className="tonet-house-carousel__card-wrap">
      <Link href={displayHref} className="tonet-house-carousel__card">
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
        <div className="tonet-house-carousel__meta">
          <span className="tonet-house-carousel__title">{product.title}</span>
          <span className="tonet-house-carousel__archive-ref">{getArchiveRef(product.handle)}</span>
        </div>
      </Link>

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
        .tonet-house-carousel__image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f4f3f1;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          isolation: isolate;
        }
        .tonet-house-carousel__image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 0;
          transition: opacity 300ms ease-in-out;
          mix-blend-mode: multiply;
        }
        .tonet-house-carousel__image--secondary {
          position: absolute;
          inset: 0;
          opacity: 0;
        }
        .tonet-house-carousel__card:hover .tonet-house-carousel__image-wrap {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
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
          flex-direction: column;
          gap: 6px;
          align-items: center;
          text-align: center;
        }
        .tonet-house-carousel__title {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          line-height: 1.5;
          color: #111;
          max-width: 280px;
          margin: 0 auto;
          white-space: normal;
        }
        .tonet-house-carousel__archive-ref {
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #888;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
