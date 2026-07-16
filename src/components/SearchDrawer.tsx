"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useLocale } from "@/context/LocaleContext";
import { getProducts, searchProducts, getOptimizedImageUrl } from "@/lib/shopify";

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const { formatPrice } = useLocale();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProductsCache, setAllProductsCache] = useState<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fallback recommended products for "You Might Like"
  const fallbackSuggestions = [
    {
      handle: 'essential-heavyweight-shorts',
      title: 'essential heavyweight shorts',
      price: 320.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
    },
    {
      handle: 'heavyweight-raglan-zip-hoodie',
      title: 'heavyweight raglan zip hoodie',
      price: 790.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00028_.png'
    },
    {
      handle: 'unisex-sunfade-waffle-boxy-tee',
      title: 'unisex sunfade waffle boxy tee',
      price: 350.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00020_.png'
    },
    {
      handle: 'core-cargo-pants',
      title: 'core cargo pants',
      price: 650.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
    }
  ];

  // Fetch shopify products for suggestions
  useEffect(() => {
    if (!isSearchOpen) return;
    getProducts()
      .then((prods) => {
        if (prods && prods.length > 0) {
          setSuggestedProducts(prods.slice(0, 4));
          setAllProductsCache(prods);
        } else {
          setSuggestedProducts(fallbackSuggestions);
        }
      })
      .catch(() => {
        setSuggestedProducts(fallbackSuggestions);
      });
  }, [isSearchOpen]);

  // Real-time search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Instant client-side filter from cache for responsiveness
    const q = searchQuery.toLowerCase().trim();
    if (allProductsCache.length > 0) {
      const localMatches = allProductsCache.filter((p: any) =>
        (p.title?.toLowerCase().includes(q)) ||
        (p.description?.toLowerCase().includes(q)) ||
        (p.tags?.some((t: string) => t.toLowerCase().includes(q)))
      );
      if (localMatches.length > 0) {
        setSearchResults(localMatches.slice(0, 8));
      }
    }

    setIsSearching(true);

    // Debounced API search for accurate results
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchProducts(searchQuery.trim(), 8)
        .then((results) => {
          if (results && results.length > 0) {
            setSearchResults(results);
          }
          // If API returns empty but local had results, keep local results
        })
        .catch(() => {
          // Keep local results on error
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, allProductsCache]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        isSearchOpen
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSearchOpen, closeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePopularSearch = (term: string) => {
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      {/* DRAWER BACKDROP */}
      <div 
        className={`sd-backdrop ${isSearchOpen ? "open" : ""}`} 
        onClick={closeSearch}
        aria-hidden="true" 
      />
      
      {/* SIDE PANEL OVERLAY */}
      <div 
        className={`sd-overlay ${isSearchOpen ? "open" : ""}`} 
        ref={drawerRef} 
        role="dialog" 
        aria-modal="true"
      >
        <div className="sd-container">
          
          {/* Top Row with Rectangular Input and Close Button */}
          <div className="sd-input-row">
            <form className="sd-search-form" onSubmit={handleSearchSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="sd-search-input"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="sd-close-btn" onClick={closeSearch} aria-label="Close search">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L10 10M10 1L1 10" stroke="black" strokeWidth="1" strokeLinecap="square"/>
              </svg>
            </button>
          </div>

          {/* Search Content Stack */}
          <div className="sd-content-stack">
            
            {/* Popular Searches */}
            <div className="sd-section-popular">
              <h4 className="sd-section-title">Popular Searches</h4>
              <ul className="sd-popular-list">
                <li>
                  <button type="button" onClick={() => handlePopularSearch("shorts")}>
                    shorts
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handlePopularSearch("hoodie")}>
                    hoodie
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handlePopularSearch("tee")}>
                    tee
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handlePopularSearch("pants")}>
                    pants
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handlePopularSearch("fleece")}>
                    fleece
                  </button>
                </li>
              </ul>
            </div>

            {/* You Might Like / Search Results */}
            <div className="sd-section-suggestions">
              <h4 className="sd-section-title">
                {searchQuery.trim() ? (
                  <>
                    Search Results
                    {isSearching && <span className="sd-searching-dot">...</span>}
                  </>
                ) : 'You Might Like'}
              </h4>
              {searchQuery.trim() && searchResults.length === 0 && !isSearching ? (
                <p className="sd-no-results">No products found</p>
              ) : (
                <div className="sd-suggestions-grid">
                  {(searchQuery.trim() ? searchResults : suggestedProducts).map((p) => {
                    const image = p.imageUrl || p.images?.[0];
                    const priceStr = formatPrice(p.price, p.currencyCode ?? 'EUR');
                    return (
                      <Link
                        href={`/product/${p.handle}`}
                        key={p.handle + p.id}
                        className="sd-suggested-item"
                        onClick={closeSearch}
                      >
                        <div className="sd-suggested-img-wrap">
                          {image && (
                            <img 
                              src={getOptimizedImageUrl(image, 250)} 
                              alt={p.title} 
                              className="sd-suggested-img" 
                            />
                          )}
                        </div>
                        <div className="sd-suggested-info">
                          <span className="sd-suggested-name">{p.title}</span>
                          <span className="sd-suggested-price">{priceStr}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Floating Monogram Bottom Right */}
        <div className="sd-monogram-badge">
          <span>T</span>
        </div>
      </div>

      <style>{`
         /* BACKDROP */
        .sd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.05);
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sd-backdrop.open {
          opacity: 1;
          pointer-events: all;
        }

        /* OVERLAY CONTAINER (SIDE PANEL SLIDING FROM RIGHT) */
        .sd-overlay {
          position: fixed;
          top: 0; 
          right: 0; 
          bottom: 0;
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          color: #000000;
          z-index: 10001;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: none;
          font-family: var(--font-primary), sans-serif;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .sd-overlay.open {
          transform: translateX(0);
        }

        .sd-container {
          padding: 20px 24px 60px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          min-height: 100%;
        }

        /* INPUT ROW */
        .sd-input-row {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 24px;
        }
        .sd-search-form {
          flex: 1;
          margin: 0;
        }
        .sd-search-input {
          width: 100%;
          height: 36px;
          border: 1px solid #000000;
          border-radius: 0;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.15em;
          padding: 0 12px;
          text-transform: uppercase;
          color: #000000;
          box-sizing: border-box;
        }
        .sd-search-input::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }
        .sd-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #000000;
          padding: 8px;
          margin-left: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        .sd-close-btn:hover {
          opacity: 0.6;
        }

        /* CONTENT STACK */
        .sd-content-stack {
          display: flex;
          flex-direction: column;
        }

        .sd-section-title {
          font-size: 9px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0 0 12px;
          display: block;
        }

        /* POPULAR SEARCHES */
        .sd-section-popular {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .sd-popular-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .sd-popular-list li {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .sd-popular-list li:last-child {
          border-bottom: none;
        }
        .sd-popular-list button {
          width: 100%;
          background: none;
          border: none;
          padding: 10px 0;
          text-align: left;
          font-family: inherit;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000000;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .sd-popular-list button:hover {
          opacity: 0.6;
        }

        /* YOU MIGHT LIKE SUGGESTIONS GRID */
        .sd-section-suggestions {
          margin-bottom: 40px;
          overflow: hidden;
        }
        .sd-no-results {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.45);
          margin: 20px 0;
        }
        .sd-searching-dot {
          display: inline;
          animation: sd-pulse 1s infinite;
        }
        @keyframes sd-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .sd-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 8px;
          overflow: hidden;
        }
        .sd-suggested-item {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #000000;
          transition: opacity 0.2s ease;
        }
        .sd-suggested-item:hover {
          opacity: 0.7;
        }

        .sd-suggested-img-wrap {
          width: 100%;
          aspect-ratio: 16 / 19;
          background-color: #f4f3f1;
          margin-bottom: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 8px;
          box-sizing: border-box;
          border-radius: 0;
        }
        .sd-suggested-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          mix-blend-mode: multiply;
        }
        .sd-suggested-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          margin-top: 2px;
        }
        .sd-suggested-name {
          font-size: 7.5px;
          font-weight: 300;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.2;
          color: #000000;
        }
        .sd-suggested-price {
          font-size: 7px;
          font-weight: 300;
          color: #777777;
          letter-spacing: 0.04em;
        }

        /* FLOATING MONOGRAM BADGE */
        .sd-monogram-badge {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: #ffffff;
          font-family: var(--font-brand);
          font-size: 18px;
          z-index: 10;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .sd-monogram-badge:hover {
          transform: scale(1.05);
        }

        /* MOBILE RESPONSIVE Adjustments */
        @media (max-width: 767px) {
          .sd-overlay {
            max-width: 100%;
            border-left: none;
          }
          .sd-container {
            padding: 20px 16px 60px;
          }
          .sd-suggestions-grid {
            gap: 12px 8px;
          }
          .sd-monogram-badge {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}
