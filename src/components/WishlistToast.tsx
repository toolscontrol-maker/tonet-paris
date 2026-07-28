"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { getOptimizedImageUrl } from "@/lib/shopify";

export default function WishlistToast() {
  const { items } = useWishlist();
  const [prevCount, setPrevCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize count on mount
  useEffect(() => {
    setPrevCount(items.length);
  }, []);

  // Show toast when a product is added
  useEffect(() => {
    if (items.length > prevCount) {
      setIsOpen(true);
      
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 6000); // stay visible for 6 seconds
      
      return () => clearTimeout(timer);
    }
    setPrevCount(items.length);
  }, [items.length]);

  if (items.length === 0) return null;

  // Slice the last 3 items added to the wishlist (newest first)
  const latestItems = items.slice(-3).reverse();

  return (
    <>
      <div className={`wt-container ${isOpen ? "wt-open" : ""}`}>
        {/* Close button */}
        <button 
          className="wt-close" 
          onClick={() => setIsOpen(false)} 
          aria-label="Close wishlist preview"
        >
          <X size={12} strokeWidth={1.5} />
        </button>

        {/* Content Row */}
        <div className="wt-content">
          {/* Left section: Title & link */}
          <div className="wt-left">
            <div className="wt-title-row">
              <span className="wt-title">Wishlist</span>
              <span className="wt-count">({items.length})</span>
            </div>
            
            <Link href="/wishlist" className="wt-link" onClick={() => setIsOpen(false)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="1.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="wt-link-text">Ver lista</span>
            </Link>
          </div>

          {/* Right section: Thumbnails */}
          <div className="wt-thumbnails">
            {latestItems.map((item, idx) => (
              <div key={`${item.handle}-${idx}`} className="wt-thumb-wrap">
                <img 
                  src={getOptimizedImageUrl(item.imageUrl, 100)} 
                  alt={item.title} 
                  className="wt-thumb-img" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .wt-container {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 10002;
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          width: 420px;
          max-width: calc(100vw - 48px);
          box-sizing: border-box;
          padding: 24px 24px;
          border-radius: 0 !important;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .wt-container.wt-open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .wt-container * {
          border-radius: 0 !important;
        }

        .wt-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: #777777;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .wt-close:hover {
          color: #000000;
        }

        .wt-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 20px;
        }

        .wt-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          align-self: flex-start;
          margin-top: 4px;
        }

        .wt-title-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .wt-title {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 19px;
          font-weight: 300;
          color: #000000;
          line-height: 1.2;
        }

        .wt-count {
          font-family: var(--font-jost), sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: #777777;
        }

        .wt-link {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #000000;
          transition: opacity 0.2s;
        }

        .wt-link:hover {
          opacity: 0.6;
        }

        .wt-link-text {
          font-family: var(--font-jost), sans-serif;
          font-size: 11px;
          font-weight: 400;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .wt-thumbnails {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wt-thumb-wrap {
          width: 54px;
          height: 72px;
          background-color: #f7f8fa;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .wt-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        @media (max-width: 767px) {
          .wt-container {
            bottom: 16px;
            left: 16px;
            max-width: calc(100vw - 32px);
            padding: 20px 16px;
            gap: 12px;
          }
          
          .wt-content {
            gap: 12px;
          }

          .wt-thumb-wrap {
            width: 45px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}
