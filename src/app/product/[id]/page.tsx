"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';

// Mock product data
const mockProduct = {
  id: "1",
  title: "ORIGINAL ARTWORK — ABSTRACT",
  price: "1.500",
  colour: "Deep violet / Black",
  description:
    "An original artwork crafted from high-quality canvas with a brushed treatment and detailed with contemporary brushwork. It features a built-in hanging system, UV-resistant varnish, and a signed certificate of authenticity. Complete with archival packaging and a detachable artist label.",
  details: [
    "Original artwork on canvas",
    "UV-resistant varnish",
    "Hand-signed by the artist",
    "Certificate of authenticity included",
    "Ready to hang",
  ],
  images: [
    "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
};

export default function ProductPage() {
  const product = mockProduct;
  const [activeImage, setActiveImage] = useState(0);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const { openCart } = useUI();

  function handleAddToBag() {
    openCart();
  }

  return (
    <>


      <div className="pdp-layout">
        {/* ── LEFT: Image Gallery ── */}
        <div className="pdp-gallery">
          {/* Mobile: horizontal swipeable slider */}
          <div className="pdp-slider">
            {product.images.map((img, i) => (
              <div key={i} className="pdp-slide">
                <img src={img} alt={`${product.title} — view ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Desktop: stacked images */}
          {product.images.map((img, i) => (
            <div key={i} className="pdp-stacked-img">
              <img src={img} alt={`${product.title} — view ${i + 1}`} />
            </div>
          ))}
        </div>

        {/* ── RIGHT: Sticky product info ── */}
        <div className="pdp-info">

          <div className="pdp-title-row">
            <h1 className="pdp-title">{product.title}</h1>
            <span className="pdp-price">{product.price} €</span>
          </div>

          <p className="pdp-colour">{product.colour}</p>

          {/* Colour thumbnails */}
          <div className="pdp-swatches">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`swatch-thumb ${activeImage === i ? 'active' : ''}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt={`Variant ${i + 1}`} />
              </button>
            ))}
          </div>

          <p className="pdp-size-label">One size</p>

          {/* ADD TO BAG row */}
          <div className="pdp-atb-row">
            <button className="pdp-atb-btn" onClick={handleAddToBag}>ADD TO BAG</button>
            {/* Acne Studios wishlist heart — outlined, blue */}
            <button className="pdp-wish-btn" aria-label="Add to wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0000cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Delivery strip */}
          <div className="pdp-delivery-strip">
            <div className="delivery-left">
              <span className="delivery-link">FREE DELIVERY &amp; RETURNS</span>
              <span className="delivery-enter"> ENTER POSTAL CODE</span>
            </div>
            <span className="delivery-arrow">›</span>
          </div>
          <div className="pdp-delivery-sub-row">
            <span>Estimated delivery within 2–4 business days</span>
          </div>

          {/* Gift wrapping */}
          <div className="pdp-gift">
            <span className="gift-title">COMPLIMENTARY GIFTWRAPPING</span>
            <span className="gift-arrow">›</span>
          </div>
          <div className="pdp-gift-sub-row">
            <span>Available at checkout</span>
          </div>

          {/* Description */}
          <p className="pdp-desc">{product.description}</p>

          {/* Details list */}
          <ul className="pdp-details">
            {product.details.slice(0, showMoreDetails ? product.details.length : 3).map((d, i) => (
              <li key={i}>— {d}</li>
            ))}
            {!showMoreDetails && product.details.length > 3 && (
              <li className="faded">— ...</li>
            )}
          </ul>

          <button className="pdp-show-more" onClick={() => setShowMoreDetails(!showMoreDetails)}>
            {showMoreDetails ? '– SHOW LESS' : '+ SHOW MORE'}
          </button>

          <div className="pdp-need-help">
            <Link href="#">Need help?</Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="pdp-mobile-sticky">
        <button className="pdp-atb-btn" onClick={handleAddToBag}>ADD TO BAG</button>
        <button className="pdp-wish-btn" aria-label="Add to wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0000cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <style>{`


        /* ─── LAYOUT ─── */
        .pdp-layout {
          display: grid;
          grid-template-columns: 1fr;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          color: #000;
        }

        /* ─── GALLERY ─── */
        .pdp-stacked-img { display: none; }
        .pdp-stacked-img img { width: 100%; display: block; }

        .pdp-slider {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pdp-slider::-webkit-scrollbar { display: none; }
        .pdp-slide {
          flex: 0 0 100%;
          scroll-snap-align: start;
        }
        .pdp-slide img {
          width: 100%;
          height: 80vw;
          object-fit: cover;
          display: block;
        }

        /* ─── INFO PANEL ─── */
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
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          flex: 1;
        }
        .pdp-price { font-size: 12px; white-space: nowrap; }
        .pdp-colour { margin: 0 0 16px 0; font-size: 12px; color: #555; }

        /* Swatches */
        .pdp-swatches {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .swatch-thumb {
          width: 52px;
          height: 52px;
          padding: 2px;
          border: 2px solid transparent;
          cursor: pointer;
          background: #f5f5f5;
          transition: border-color 0.2s;
        }
        .swatch-thumb.active { border-color: #0000cc; }
        .swatch-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .pdp-size-label { font-size: 12px; margin: 0 0 20px 0; color: #555; }

        /* ATB Row */
        .pdp-atb-row {
          display: flex;
          height: 50px;
          margin-bottom: 0;
        }
        .pdp-atb-btn {
          flex: 1;
          background: #0000cc;
          color: #fff;
          border: none;
          padding: 0 24px;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.2s;
        }
        .pdp-atb-btn:hover { opacity: 0.85; }
        .pdp-wish-btn {
          width: 50px;
          height: 50px;
          border: 1px solid #c8cad0;
          border-left: none;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }

        /* Delivery */
        .pdp-delivery-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 4px 0;
          border-top: 1px solid #ededed;
          margin-top: 12px;
          font-size: 11px;
        }
        .delivery-left { display: flex; gap: 6px; align-items: center; }
        .delivery-link { color: #0000cc; font-weight: 500; }
        .delivery-enter { color: #768194; font-size: 10px; }
        .delivery-arrow { color: #0000cc; font-size: 14px; }

        .pdp-delivery-sub-row {
          font-size: 11px;
          color: #555;
          padding-bottom: 12px;
          border-bottom: 1px solid #ededed;
        }

        /* Gift */
        .pdp-gift {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 4px 0;
          font-size: 11px;
        }
        .gift-title { color: #0000cc; font-weight: 500; }
        .gift-arrow { color: #0000cc; font-size: 14px; }
        .pdp-gift-sub-row {
          font-size: 11px;
          color: #555;
          padding-bottom: 12px;
          border-bottom: 1px solid #ededed;
        }

        /* Desc & Details */
        .pdp-desc { margin: 20px 0 16px 0; font-size: 12px; line-height: 1.7; }
        .pdp-details { list-style: none; padding: 0; margin: 0 0 8px 0; font-size: 12px; line-height: 1.9; }
        .pdp-details .faded { color: #bbb; }
        .pdp-show-more {
          background: none; border: none; color: #0000cc;
          font-size: 12px; padding: 0; cursor: pointer; font-family: inherit; margin-bottom: 24px;
        }
        .pdp-need-help a { color: #0000cc; font-size: 12px; text-decoration: none; }
        .pdp-need-help a:hover { text-decoration: underline; }

        /* Mobile sticky bar */
        .pdp-mobile-sticky {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          padding: 12px 16px;
          background: #fff;
          border-top: 1px solid #ededed;
          z-index: 200;
          gap: 0;
        }
        .pdp-mobile-sticky .pdp-atb-btn { flex: 1; }
        .pdp-mobile-sticky .pdp-wish-btn { border: 1px solid #ededed; }

        /* ─── DESKTOP ─── */
        @media (min-width: 768px) {
          .pdp-breadcrumb {
            padding-top: 70px;
            padding-left: 0;
          }

          .pdp-layout {
            /* Exactly 50/50 split as requested */
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }

          .pdp-slider { display: none; }
          .pdp-stacked-img { display: block; }

          .pdp-info {
            position: sticky;
            top: 120px;
            padding: 40px 48px 80px 48px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .pdp-info::-webkit-scrollbar { display: none; }

          .pdp-mobile-sticky { display: none; }
        }
      `}</style>
    </>
  );
}
