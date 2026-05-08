"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { openCart, openMenuWithSearch, openMenu } = useUI();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  const accountHref = user ? '/account' : '/login';
  const accountLabel = user ? user.firstName : t('nav.account');

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product/");
  const isCollection = pathname.startsWith("/collection/");
  const hasSubnav = isProduct || isCollection;

  const [collections, setCollections] = useState<{handle: string; title: string}[]>([]);
  useEffect(() => {
    if (!hasSubnav) return;
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
    if (!domain || !token) return;
    fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query: '{ collections(first: 10) { edges { node { handle title } } } }' }),
    })
      .then(r => r.json())
      .then(d => setCollections(d.data?.collections?.edges?.map((e: any) => ({ handle: e.node.handle, title: e.node.title })) ?? []))
      .catch(() => {});
  }, [hasSubnav]);

  const currentCollectionHandle = isCollection ? pathname.split('/collection/')[1]?.split('/')[0] : '';
  const [subnavOpen, setSubnavOpen] = useState(false);
  const currentCollection = collections.find(c => c.handle === currentCollectionHandle);

  // Pages with fullbleed gallery (transparent header overlay)
  const isFullbleed = isProduct || isCollection;

  // Smart header: hide on scroll down, show solid on scroll up
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolledPast, setScrolledPast] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Track if scrolled past the first viewport (video hero)
  const [pastVideo, setPastVideo] = useState(false);
  const [overDark, setOverDark] = useState(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      // Past the header height threshold
      setScrolledPast(y > 80);
      // Past the video hero section (~one viewport)
      setPastVideo(y > window.innerHeight * 0.5);
      if (window.location.pathname === '/') {
        // Home: always show header, never hide
        setHeaderVisible(true);
      } else if (delta > 4 && y > 80) {
        // Scrolling down — hide
        setHeaderVisible(false);
      } else if (delta < -4) {
        // Scrolling up — show
        setHeaderVisible(true);
      }

      // Check for dark sections
      const header = document.querySelector('.acne-header');
      let isDark = false;
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const darkSections = document.querySelectorAll('.dark-section');
        for (let i = 0; i < darkSections.length; i++) {
          const rect = darkSections[i].getBoundingClientRect();
          if (rect.top <= headerRect.bottom && rect.bottom >= headerRect.top) {
            isDark = true;
            break;
          }
        }
      }
      setOverDark(isDark);

      lastScrollY.current = y;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Body padding
  useEffect(() => {
    const body = document.body;
    if (isFullbleed || isHome) {
      body.style.paddingTop = "0px";
    } else {
      body.style.paddingTop = "48px";
    }
    return () => { body.style.paddingTop = "48px"; };
  }, [isFullbleed, isHome]);

  // Determine header style class
  // Home: always transparent. Other pages: solid when scrolled up past threshold.
  const solid = !isHome && scrolledPast && headerVisible;

  return (
    <>
      <header className={`acne-header ${solid ? "solid" : "transparent"} ${isHome && !pastVideo ? "home-top" : ""} ${isHome && pastVideo ? "home-dark" : ""} ${!headerVisible ? "header-hidden" : ""} ${overDark ? "over-dark" : ""}`}>
        <div className="acne-header-inner">
          {/* LEFT: Hamburger + Search */}
          <div className="acne-nav-left">
            <button className="acne-mob-icon" aria-label="Menu" onClick={openMenu}>
              <svg width="14" height="10" viewBox="0 0 20 14" fill="none">
                <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </button>
            <button className="acne-mob-icon" aria-label="Search" onClick={openMenuWithSearch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <Link href="/" className="acne-logo">
            <span className="acne-logo-text">TONET PARIS<sup>®</sup></span>
          </Link>

          {/* RIGHT: 3 icon buttons — Account, Wishlist, Cart */}
          <div className="acne-nav-right">
            <Link href={accountHref} className="acne-right-icon" aria-label="Account">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>

            <button className="acne-right-icon" onClick={openCart} aria-label="Open bag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── SECONDARY STICKY NAV – hidden when transparent header is active ── */}
        {false && isCollection && (
          <div className="acne-subnav">
            <div className="acne-subnav-inner">
              <Link href="/" className="back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>{t('nav.gallery')}</span>
              </Link>
              <div className="subnav-right">
                {currentCollection && (
                  <span className="subnav-current">{currentCollection?.title}</span>
                )}
                <button className="subnav-toggle" onClick={() => setSubnavOpen(!subnavOpen)} aria-label="All collections">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={subnavOpen ? "M1 7L5 3L9 7" : "M1 3L5 7L9 3"} />
                  </svg>
                </button>
              </div>
              {subnavOpen && (
                <div className="subnav-dropdown">
                  {collections.map(c => (
                    <Link
                      key={c.handle}
                      href={`/collection/${c.handle}`}
                      className={`subnav-drop-item${currentCollectionHandle === c.handle ? ' active' : ''}`}
                      onClick={() => setSubnavOpen(false)}
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        .acne-header {
          position: fixed;
          top: 22px;
          left: 0; right: 0;
          z-index: 500;
          transition: transform 0.3s ease, background-color 0.25s ease, border-bottom-color 0.25s ease;
        }
        .acne-header.header-hidden {
          transform: translateY(-100%);
        }
        .acne-header.transparent {
          background: transparent;
          border-bottom: none;
        }
        /* Fullbleed pages (collection/product): white icons/text on transparent */
        .acne-header.transparent .acne-nav-links a,
        .acne-header.transparent .acne-mob-icon,
        .acne-header.transparent .acne-right-icon,
        .acne-header.transparent .acne-logo-text {
          color: #000;
        }
        .acne-header.transparent .acne-icon-sep {
          background: #ededed;
        }
        .acne-header.transparent svg {
          stroke: #000;
        }

        /* Home page at top: transparent with WHITE icons/text (over video) */
        .acne-header.home-top .acne-nav-links a,
        .acne-header.home-top .acne-mob-icon,
        .acne-header.home-top .acne-right-icon,
        .acne-header.home-top .acne-logo-text {
          color: #fff;
        }
        .acne-header.home-top .acne-icon-sep {
          background: rgba(255,255,255,0.3);
        }
        .acne-header.home-top svg {
          stroke: #fff;
        }

        /* Home page past video: transparent with BLACK icons/text */
        .acne-header.home-dark .acne-nav-links a,
        .acne-header.home-dark .acne-mob-icon,
        .acne-header.home-dark .acne-right-icon,
        .acne-header.home-dark .acne-logo-text {
          color: #000;
        }
        .acne-header.home-dark .acne-icon-sep {
          background: #ededed;
        }
        .acne-header.home-dark svg {
          stroke: #000;
        }

        /* Over dark section: force white text/icons */
        .acne-header.over-dark .acne-nav-links a,
        .acne-header.over-dark .acne-mob-icon,
        .acne-header.over-dark .acne-right-icon,
        .acne-header.over-dark .acne-logo-text {
          color: #fff !important;
        }
        .acne-header.over-dark .acne-icon-sep {
          background: rgba(255,255,255,0.3) !important;
        }
        .acne-header.over-dark svg {
          stroke: #fff !important;
        }

        .acne-header.solid {
          background: #ffffff;
          border-bottom: 1px solid #ededed;
        }

        .acne-header-inner {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          height: 60px;
          padding: 0 20px;
          position: relative;
        }

        .acne-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          text-decoration: none;
          display: flex;
          align-items: baseline;
          gap: 8px;
          color: #000;
          white-space: nowrap;
          line-height: 1;
        }
        .acne-logo-star {
          font-size: 34px;
          line-height: 1;
          color: #000;
        }
        .acne-logo-text {
          font-family: var(--font-brand);
          font-size: 37.5px;
          font-weight: normal;
          letter-spacing: 0.01em;
          color: #000;
          line-height: 60px;
        }
        .acne-logo-text sup {
          font-size: 9px;
          vertical-align: super;
          letter-spacing: 0.04em;
        }

        .acne-nav-left { display: flex; align-items: stretch; flex: 1; }
        .acne-nav-links { display: flex; align-items: center; gap: 28px; }
        .acne-nav-links a {
          font-size: 11px;
          font-family: var(--font-primary);
          font-weight: 500;
          text-transform: uppercase;
          text-decoration: none;
          color: #000;
          letter-spacing: 0.10em;
          line-height: 1.2;
        }

        .acne-nav-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .acne-right-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: none; border: none; border-radius: 0;
          cursor: pointer; color: #000;
          text-decoration: none;
          padding: 0;
          transition: opacity 0.15s;
        }
        .acne-right-icon:hover { opacity: 0.6; }

        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 48px;
          background: none; border: none; border-radius: 0;
          cursor: pointer; color: #000; padding: 0;
        }
        .acne-mobile-left { display: flex; align-items: center; gap: 0; }

        /* ── SUBNAV ── */
        .acne-subnav {
          height: 40px;
          background: #ffffff;
          border-top: 1px solid #ededed;
          border-bottom: 1px solid #ededed;
          display: flex;
          align-items: center;
        }
        .acne-subnav-inner {
          max-width: 100%;
          width: 100%;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000;
        }
        .subnav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .subnav-current {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000;
        }
        .subnav-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #000;
        }
        .subnav-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: #ffffff;
          border: 1px solid #ededed;
          border-top: none;
          display: flex;
          flex-direction: column;
          min-width: 200px;
          z-index: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .subnav-drop-item {
          padding: 12px 20px;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #768194;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.12s, color 0.12s;
        }
        .subnav-drop-item:last-child { border-bottom: none; }
        .subnav-drop-item:hover { background: #f8f8f8; color: #000; }
        .subnav-drop-item.active { color: #000; font-weight: 500; }

        .desktop-only { display: flex !important; }
        .mobile-only  { display: none !important; }

        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
          .acne-header-inner {
            padding: 0 4px;
            height: 48px;
          }
          .acne-logo {
            gap: 0;
            max-width: calc(100vw - 144px);
            overflow: visible;
          }
          .acne-logo-text {
            font-size: 32px;
            letter-spacing: 0.01em;
            white-space: nowrap;
            line-height: 48px;
          }
          .acne-mob-icon {
            width: 28px;
          }
          .acne-mob-icon svg {
            width: 18px;
            height: auto;
          }
          .acne-nav-right {
            gap: 0;
          }
          .acne-right-icon {
            width: 28px;
            height: 48px;
          }
          .acne-right-icon svg {
            width: 18px;
            height: 18px;
          }
          .acne-subnav-inner { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
