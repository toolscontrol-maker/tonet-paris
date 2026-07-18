"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useLocale } from "@/context/LocaleContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProducts, searchProducts, getOptimizedImageUrl } from "@/lib/shopify";

const TRENDING_SEARCHES = [
  "vendetta new fragrance",
  "perfume",
  "sale"
];

const SEARCH_BY_PRODUCT = [
  "Bags",
  "Dresses",
  "Shoes",
  "Accessories"
];

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const { formatPrice } = useLocale();
  const { toggle: toggleWishlist, has: isInWishlist } = useWishlist();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allProductsCache, setAllProductsCache] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fallback recommended products for "También Te Sugerimos" / "New In"
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

  // Load cache & recent searches on mount/open
  useEffect(() => {
    if (!isSearchOpen) return;
    
    // Load recent searches from localStorage
    const saved = localStorage.getItem("tonet_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (_) {}
    }

    // Load products
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

    // Client-side quick filter
    const q = searchQuery.toLowerCase().trim();
    if (allProductsCache.length > 0) {
      const localMatches = allProductsCache.filter((p: any) =>
        (p.title?.toLowerCase().includes(q)) ||
        (p.description?.toLowerCase().includes(q)) ||
        (p.tags?.some((t: string) => t.toLowerCase().includes(q)))
      );
      setSearchResults(localMatches.slice(0, 16));
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      searchProducts(searchQuery.trim(), 16)
        .then((results) => {
          if (results && results.length > 0) {
            setSearchResults(results);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(delayDebounceFn);
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

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim().toLowerCase();
    if (!trimmed) return;
    const filtered = recentSearches.filter(t => t !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("tonet_recent_searches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveSearchTerm(searchQuery);
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleTermClick = (term: string) => {
    setSearchQuery(term);
    saveSearchTerm(term);
  };

  // Helper to convert Shopify product titles to Title Case
  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`sd-backdrop ${isSearchOpen ? "open" : ""}`} 
        onClick={closeSearch}
        aria-hidden="true" 
      />
      
      {/* Search Modal Overlay */}
      <div 
        className={`sd-overlay ${isSearchOpen ? "open" : ""}`} 
        role="dialog" 
        aria-modal="true"
      >
        <div className="sd-wrapper">
          {/* Header Row */}
          <header className="sd-header">
            <form className="sd-form" onSubmit={handleSearchSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="sd-input"
                placeholder="Search By Color, Mood Or Occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="sd-close-btn" onClick={closeSearch} aria-label="Close search">
              <X size={16} strokeWidth={1.2} />
            </button>
          </header>

          {/* Body Content */}
          <main className="sd-body">
            
            {/* STATE 1: Empty Search (Show suggestions/curated options) */}
            {!searchQuery.trim() && (
              <>
                <div className="sd-suggestions-columns">
                  
                  {/* Column 1: Popular searches */}
                  <div className="sd-suggest-col">
                    <h4 className="sd-col-title">Trending Searches</h4>
                    <ul className="sd-list">
                      {TRENDING_SEARCHES.map((term) => (
                        <li key={term}>
                          <button type="button" className="sd-list-btn" onClick={() => handleTermClick(term)}>
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Recent searches & Product searches */}
                  <div className="sd-suggest-col">
                    {recentSearches.length > 0 && (
                      <div style={{ marginBottom: '28px' }}>
                        <h4 className="sd-col-title">Recently Searched</h4>
                        <ul className="sd-list">
                          {recentSearches.map((term) => (
                            <li key={term}>
                              <button type="button" className="sd-list-btn" onClick={() => handleTermClick(term)}>
                                {term}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <h4 className="sd-col-title">Search by Product</h4>
                    <ul className="sd-list">
                      {SEARCH_BY_PRODUCT.map((term) => (
                        <li key={term}>
                          <button type="button" className="sd-list-btn" onClick={() => handleTermClick(term)}>
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Recommended Items — Desktop only inline, mobile goes to bottom */}
                  <div className="sd-suggest-col sd-suggest-col--preview sd-desktop-preview">
                    <h4 className="sd-col-title">We Also Suggest</h4>
                    <div className="sd-suggest-strip">
                      {suggestedProducts.map((p) => {
                        const image = p.imageUrl || p.images?.[0];
                        return (
                          <Link 
                            key={p.handle} 
                            href={`/product/${p.handle}`}
                            className="sd-mini-card"
                            onClick={closeSearch}
                          >
                            <div className="sd-mini-card-img-wrap">
                              {image && <img src={getOptimizedImageUrl(image, 180)} alt={p.title} />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Mobile-only: We Also Suggest pinned at the bottom */}
                <div className="sd-mobile-suggest-bottom">
                  <h4 className="sd-col-title">We Also Suggest</h4>
                  <div className="sd-suggest-strip">
                    {suggestedProducts.map((p) => {
                      const image = p.imageUrl || p.images?.[0];
                      return (
                        <Link 
                          key={p.handle} 
                          href={`/product/${p.handle}`}
                          className="sd-mini-card"
                          onClick={closeSearch}
                        >
                          <div className="sd-mini-card-img-wrap">
                            {image && <img src={getOptimizedImageUrl(image, 180)} alt={p.title} />}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STATE 2: Has Query but NO Matches */}
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <div className="sd-empty-results-container">
                <div className="sd-results-header">
                  <span className="sd-results-count-title">Search Results (0)</span>
                </div>

                <div className="sd-empty-box">
                  <h3 className="sd-empty-heading">No Matches Found For "{searchQuery}"</h3>
                  <p className="sd-empty-subheading">Please Try Another Search Or Contact Us.</p>
                </div>

                {/* Show fallback suggestions below */}
                <div className="sd-empty-suggestions-section">
                  <h4 className="sd-col-title uppercase" style={{ marginBottom: '20px' }}>New In</h4>
                  <div className="sd-product-grid">
                    {suggestedProducts.map((p) => {
                      const image = p.imageUrl || p.images?.[0];
                      const priceStr = formatPrice(p.price, p.currencyCode ?? 'EUR');
                      const favorited = isInWishlist(p.handle);
                      
                      return (
                        <div key={p.handle} className="sd-product-card">
                          <button 
                            className={`sd-fav-btn ${favorited ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); toggleWishlist(p); }}
                            aria-label="Add to wishlist"
                          >
                            <Heart size={14} fill={favorited ? "#000000" : "none"} strokeWidth={1.2} />
                          </button>
                          
                          <Link href={`/product/${p.handle}`} onClick={closeSearch} className="sd-card-link">
                            <div className="sd-card-img-wrap">
                              {image && <img src={getOptimizedImageUrl(image, 320)} alt={p.title} />}
                            </div>
                            <div className="sd-card-meta">
                              <span className="sd-card-name">{toTitleCase(p.title)}</span>
                              <span className="sd-card-price">{priceStr}</span>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STATE 3: Active Results Grid */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="sd-results-container">
                <header className="sd-results-header">
                  <span className="sd-results-count-title">
                    Search Results ({searchResults.length})
                    {isSearching && <span className="sd-pulse-dot">...</span>}
                  </span>
                  <button 
                    type="button" 
                    className="sd-results-filter-btn"
                    onClick={() => {
                      closeSearch();
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                  >
                    Filter
                  </button>
                </header>

                <div className="sd-product-grid">
                  {searchResults.map((p) => {
                    const image = p.imageUrl || p.images?.[0];
                    const priceStr = formatPrice(p.price, p.currencyCode ?? 'EUR');
                    const favorited = isInWishlist(p.handle);
                    
                    return (
                      <div key={p.handle} className="sd-product-card">
                        <button 
                          className={`sd-fav-btn ${favorited ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); toggleWishlist(p); }}
                          aria-label="Add to wishlist"
                        >
                          <Heart size={14} fill={favorited ? "#000000" : "none"} strokeWidth={1.2} />
                        </button>
                        
                        <Link href={`/product/${p.handle}`} onClick={closeSearch} className="sd-card-link">
                          <div className="sd-card-img-wrap">
                            {image && <img src={getOptimizedImageUrl(image, 320)} alt={p.title} />}
                          </div>
                          <div className="sd-card-meta">
                            <span className="sd-card-name">{toTitleCase(p.title)}</span>
                            <span className="sd-card-price">{priceStr}</span>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .sd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          opacity: 0;
          pointer-events: none;
          z-index: 10000;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sd-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ══ OVERLAY CONTAINER ══ */
        .sd-overlay {
          position: fixed;
          background: #ffffff; /* Pure White */
          color: #111111;
          z-index: 10001;
          box-sizing: border-box;
          font-family: var(--font-primary), sans-serif;
          opacity: 0;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          scrollbar-width: none;
          border-radius: 0 !important;
        }
        .sd-overlay::-webkit-scrollbar {
          display: none;
        }

        /* Responsive placement */
        @media (max-width: 767px) {
          /* Mobile: TRUE full-screen, no margins */
          .sd-overlay {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            max-height: 100vh;
            transform: translateY(10px);
          }
          .sd-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          /* Desktop full-width layout covering the upper page */
          .sd-overlay {
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-height: 90vh;
            transform: translateY(-20px);
            border-bottom: none;
          }
          .sd-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
        }

        /* ══ WRAPPER ══ */
        .sd-wrapper {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 24px 16px;
          height: 100%;
        }
        @media (min-width: 768px) {
          .sd-wrapper {
            padding: 40px 24px;
            height: auto;
          }
        }
        @media (min-width: 1024px) {
          .sd-wrapper {
            padding: 48px 40px;
          }
        }

        /* ══ BODY (flex fill) ══ */
        .sd-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        /* ══ HEADER ══ */
        .sd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          border-bottom: none;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .sd-header {
            margin-bottom: 32px;
            padding-bottom: 16px;
          }
        }
        .sd-form {
          flex: 1;
        }
        .sd-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #111111;
          padding: 0;
          box-sizing: border-box;
        }
        .sd-input::placeholder {
          color: #999999;
        }
        .sd-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #111111;
          padding: 6px;
          margin-left: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
        }
        .sd-close-btn:hover {
          opacity: 0.6;
        }

        /* ══ SUGGESTIONS COLUMNS (Desktop Symmetrical Layout) ══ */
        .sd-suggestions-columns {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .sd-suggestions-columns {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        @media (min-width: 1024px) {
          .sd-suggestions-columns {
            gap: 40px;
          }
        }
        /* Desktop preview col: hidden on mobile, visible on desktop */
        .sd-desktop-preview {
          display: none !important;
        }
        @media (min-width: 768px) {
          .sd-desktop-preview {
            display: flex !important;
            flex-direction: column;
          }
          /* Hide mobile strip on desktop */
          .sd-mobile-suggest-bottom {
            display: none !important;
          }
        }
        /* Mobile bottom strip: pinned to bottom via margin-top: auto */
        .sd-mobile-suggest-bottom {
          display: flex;
          flex-direction: column;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .sd-suggest-col {
          display: flex;
          flex-direction: column;
        }
        .sd-col-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 400;
          text-transform: capitalize;
          letter-spacing: 0.15em;
          color: #777777;
          margin: 0 0 16px 0;
        }
        .sd-col-title.uppercase {
          text-transform: capitalize;
        }
        
        /* Lists */
        .sd-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sd-list-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          text-transform: capitalize;
          color: #111111;
          padding: 0;
          text-align: left;
          transition: opacity 0.2s ease;
        }
        .sd-list-btn:hover {
          opacity: 0.6;
        }

        /* Column 3: Recommended Preview Strip */
        .sd-suggest-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 767px) {
          .sd-suggest-strip {
            gap: 6px;
          }
        }
        .sd-mini-card {
          display: block;
          text-decoration: none;
          background: #ffffff;
          border: none;
        }
        .sd-mini-card-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 8px;
          box-sizing: border-box;
          background: #f5f3f0;
        }
        .sd-mini-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* ══ RESULTS CONTAINER ══ */
        .sd-results-container,
        .sd-empty-results-container {
          width: 100%;
        }
        .sd-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sd-results-count-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 13.5px;
          color: #777777;
        }
        .sd-pulse-dot {
          display: inline;
          animation: sdPulse 1s infinite;
        }
        @keyframes sdPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .sd-results-filter-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: capitalize;
          color: #111111;
          padding: 4px 0;
          border-bottom: 1.5px solid #111111;
          transition: opacity 0.2s ease;
        }
        .sd-results-filter-btn:hover {
          opacity: 0.6;
        }

        /* ══ PRODUCT GRID ══ */
        .sd-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (min-width: 768px) {
          .sd-product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }
        @media (min-width: 1024px) {
          .sd-product-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1440px) {
          .sd-product-grid {
            gap: 20px;
          }
        }

        /* Product Card */
        .sd-product-card {
          background: #ffffff;
          position: relative;
          display: flex;
          flex-direction: column;
          border: none;
          box-sizing: border-box;
          border-radius: 0 !important;
        }
        .sd-product-card * {
          border-radius: 0 !important;
        }
        .sd-card-link {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #111111;
        }
        .sd-card-img-wrap {
          width: 100%;
          aspect-ratio: 16 / 19;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          overflow: hidden;
          padding: 12px;
          box-sizing: border-box;
          transition: opacity 0.3s ease;
        }
        .sd-product-card:hover .sd-card-img-wrap {
          opacity: 0.95;
        }
        .sd-card-img-wrap img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .sd-card-meta {
          padding: 12px 8px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }
        .sd-card-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #111111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .sd-card-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #777777;
        }

        /* Wishlist Heart Icon overlay */
        .sd-fav-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 5;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 0, 0, 0.4);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .sd-fav-btn:hover {
          color: #000000;
          transform: scale(1.05);
        }
        .sd-fav-btn.active {
          color: #000000;
        }

        /* ══ EMPTY BOX ══ */
        .sd-empty-box {
          padding: 64px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .sd-empty-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 400;
          color: #111111;
          margin-bottom: 8px;
        }
        .sd-empty-subheading {
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          color: #777777;
          letter-spacing: 0.02em;
        }
        .sd-empty-suggestions-section {
          border-top: none;
          padding-top: 32px;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
}
