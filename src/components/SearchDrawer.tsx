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

const getProductImageClass = (title: string, tags?: string[]) => {
  const t = title.toLowerCase();
  const tg = (tags || []).map(x => x.toLowerCase());
  const isSneaker = t.includes('sneaker') || t.includes('shoe') || tg.includes('sneakers') || tg.includes('shoes');
  const isPants = t.includes('pants') || t.includes('jeans') || t.includes('trousers') || tg.includes('pants') || tg.includes('jeans');
  const isAccessory = t.includes('bag') || t.includes('accessory') || t.includes('sunglasses') || tg.includes('accessories');
  if (isSneaker) return 'amiri-product-img--sneaker';
  if (isPants) return 'amiri-product-img--pants';
  if (isAccessory) return 'amiri-product-img--accessory';
  return 'amiri-product-img--top'; // Default
};

function SearchProductCard({ 
  product, 
  formatPrice,
  closeSearch
}: { 
  product: any; 
  formatPrice: (price: number, currency: string) => string; 
  closeSearch: () => void;
}) {
  const { language } = useLocale();
  const [activeIdx, setActiveIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const images: string[] = product.images && product.images.length > 0 ? product.images : ([product.imageUrl].filter(Boolean) as string[]);

  const { toggle, has } = useWishlist();
  const isFavorite = has(product.handle);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      handle: product.handle,
      title: product.title,
      imageUrl: product.imageUrl || '',
      price: product.price,
      currencyCode: product.currencyCode || 'EUR',
      collectionTitle: ''
    });
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeIdx) {
          setActiveIdx(index);
        }
      }
    }
  };

  const imageClass = getProductImageClass(product.title, product.tags);

  return (
    <div className="amiri-grid-item amiri-grid-item--product">
      {/* Swipeable Image Gallery */}
      <div className="v-product-gallery-container">
        {/* Wishlist/Favorites Star Button */}
        <button 
          type="button"
          className={`v-wishlist-btn ${isFavorite ? 'favorite' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </button>

        <div 
          ref={carouselRef}
          className="v-product-carousel"
          onScroll={handleScroll}
        >
          {images.map((imgUrl: string, i: number) => (
            <Link 
              key={i} 
              href={`/product/${product.handle}`} 
              className="v-product-carousel-slide"
              draggable={false}
              onClick={closeSearch}
            >
              <img
                src={getOptimizedImageUrl(imgUrl, 800)}
                alt={`${product.title} - Vista ${i + 1}`}
                className={`amiri-product-img ${imageClass}`}
                loading="lazy"
                draggable={false}
              />
            </Link>
          ))}
        </div>

        {/* Counter of images */}
        {images.length > 1 && (
          <span className="v-product-carousel-counter">
            {activeIdx + 1}/{images.length}
          </span>
        )}

        {/* Horizontal Progress Indicator Bar sticky inside the image block */}
        {images.length > 1 && (
          <div className="v-product-carousel-indicator-bar">
            <div 
              className="v-product-carousel-indicator-progress"
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${activeIdx * 100}%)`
              }}
            />
          </div>
        )}
      </div>

      <div className="amiri-product-info">
        <Link href={`/product/${product.handle}`} className="amiri-product-info-left" onClick={closeSearch}>
          <span className="amiri-product-name">{product.title}</span>
          <span className="amiri-product-price">
            {formatPrice(product.price, product.currencyCode || 'EUR')}
          </span>
        </Link>
        <Link href={`/product/${product.handle}`} className="amiri-product-buy-btn" onClick={closeSearch}>
          {language === 'es' ? 'Comprar' : 'Buy'}
        </Link>
      </div>
    </div>
  );
}

