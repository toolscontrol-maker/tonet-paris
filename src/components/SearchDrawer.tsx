"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/shopify";
import { useUI } from "@/context/UIContext";

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, closeSearch]);

  const suggestions = [
    "Outerwear",
    "Knitwear",
    "Bags",
    "Scarves",
    "Jeans"
  ];

  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real products for suggestions
    import("@/lib/shopify").then(({ getProducts }) => {
      getProducts().then((products) => {
        const sorted = [...products].sort((a, b) => a.title.localeCompare(b.title));
        // Take first 6 for the grid limit
        setSuggestedProducts(sorted.slice(0, 6));
      });
    });
  }, []);

  return (
    <>
      <div className={`sd-backdrop ${isSearchOpen ? "open" : ""}`} aria-hidden="true" />
      
      <div className={`sd-drawer ${isSearchOpen ? "open" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">
        
        {/* HEADER */}
        <div className="sd-header">
          <span className="sd-title">SEARCH</span>
          <button className="sd-close" onClick={closeSearch} aria-label="Close search">
            X CLOSE
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="sd-input-sec">
          <svg className="sd-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="SEARCH HERE" className="sd-input" autoFocus={isSearchOpen} />
        </div>

        {/* SUGGESTIONS */}
        <div className="sd-section">
          <div className="sd-section-title">SUGGESTIONS</div>
          <div className="sd-suggestions-list">
            {suggestions.map((item) => (
              <a href="#" key={item} className="sd-suggestion-link">{item}</a>
            ))}
          </div>
        </div>

        {/* SUGGESTED PRODUCTS */}
        <div className="sd-section sd-section-products">
          <div className="sd-section-title">SUGGESTED PRODUCTS</div>
          <div className="sd-products-grid">
            {suggestedProducts.map((product: Product) => (
              <Link href={`/product/${product.id}`} onClick={closeSearch} key={product.id} className="sd-product-card">
                <img src={product.imageUrl} alt={product.title} title={product.title} />
              </Link>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        /* BACKDROP */
        .sd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1000;
        }
        .sd-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* DRAWER BASE */
        .sd-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 440px;
          max-width: 100%;
          background: #f7f7f7;
          color: #000;
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-left: 1px solid #111;
        }
        .sd-drawer.open {
          transform: translateX(0);
        }

        /* HEADER */
        .sd-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #111;
          font-family: Arial, sans-serif;
          font-size: 11px;
          text-transform: uppercase;
        }
        .sd-title {
          font-weight: 500;
        }
        .sd-close {
          background: none;
          border: none;
          color: #0000ee; /* Blue color matching Acne */
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        /* INPUT */
        .sd-input-sec {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #111;
          background: #fff;
        }
        .sd-search-icon {
          margin-right: 12px;
          color: #777;
        }
        .sd-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: Arial, sans-serif;
          font-size: 12px;
          text-transform: uppercase;
          color: #000;
          outline: none;
        }
        .sd-input::placeholder {
          color: #999;
        }

        /* SECTIONS */
        .sd-section {
          padding: 16px;
          border-bottom: 1px solid #111;
          background: #fff;
        }
        .sd-section-products {
          border-bottom: none;
          background: #f7f7f7;
          flex: 1;
        }
        .sd-section-title {
          font-family: Arial, sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 12px;
        }

        /* SUGGESTIONS LIST */
        .sd-suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sd-suggestion-link {
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #0000ee; /* acne studio blue link */
          text-decoration: none;
        }
        .sd-suggestion-link:hover {
          text-decoration: underline;
        }

        /* PRODUCTS GRID */
        .sd-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding-top: 10px;
        }
        .sd-product-card {
          aspect-ratio: 3/4;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .sd-product-card img {
          width: 80%;
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply; /* to remove white background if any */
        }
      `}</style>
    </>
  );
}
