"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

interface CollectionNav {
  handle: string;
  title: string;
  tags: string[];
}

export default function MenuDrawer() {
  const { isMenuOpen, closeMenu, menuSearchMode, clearMenuSearchMode } = useUI();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<CollectionNav[]>([]);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const rightPanelOpen = activeHandle !== null || searchOpen;

  const openSearchPanel = useCallback(() => {
    setActiveHandle(null);
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeRightPanel = useCallback(() => {
    setActiveHandle(null);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchTag = (term: string) => {
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Fetch collections + their product tags
  useEffect(() => {
    if (!isMenuOpen || collections.length > 0) return;
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
    if (!domain || !token) return;
    fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({
        query: `{
          collections(first: 20) {
            edges {
              node {
                handle
                title
                products(first: 30) {
                  edges { node { tags } }
                }
              }
            }
          }
        }`
      }),
    })
      .then(r => r.json())
      .then(d => {
        const cols: CollectionNav[] = (d.data?.collections?.edges ?? []).map((e: any) => {
          const allTags: string[] = [];
          (e.node.products?.edges ?? []).forEach((pe: any) => {
            (pe.node.tags ?? []).forEach((t: string) => {
              if (!allTags.includes(t)) allTags.push(t);
            });
          });
          return { handle: e.node.handle, title: e.node.title, tags: allTags };
        });
        setCollections(cols);
      })
      .catch(() => {});
  }, [isMenuOpen, collections.length]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) closeMenu();
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, closeMenu]);

  // Reset panels when closing
  useEffect(() => {
    if (!isMenuOpen) {
      setActiveHandle(null);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [isMenuOpen]);

  // Auto-open search panel when triggered from header
  useEffect(() => {
    if (isMenuOpen && menuSearchMode) {
      setActiveHandle(null);
      setSearchOpen(true);
      clearMenuSearchMode();
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isMenuOpen, menuSearchMode, clearMenuSearchMode]);

  const activeCol = collections.find(c => c.handle === activeHandle);

  return (
    <>
      <div className={`md-backdrop ${isMenuOpen ? "open" : ""}`} aria-hidden="true" />

      <div className={`md-drawer ${isMenuOpen ? "open" : ""} ${rightPanelOpen ? "md-expanded" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">

        {/* ── LEFT COLUMN (main nav) ── */}
        <div className={`md-col-left ${rightPanelOpen ? 'md-col-left-hidden-mobile' : ''}`}>
          {/* Top bar: search + close */}
          <div className="md-topbar">
            <button className="md-topbar-btn" onClick={openSearchPanel} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <button className="md-topbar-btn" onClick={closeMenu} aria-label="Close menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Collections */}
          <nav className="md-nav">
            {collections.map(c => (
              <button
                key={c.handle}
                className={`md-nav-item ${activeHandle === c.handle ? 'md-nav-active' : ''}`}
                onClick={() => { setSearchOpen(false); setActiveHandle(activeHandle === c.handle ? null : c.handle); }}
              >
                {c.title}
              </button>
            ))}
          </nav>

          {/* Bottom links */}
          <div className="md-bottom-links">
            <Link href="/stores" className="md-bottom-link" onClick={closeMenu}>Tiendas</Link>
            <Link href="/gift-cards" className="md-bottom-link" onClick={closeMenu}>Tarjetas regalo</Link>
          </div>

          <div className="md-locale">
            Spain | español
          </div>
        </div>

        {/* ── RIGHT COLUMN (tags or search) ── */}
        <div className={`md-col-right ${rightPanelOpen ? 'md-col-right-open' : ''}`}>
          {/* Search panel */}
          {searchOpen && (
            <>
              <button className="md-back-btn" onClick={closeRightPanel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h3 className="md-sub-title">Buscar</h3>
              <form className="md-search-form" onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="md-search-input"
                  placeholder="Buscar, trajes, abrigos, etc"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </form>
              <p className="md-search-popular-title">Lo más buscado</p>
              <nav className="md-sub-nav">
                {['hoodie', 'camiseta', 'pantalón'].map(term => (
                  <button key={term} className="md-sub-item md-search-tag" onClick={() => handleSearchTag(term)}>
                    {term}
                  </button>
                ))}
              </nav>
            </>
          )}
          {/* Collection tags panel */}
          {activeCol && !searchOpen && (
            <>
              <button className="md-back-btn" onClick={closeRightPanel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h3 className="md-sub-title">{activeCol.title}</h3>
              <nav className="md-sub-nav">
                {activeCol.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/collection/${activeCol.handle}?tag=${encodeURIComponent(tag)}`}
                    className="md-sub-item"
                    onClick={closeMenu}
                  >
                    {tag}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

      <style>{`
        .md-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1000;
        }
        .md-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .md-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          display: flex;
          flex-direction: row;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .md-drawer.open {
          transform: translateX(0);
        }

        /* ── Left column ── */
        .md-col-left {
          width: 300px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 1px solid #e5e5e5;
          scrollbar-width: none;
        }
        .md-col-left::-webkit-scrollbar { display: none; }

        .md-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e5e5;
        }
        .md-topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: #111 !important;
          transform: none !important;
          border-radius: 0 !important;
          padding: 4px !important;
        }

        .md-nav {
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          flex: 1;
        }
        .md-nav-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 28px;
          font-family: var(--font-primary);
          font-size: 17px;
          font-weight: 500;
          color: #111;
          background: none !important;
          border: none !important;
          cursor: pointer;
          text-decoration: none;
          line-height: 1.5;
          letter-spacing: 0 !important;
          border-radius: 0 !important;
          transform: none !important;
          transition: color 0.15s;
        }
        .md-nav-item:hover {
          opacity: 1 !important;
        }
        .md-nav-active {
          font-weight: 700;
        }
        .md-nav-item:not(.md-nav-active) {
          color: #111;
        }
        /* When a sub-panel is open, dim non-active items */
        .md-expanded .md-nav-item:not(.md-nav-active) {
          color: #999;
        }

        .md-bottom-links {
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          border-top: 1px solid #e5e5e5;
          margin-top: auto;
        }
        .md-bottom-link {
          display: block;
          padding: 8px 28px;
          font-family: var(--font-primary);
          font-size: 16px;
          font-weight: 400;
          color: #111;
          text-decoration: none;
        }
        .md-bottom-link:hover {
          opacity: 0.7 !important;
        }

        .md-locale {
          padding: 16px 28px 24px;
          font-family: var(--font-primary);
          font-size: 14px;
          color: #999;
        }

        /* ── Right column (tags) ── */
        .md-col-right {
          width: 0;
          overflow: hidden;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .md-col-right::-webkit-scrollbar { display: none; }
        .md-col-right-open {
          width: 280px;
          border-right: 1px solid #e5e5e5;
        }

        /* Search form */
        .md-search-form {
          padding: 0 28px 16px;
        }
        .md-search-input {
          width: 100%;
          padding: 12px 14px;
          font-family: var(--font-primary);
          font-size: 15px;
          color: #111;
          border: 1px solid #ccc;
          border-radius: 0;
          outline: none;
          background: #fff;
        }
        .md-search-input:focus {
          border-color: #111;
        }
        .md-search-input::placeholder {
          color: #999;
        }
        .md-search-popular-title {
          padding: 8px 28px;
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 500;
          color: #111;
          text-decoration: underline;
          text-underline-offset: 2px;
          margin: 0;
        }
        .md-search-tag {
          display: block;
          width: 100%;
          text-align: left;
          background: none !important;
          border: none !important;
          cursor: pointer;
          font-family: var(--font-primary);
          font-size: 16px;
          font-weight: 400;
          color: #0066cc;
          padding: 6px 28px;
          line-height: 1.5;
          letter-spacing: 0 !important;
          border-radius: 0 !important;
          transform: none !important;
        }
        .md-search-tag:hover {
          text-decoration: underline;
          opacity: 1 !important;
        }

        .md-sub-title {
          font-family: var(--font-primary);
          font-size: 17px;
          font-weight: 600;
          color: #111;
          padding: 24px 28px 16px;
          margin: 0;
        }
        .md-sub-nav {
          display: flex;
          flex-direction: column;
        }
        .md-sub-item {
          display: block;
          padding: 8px 28px;
          font-family: var(--font-primary);
          font-size: 16px;
          font-weight: 400;
          color: #111;
          text-decoration: none;
          line-height: 1.5;
        }
        .md-sub-item:hover {
          text-decoration: underline;
          opacity: 1 !important;
        }

        /* Back button — only visible on mobile */
        .md-back-btn {
          display: none;
          align-items: center;
          padding: 20px 28px 8px;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: #111 !important;
          transform: none !important;
          border-radius: 0 !important;
        }

        @media (max-width: 767px) {
          .md-backdrop {
            display: none;
          }
          .md-drawer {
            width: 100vw;
            overflow: hidden;
          }

          /* Left column — swipes out to the left */
          .md-col-left {
            width: 100vw;
            border-right: none;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(0);
            transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .md-col-left-hidden-mobile {
            transform: translateX(-100%);
            pointer-events: none;
          }

          /* Right column — swipes in from the right */
          .md-col-right {
            width: 100vw;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(100%);
            overflow-y: auto;
            border-right: none;
            transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
          }
          .md-col-right-open {
            transform: translateX(0);
            pointer-events: auto;
            border-right: none;
          }

          .md-back-btn {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