export default function SearchDrawer() {
  const { isSearchOpen, closeSearch } = useUI();
  const { formatPrice, language } = useLocale();
  const { toggle: toggleWishlist, has: isInWishlist } = useWishlist();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allProductsCache, setAllProductsCache] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);

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
      document.body.classList.add("search-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("search-open");
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setHasExpanded(false);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("search-open");
      setHasExpanded(false);
    };
  }, [isSearchOpen]);

  // Set hasExpanded to true when search results are populated
  useEffect(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setHasExpanded(true);
    }
  }, [searchQuery, searchResults]);

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
        className={`sd-overlay ${isSearchOpen ? "open" : ""} ${hasExpanded ? "expanded" : ""}`} 
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
                    <h4 className="sd-col-title">{language === 'es' ? 'Búsquedas Populares' : 'Trending Searches'}</h4>
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
                        <h4 className="sd-col-title">{language === 'es' ? 'Búsquedas Recientes' : 'Recently Searched'}</h4>
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

                    <h4 className="sd-col-title">{language === 'es' ? 'Buscar por Categoría' : 'Search by Product'}</h4>
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
                    <div className="sd-suggest-inner-wrap">
                      <h4 className="sd-col-title">{language === 'es' ? 'También te Recomendamos' : 'We Also Suggest'}</h4>
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

                </div>

                {/* Mobile-only: We Also Suggest pinned at the bottom */}
                <div className="sd-mobile-suggest-bottom">
                  <h4 className="sd-col-title">{language === 'es' ? 'También te Recomendamos' : 'We Also Suggest'}</h4>
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
                  <span className="sd-results-count-title">{language === 'es' ? 'Resultados de la búsqueda (0)' : 'Search Results (0)'}</span>
                </div>

                <div className="sd-empty-box">
                  <h3 className="sd-empty-heading">
                    {language === 'es' ? `No se encontraron coincidencias para "${searchQuery}"` : `No Matches Found For "${searchQuery}"`}
                  </h3>
                  <p className="sd-empty-subheading">
                    {language === 'es' ? 'Intente realizar otra búsqueda o póngase en contacto con nosotros.' : 'Please Try Another Search Or Contact Us.'}
                  </p>
                </div>

                {/* Show fallback suggestions below */}
                <div className="sd-empty-suggestions-section">
                  <h4 className="sd-col-title uppercase" style={{ marginBottom: '20px' }}>
                    {language === 'es' ? 'Novedades' : 'New In'}
                  </h4>
                  <div className="sd-product-grid">
                    {suggestedProducts.map((p) => (
                      <SearchProductCard 
                        key={p.handle} 
                        product={p} 
                        formatPrice={formatPrice} 
                        closeSearch={closeSearch} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STATE 3: Active Results Grid */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="sd-results-container">
                <header className="sd-results-header">
                  <span className="sd-results-count-title">
                    {language === 'es' ? 'Resultados de la búsqueda' : 'Search Results'} ({searchResults.length})
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
                    {language === 'es' ? 'Filtrar' : 'Filter'}
                  </button>
                </header>

                <div className="sd-product-grid">
                  {searchResults.map((p) => (
                    <SearchProductCard 
                      key={p.handle} 
                      product={p} 
                      formatPrice={formatPrice} 
                      closeSearch={closeSearch} 
                    />
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      <style>{`
        /* ══ WEB BLUR EFFECT WHEN SEARCH OPEN ══ */
        body > main,
        .acne-header,
        footer {
          transition: filter 0.4s ease;
        }
        body.search-open > main,
        body.search-open .acne-header,
        body.search-open footer {
          filter: blur(8px);
        }

        /* ══ BACKDROP ══ */
        .sd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
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
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                      opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                      height 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                      max-height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          scrollbar-width: none;
          border-radius: 0 !important;
          top: 0;
          left: 0;
          right: 0;
          bottom: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        .sd-overlay::-webkit-scrollbar {
          display: none;
        }

        /* Responsive placement */
        @media (max-width: 767px) {
          /* Mobile: top overlay covering 60% height with a 2D dice/tilt roll */
          .sd-overlay {
            width: 100%;
            max-width: 100%;
            height: 60vh;
            max-height: 60vh;
            transform: translateY(-100%) rotate(-4deg);
          }
          .sd-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) rotate(0deg);
          }
          .sd-overlay.open.expanded {
            height: 100vh;
            max-height: 100vh;
          }
        }
        @media (min-width: 768px) {
          /* Desktop: top overlay covering 60% height with a 2D dice/tilt roll */
          .sd-overlay {
            width: 100%;
            height: 60vh;
            max-height: 60vh;
            transform: translateY(-100%) rotate(-2deg);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }
          .sd-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) rotate(0deg);
          }
          .sd-overlay.open.expanded {
            height: 100vh;
            max-height: 100vh;
          }
        }

        /* ══ WRAPPER ══ */
        .sd-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 12px 16px 24px 16px;
          height: 100%;
        }
        @media (min-width: 768px) {
          .sd-wrapper {
            padding: 20px 24px 40px 24px;
            height: auto;
          }
        }
        @media (min-width: 1024px) {
          .sd-wrapper {
            padding: 24px 40px 48px 40px;
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
          .sd-suggest-inner-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            width: 100%;
            max-width: 380px;
            margin-left: auto;
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
          gap: 1px;
          background-color: #ffffff;
          max-width: 380px;
          width: 100%;
        }
        @media (max-width: 767px) {
          .sd-suggest-strip {
            gap: 1px;
          }
        }
        .sd-mini-card {
          display: block;
          text-decoration: none;
          background: #f7f8fa;
          border: none;
        }
        .sd-mini-card-img-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 8px;
          box-sizing: border-box;
          background: #f7f8fa;
        }
        .sd-mini-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
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
          gap: 1px;
          background-color: #ffffff;
          margin-top: 16px;
          margin-left: -16px;
          margin-right: -16px;
        }
        @media (min-width: 768px) {
          .sd-product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1px;
            margin-left: -24px;
            margin-right: -24px;
          }
        }
        @media (min-width: 1024px) {
          .sd-product-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            margin-left: -40px;
            margin-right: -40px;
          }
        }

        .amiri-grid-item {
          background: #f7f8fa;
          position: relative;
          display: flex;
          flex-direction: column;
          border: none;
          box-sizing: border-box;
          height: 100%;
        }
        .amiri-grid-item * {
          border-radius: 0 !important;
        }

        /* Swiper / Carousel styles */
        .v-product-gallery-container {
          width: 100%;
          aspect-ratio: 3 / 4;
          position: relative;
          overflow: hidden;
          background-color: #f7f8fa;
          flex-shrink: 0;
        }
        @media (max-width: 767px) {
          .v-product-gallery-container {
            flex: none;
            height: auto;
            aspect-ratio: 3 / 4;
          }
          .amiri-grid-item {
            background: #ffffff !important;
          }
        }

        .v-product-link-overlay {
          position: absolute;
          inset: 0;
          z-index: 4;
        }

        .v-product-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
          height: 100%;
        }
        .v-product-carousel::-webkit-scrollbar {
          display: none;
        }

        .v-product-carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px;
          box-sizing: border-box;
          background-color: #f7f8fa;
        }
        .v-product-carousel-slide:hover {
          background-color: #f7f8fa;
          opacity: 1;
        }

        .v-product-carousel-counter {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.4);
          background-color: transparent;
          letter-spacing: 0.05em;
          z-index: 5;
        }

        .v-product-carousel-indicator-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: rgba(0, 0, 0, 0.08);
          z-index: 6;
          overflow: hidden;
        }

        .v-product-carousel-indicator-progress {
          height: 100%;
          background-color: #000000;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .amiri-product-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .amiri-product-img--top,
        .amiri-product-img--pants,
        .amiri-product-img--sneaker,
        .amiri-product-img--accessory {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .amiri-product-info {
          padding: 20px 24px 20px 40px;
          background-color: #f7f8fa;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          box-sizing: border-box;
          z-index: 5;
          width: 100%;
          text-decoration: none;
        }
        .amiri-product-info:hover {
          opacity: 1;
        }

        .amiri-product-info-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          flex: 1;
          text-decoration: none;
          color: inherit;
        }

        .amiri-product-buy-btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: var(--w-medium);
          letter-spacing: 0.05em;
          text-transform: capitalize;
          text-decoration: underline;
          text-underline-offset: 3px;
          color: #111111;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .amiri-product-buy-btn:hover {
          opacity: 0.7;
        }

        @media (max-width: 767px) {
          .amiri-product-info {
            background-color: #ffffff;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
            gap: 8px;
            padding: 12px 16px;
            flex-grow: 1;
          }
          .amiri-product-info-left {
            gap: 2px;
          }
          .amiri-product-buy-btn {
            font-size: 10px;
          }
        }

        .amiri-product-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 300;
          text-transform: lowercase;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 767px) {
          .amiri-product-name {
            font-size: 11px;
            white-space: normal;
            line-height: 1.35;
          }
        }

        .amiri-product-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: right;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .amiri-product-price {
            text-align: left;
            color: rgba(0,0,0,0.65);
          }
        }

        /* WISHLIST STAR BUTTON */
        .v-wishlist-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          z-index: 10;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.25s ease, transform 0.2s ease;
          outline: none;
        }

        .v-wishlist-btn:hover {
          transform: scale(1.1);
        }

        @media (max-width: 767px) {
          .v-wishlist-btn {
            top: 10px;
            right: 10px;
            padding: 4px;
          }
          .v-wishlist-btn svg {
            width: 12px;
            height: 12px;
          }
        }

        @media (min-width: 1024px) {
          .v-wishlist-btn {
            opacity: 0;
            pointer-events: none;
          }
          .amiri-grid-item:hover .v-wishlist-btn {
            opacity: 1;
            pointer-events: all;
          }
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
