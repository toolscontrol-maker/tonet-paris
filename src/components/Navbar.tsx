"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";
import { useWishlist } from "@/context/WishlistContext";

// Logo font: Saint Carell is used exclusively

const thumbnails = [
  { label: "All Products", href: "/collection", img: "/hero/ComfyUI-main_reference_00012_.png" },
  { label: "Women's Ready-to-wear", href: "/collection/women", img: "/hero/ComfyUI-main_reference_00016_.png" },
  { label: "Men's Ready-to-wear", href: "/collection/men", img: "/hero/ComfyUI-main_reference_00020_.png" },
  { label: "Women's Accessories", href: "/collection/women", img: "/hero/ComfyUI-main_reference_00018_.png" },
  { label: "Men's Accessories", href: "/collection/men", img: "/hero/ComfyUI-main_reference_00021_.png" },
  { label: "Sneakers", href: "/collection/mens-new-arrivals", img: "/hero/ComfyUI-main_reference_00022_.png" },
  { label: "Children", href: "/collection", img: "/hero/ComfyUI-main_reference_00023_.png" }
];

export default function Navbar() {
  const { 
    openCart, 
    openSearch, 
    openMenu, 
    closeMenu, 
    isSearchOpen, 
    openAccount,
    isMenuOpen,
    menuLevel,
    setMenuLevel,
    menuActiveItemL1,
    setMenuActiveItemL1,
    menuActiveItemL2,
    setMenuActiveItemL2
  } = useUI();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const [activeMegaMenu, setActiveMegaMenu] = useState<'private-sale' | 'women' | 'men' | 'children' | 'curb' | 'maison' | null>(null);

  // Close mega menu on scroll
  useEffect(() => {
    const handleScrollClose = () => {
      setActiveMegaMenu(null);
    };
    window.addEventListener('scroll', handleScrollClose, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollClose);
  }, []);

  // Close mega menu on path change
  useEffect(() => {
    setActiveMegaMenu(null);
  }, [pathname]);

  // Logo font is set statically to Saint Carell

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product/");
  const isCollection = pathname.startsWith("/collection");
  const hasSubnav = isProduct || isCollection;
  const isClientPage = pathname === "/login" || pathname.startsWith("/account") || pathname === "/archive";

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

  const [hasBanner, setHasBanner] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed") === "true";
    if (dismissed) {
      setHasBanner(false);
    }
    const handleDismiss = () => {
      setHasBanner(false);
    };
    window.addEventListener("announcement-dismissed", handleDismiss);
    return () => window.removeEventListener("announcement-dismissed", handleDismiss);
  }, []);

  const BANNER_H = (hasBanner && !isProduct) ? 40 : 0;

  // Smart header: hide on scroll down, show solid on scroll up
  const [headerVisible, setHeaderVisible] = useState(true);
  const [navTop, setNavTop] = useState(BANNER_H);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    setNavTop(BANNER_H);
    const threshold = pathname === "/" ? window.innerHeight : 10;
    setIsAtTop(window.scrollY < threshold);
  }, [BANNER_H, pathname]);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      setHeaderVisible(true);
      setNavTop(BANNER_H);
      const threshold = pathname === "/" ? window.innerHeight : 10;
      setIsAtTop(y < threshold);
      lastScrollY.current = y;
      ticking.current = false;
    });
  }, [BANNER_H, pathname]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  useEffect(() => {
    if (!headerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeaderHeight(entry.target.clientHeight);
      }
    });
    resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Body padding: always pad body to accommodate the header height + banner (0 on homepage/product page for transparent overlay)
  useEffect(() => {
    const body = document.body;
    const pad = (isHome || isProduct) ? 0 : (headerHeight + BANNER_H);
    body.style.paddingTop = `${pad}px`;
    return () => { body.style.paddingTop = "48px"; };
  }, [BANNER_H, isHome, isProduct, headerHeight]);

  useEffect(() => {
    document.documentElement.style.setProperty('--banner-height', `${BANNER_H}px`);
  }, [BANNER_H]);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }, [headerHeight]);



  return (
    <>
      <div 
        className={`acne-megamenu-backdrop ${activeMegaMenu ? 'open' : ''}`}
        onMouseEnter={() => setActiveMegaMenu(null)}
      />

      <header 
        ref={headerRef}
        className={`acne-header ${isMenuOpen ? "menu-open" : ""} ${activeMegaMenu ? "solid" : (isHome ? (isAtTop ? "transparent-home" : "solid") : isProduct ? (isAtTop ? "transparent-pdp" : "solid") : "solid")} ${!headerVisible ? "header-hidden" : ""} ${isSearchOpen ? "search-active" : ""} ${isHome && isAtTop ? "home-at-top" : ""}`} 
        style={{top: `${navTop}px`}}
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="acne-header-inner">
          {/* LEFT: Desktop Logo & Mobile Menu/Cart */}
          <div className="acne-nav-left">
            {/* Desktop Logo on the left */}
            {!isMenuOpen && (
              <Link href="/" className="acne-logo acne-desktop-only" aria-label="TONET TORRENTINNI">
                <img src="/logo-brand.png" alt="TONET TORRENTINNI" className="acne-logo-img logo-black" />
                <img src="/logo-brand.png" alt="TONET TORRENTINNI" className="acne-logo-img logo-white" />
              </Link>
            )}

            {/* Mobile-only Left side: Menu & Cart or Back button */}
            <div className="acne-mobile-only acne-nav-left-mobile">
              {isMenuOpen ? (
                (menuLevel === 2 || menuLevel === 3) && (
                  <button 
                    className="acne-right-icon" 
                    aria-label="Back" 
                    onClick={() => {
                      if (menuLevel === 3) {
                        setMenuActiveItemL2(null);
                        setMenuLevel(2);
                      } else if (menuLevel === 2) {
                        setMenuActiveItemL1(null);
                        setMenuLevel(1);
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )
              ) : (
                !isClientPage && (
                  <>
                    <button className="acne-right-icon" aria-label="Menu" onClick={openMenu}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 15H21M3 9H21" />
                      </svg>
                    </button>
                    <button className="acne-right-icon" onClick={openCart} aria-label="Open bag">
                      <div className="cart-icon-wrap">
                        <svg width="18" height="18" viewBox="3 2 18 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                          <path fillRule="evenodd" clipRule="evenodd" d="M17 6.99998C16.4067 4.69999 14.3267 3 11.84 3C9.35334 3 7.27334 4.69999 6.68 6.99998H3V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V6.99998H17ZM15.6067 6.99998C15.06 5.44666 13.58 4.33333 11.84 4.33333C10.1 4.33333 8.62001 5.44666 8.07334 6.99998H15.6067Z" fill="none"/>
                        </svg>
                        {cartCount > 0 && <span className="cart-badge"></span>}
                      </div>
                    </button>
                  </>
                )
              )}
            </div>
          </div>

          {/* CENTER: Logo or category title */}
          {isMenuOpen && (menuLevel === 2 || menuLevel === 3) ? (
            <div className="acne-logo acne-mobile-only acne-menu-center-title">
              <span className={`acne-header-menu-title ${menuLevel === 2 ? 'uppercase' : 'capitalized'}`}>
                {menuLevel === 2 ? menuActiveItemL1?.title : menuActiveItemL2?.title}
              </span>
            </div>
          ) : (
            <Link href="/" className="acne-logo acne-mobile-only" aria-label="TONET TORRENTINNI">
              <img src="/logo-brand.png" alt="TONET TORRENTINNI" className="acne-logo-img logo-black" />
              <img src="/logo-brand.png" alt="TONET TORRENTINNI" className="acne-logo-img logo-white" />
            </Link>
          )}

          {/* RIGHT: Desktop Nav Links + Utility Icons or Close button */}
          <div className="acne-nav-right">
            {isMenuOpen ? (
              <div className="acne-nav-right-close-only">
                <button className="acne-right-icon" aria-label="Close menu" onClick={closeMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Nav Links */}
                <div className="acne-nav-desktop-links acne-desktop-only">
                  <Link 
                    href="/collection" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu(null)}
                  >
                    Sale
                  </Link>
                  <Link 
                    href="/collection" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu(null)}
                  >
                    New Arrivals
                  </Link>
                  <Link 
                    href="/collection/men" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu('men')}
                  >
                    Men
                  </Link>
                  <Link 
                    href="/collection/women" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu('women')}
                  >
                    Women
                  </Link>
                  <Link 
                    href="/collection" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu(null)}
                  >
                    Gifts
                  </Link>
                  <Link 
                    href="/collection" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu('children')}
                  >
                    Kids
                  </Link>
                  <Link 
                    href="/collection" 
                    className="acne-nav-desktop-link"
                    onMouseEnter={() => setActiveMegaMenu(null)}
                  >
                    T-UNIVERSE!
                  </Link>
                </div>

                <div className="acne-right-icons">
                  {!isClientPage && (
                    <>
                      {/* Account icon */}
                      <button onClick={openAccount} className="acne-right-icon" aria-label="Account">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="9" r="3" />
                          <circle cx="12" cy="12" r="10" />
                          <path d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20" />
                        </svg>
                      </button>

                      {/* Search icon */}
                      <button className="acne-right-icon" aria-label="Search" onClick={openSearch}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </button>

                      {/* Wishlist icon (Desktop only) */}
                      <Link href="/archive?tab=personal" className="acne-right-icon acne-wishlist-icon acne-desktop-only" aria-label="Wishlist">
                        <div className="wishlist-icon-wrap">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                      </Link>
                    </>
                  )}

                  {/* Cart icon (Desktop only) */}
                  <button className="acne-right-icon acne-desktop-only" onClick={openCart} aria-label="Open bag">
                    <div className="cart-icon-wrap">
                      <svg width="18" height="18" viewBox="3 2 18 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                        <path fillRule="evenodd" clipRule="evenodd" d="M17 6.99998C16.4067 4.69999 14.3267 3 11.84 3C9.35334 3 7.27334 4.69999 6.68 6.99998H3V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V6.99998H17ZM15.6067 6.99998C15.06 5.44666 13.58 4.33333 11.84 4.33333C10.1 4.33333 8.62001 5.44666 8.07334 6.99998H15.6067Z" fill="none"/>
                      </svg>
                      {cartCount > 0 && <span className="cart-badge"></span>}
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MEGA DROPDOWNS CONTAINER */}
        <div className={`acne-megamenus-container ${activeMegaMenu ? 'open' : ''}`}>
          {/* 1. PRIVATE SALE DROPDOWN */}
          {activeMegaMenu === 'private-sale' && (
            <div className="acne-megamenu-content">
              <div className="acne-megamenu-cols">
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Women</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Ready to wear</Link></li>
                    <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Accessories</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Men</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Ready to wear</Link></li>
                    <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Accessories</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Children</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Bottom Thumbnails */}
              <div className="acne-megamenu-thumbnails">
                {thumbnails.map((t, idx) => (
                  <Link key={idx} href={t.href} className="acne-megamenu-thumbnail" onClick={() => setActiveMegaMenu(null)}>
                    <div className="acne-megamenu-thumbnail-img-wrap">
                      <img src={t.img} alt={t.label} />
                    </div>
                    <span>{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. WOMEN DROPDOWN */}
          {activeMegaMenu === 'women' && (
            <div className="acne-megamenu-content">
              <div className="acne-megamenu-cols-wrap">
                <div className="acne-megamenu-cols">
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Collections</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>New Arrivals</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Spring 2026 Collection</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Summer 2026 Collection</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Charmeuse Dresses</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Wedding dresses</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Gifts</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Ready to Wear</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Coats & Jackets</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Dresses</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Knitwear</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Pants & Shorts</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Skirts</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Tops</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>T-shirts & Sweatshirts</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Bags</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Cat Bags</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Catch</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Confident</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Compagnon</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Crossbody Bags</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Totes & Top Handle Bags</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Mini Bags & Clutches</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Shoes</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Curb</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Midnight Step</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Ballerinas</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Sandals & Mules</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Sneakers</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Pumps</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Accessories</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Jewelry</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Belts</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Silks & Scarves</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Sunglasses</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Hats</Link></li>
                      <li><Link href="/collection/women" onClick={() => setActiveMegaMenu(null)}>Small Leather Goods</Link></li>
                    </ul>
                  </div>
                </div>
                
                {/* Featured Highlight Panel */}
                <div className="acne-megamenu-highlight">
                  <div className="acne-megamenu-highlight-img-wrap">
                    <img src="/hero/ComfyUI-main_reference_00019_.png" alt="Women Featured" />
                  </div>
                  <div className="acne-megamenu-highlight-title">Pre-Fall 2026 Campaign</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MEN DROPDOWN */}
          {activeMegaMenu === 'men' && (
            <div className="acne-megamenu-content">
              <div className="acne-megamenu-cols-wrap">
                <div className="acne-megamenu-cols">
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Collections</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>New Arrivals</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Spring 2026 Collection</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Summer 2026 Collection</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>The Sneakers Edit</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Gifts</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Ready to Wear</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Coats & Jackets</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Knitwear & Polo</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>T-shirts & Sweat-shirts</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Shirts & Tops</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Pants & Shorts</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Shoes</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Curb</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>DBB1</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Sneakers</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Loafers & Derbies</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Bags</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                    </ul>
                  </div>
                  <div className="acne-megamenu-col">
                    <h4 className="acne-megamenu-col-title">Accessories</h4>
                    <ul className="acne-megamenu-list">
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>View All</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Small Leather Goods</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Belts</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Hats</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Scarves & Ties</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Socks</Link></li>
                      <li><Link href="/collection/men" onClick={() => setActiveMegaMenu(null)}>Sunglasses</Link></li>
                    </ul>
                  </div>
                </div>
                
                {/* Featured Highlight Panel */}
                <div className="acne-megamenu-highlight">
                  <div className="acne-megamenu-highlight-img-wrap">
                    <img src="/hero/ComfyUI-main_reference_00028_.png" alt="Men Featured" />
                  </div>
                  <div className="acne-megamenu-highlight-title">Summer 2026 Collection</div>
                </div>
              </div>
            </div>
          )}

          {/* 6. MAISON TONET DROPDOWN */}
          {activeMegaMenu === 'maison' && (
            <div className="acne-megamenu-content">
              <div className="acne-megamenu-cols">
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">La Maison</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/about" onClick={() => setActiveMegaMenu(null)}>Tonet Torrentinni</Link></li>
                    <li><Link href="/about" onClick={() => setActiveMegaMenu(null)}>History of the House</Link></li>
                    <li><Link href="/about" onClick={() => setActiveMegaMenu(null)}>22 rue du Faubourg Saint-Honoré</Link></li>
                    <li><Link href="/about" onClick={() => setActiveMegaMenu(null)}>855 Madison Avenue</Link></li>
                    <li><Link href="/about" onClick={() => setActiveMegaMenu(null)}>65 Boulevard de la Croisette</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Shows</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Winter 2026</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Summer 2026</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Autumn Winter 2025</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Tonet Lab</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Tonet Lab by Future</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Projects</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Créations Spéciales</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Tonet x Benjamin Millepied</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Tonet on the Renaissance World Tour</Link></li>
                  </ul>
                </div>
                <div className="acne-megamenu-col">
                  <h4 className="acne-megamenu-col-title">Campaigns</h4>
                  <ul className="acne-megamenu-list">
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Character Studies: The Final Chapter</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Character Studies: Modern Heroes</Link></li>
                    <li><Link href="/collection" onClick={() => setActiveMegaMenu(null)}>Character Studies: Le chic ultime</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Bottom Thumbnails */}
              <div className="acne-megamenu-thumbnails">
                {thumbnails.map((t, idx) => (
                  <Link key={idx} href={t.href} className="acne-megamenu-thumbnail" onClick={() => setActiveMegaMenu(null)}>
                    <div className="acne-megamenu-thumbnail-img-wrap">
                      <img src={t.img} alt={t.label} />
                    </div>
                    <span>{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <style>{`
        /* ══ BASE ══ */
        .acne-header {
          position: fixed;
          top: 0;
          left: 0; right: 0;
          z-index: 500;
          background: #ffffff;
          border-bottom: none;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .acne-header.transparent-home {
          background: transparent;
        }
        .acne-header.transparent-pdp {
          background: transparent;
        }
        .acne-header.header-hidden { transform: translateY(-100%); }
        .acne-header.home-at-top {
          background: transparent !important;
        }

        /* Make elements white when at the top of homepage */
        .acne-header.home-at-top .acne-logo-text {
          color: #ffffff !important;
        }
        .acne-header.home-at-top .acne-logo-img.logo-black {
          opacity: 0;
        }
        .acne-header.home-at-top .acne-logo-img.logo-white {
          opacity: 1;
        }
        .acne-header.home-at-top svg {
          stroke: #ffffff !important;
        }
        .acne-header.home-at-top .acne-right-icon,
        .acne-header.home-at-top .acne-mob-icon,
        .acne-header.home-at-top .acne-nav-desktop-link,
        .acne-header.home-at-top .acne-nav-links a {
          color: #ffffff !important;
        }

        @media (min-width: 768px) {
          .acne-header.search-active {
            background-color: transparent !important;
            border-bottom-color: transparent !important;
            pointer-events: none;
          }
          .acne-header.search-active .acne-nav-left,
          .acne-header.search-active .acne-logo,
          .acne-header.search-active .acne-nav-right {
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease !important;
            transition-delay: 0s !important;
            transform: translateY(0) !important;
          }
        }

        /* ══ ALL STATES: black text ══ */
        .acne-header .acne-nav-links a,
        .acne-header .acne-mob-icon,
        .acne-header .acne-right-icon,
        .acne-header .acne-logo-text {
          color: rgba(0, 0, 0, 0.9);
          transition: color 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }
        .acne-header svg {
          stroke: rgba(0, 0, 0, 0.9);
          transition: stroke 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .acne-header .cart-badge,
        .acne-header .wishlist-badge {
          background: #000000;
          transition: background-color 0.35s ease;
        }

        /* ══ TRANSPARENT STATE (HOME): black text ══ */
        .acne-header.transparent-home .acne-nav-links a,
        .acne-header.transparent-home .acne-mob-icon,
        .acne-header.transparent-home .acne-right-icon,
        .acne-header.transparent-home .acne-logo-text {
          color: rgba(0, 0, 0, 0.9);
        }
        .acne-header.transparent-home svg {
          stroke: rgba(0, 0, 0, 0.9);
        }
        .acne-header.transparent-home .cart-badge,
        .acne-header.transparent-home .wishlist-badge {
          background: #000000;
        }

        /* ══ TRANSPARENT STATE (PDP): black text ══ */
        .acne-header.transparent-pdp .acne-nav-links a,
        .acne-header.transparent-pdp .acne-mob-icon,
        .acne-header.transparent-pdp .acne-right-icon,
        .acne-header.transparent-pdp .acne-logo-text {
          color: #000000;
        }
        .acne-header.transparent-pdp svg {
          stroke: #000000;
        }
        .acne-header.transparent-pdp .cart-badge,
        .acne-header.transparent-pdp .wishlist-badge {
          background: #000000;
        }

        /* ══ LAYOUT ══ */
        .acne-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: stretch;
          height: 64px;
          padding: 0 40px;
        }

        /* ══ LOGO ══ */
        .acne-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          width: 180px;
          overflow: hidden;
          position: relative;
        }
        
        .acne-logo.acne-mobile-only {
          grid-column: 2;
          justify-self: center;
        }
        
        .acne-logo.acne-desktop-only {
          justify-self: flex-start;
          margin-left: -24px;
        }
        
        .acne-logo-img {
          width: auto;
          height: 50px;
          max-width: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .acne-logo-img.logo-black {
          filter: brightness(0);
          opacity: 1;
          z-index: 2;
        }

        .acne-logo-img.logo-white {
          filter: brightness(0) invert(1);
          opacity: 0;
          z-index: 1;
        }

        .acne-logo:hover {
          opacity: 0.75;
        }

        /* ══ LEFT NAV ══ */
        .acne-nav-left {
          grid-column: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 4px;
        }
        .acne-nav-left-mobile {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .acne-nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .acne-nav-desktop-link {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: var(--w-medium);
          text-transform: uppercase;
          text-decoration: none;
          color: #000000;
          letter-spacing: 0.03em;
          padding: 8px 0;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.25s ease, color 0.25s ease;
        }
        
        /* Sibling hover fade effect */
        .acne-nav-desktop-links:hover .acne-nav-desktop-link:not(:hover) {
          opacity: 0.35;
        }
        
        .acne-nav-desktop-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .acne-nav-desktop-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Transparent header states for links */
        .acne-header.transparent-home .acne-nav-desktop-link {
          color: rgba(0, 0, 0, 0.85);
        }
        .acne-header.transparent-pdp .acne-nav-desktop-link {
          color: #000000;
        }

        /* ══ RIGHT ICONS ══ */
        .acne-nav-right {
          grid-column: 3;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 40px;
        }
        @media (min-width: 768px) {
          .acne-nav-right {
            grid-column: 2 / span 2;
          }
        }
        .acne-right-icons { display: flex; align-items: center; gap: 12px; }
        .acne-right-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 64px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.9);
          text-decoration: none;
          padding: 0;
          transition: opacity 0.3s ease;
        }
        .acne-right-icon svg {
          width: 21px;
          height: 21px;
        }
        .acne-right-icon:hover { opacity: 0.6; }
        .acne-right-icon svg { stroke: rgba(0, 0, 0, 0.9); }

        /* ══ BADGES ══ */
        .cart-icon-wrap,
        .wishlist-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-badge,
        .wishlist-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 5px;
          height: 5px;
          background-color: #000000;
          border-radius: 0;
        }

        /* ══ MOB ICON ══ */
        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.9);
          padding: 0;
          transition: opacity 0.3s ease;
        }
        .acne-mob-icon:hover { opacity: 0.6; }
        .acne-mobile-left { display: flex; align-items: center; }

        /* ══ DESKTOP ══ */
        @media (min-width: 768px) {
          .acne-header-inner { padding: 0 24px 0 40px; }
        }

        /* ══ MEGAMENU STYLING ══ */
        .acne-megamenu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          z-index: 490;
          transition: opacity 0.35s ease;
        }
        .acne-megamenu-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ══ MEGA DROPDOWNS CONTAINER ══ */
        .acne-megamenus-container {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100vw;
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s;
          z-index: 501;
          border-radius: 0 !important; /* Rectangular borders */
          max-height: 90vh;
          overflow-y: auto;
        }
        .acne-megamenus-container.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* Mega Dropdown Content */
        .acne-megamenu-content {
          padding: 40px 64px 48px;
          color: #000000;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Columns Grid */
        .acne-megamenu-cols {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 32px;
          align-items: start;
        }
        .acne-megamenu-col {
          display: flex;
          flex-direction: column;
        }
        .acne-megamenu-col-title {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 500;
          text-transform: lowercase;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.85);
          margin: 0 0 16px 0;
        }
        .acne-megamenu-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .acne-megamenu-list a {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.55);
          letter-spacing: 0.08em;
          transition: color 0.25s ease;
        }
        .acne-megamenu-list a:hover {
          color: #000000;
        }

        /* Layout with Highlight Panel */
        .acne-megamenu-cols-wrap {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 64px;
        }
        .acne-megamenu-highlight {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .acne-megamenu-highlight-img-wrap {
          width: 100%;
          height: 320px;
          overflow: hidden;
          background: #f7f7f7;
          border-radius: 0 !important; /* Rectangular borders */
        }
        .acne-megamenu-highlight-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0 !important;
        }
        .acne-megamenu-highlight:hover .acne-megamenu-highlight-img-wrap img {
          transform: scale(1.04);
        }
        .acne-megamenu-highlight-title {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: lowercase;
          color: rgba(0, 0, 0, 0.7);
        }

        /* Bottom Row Thumbnails */
        .acne-megamenu-thumbnails {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: 36px;
          padding-top: 36px;
        }
        .acne-megamenu-thumbnail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          text-align: center;
        }
        .acne-megamenu-thumbnail-img-wrap {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f7f7f7;
          border-radius: 0 !important; /* Rectangular borders */
        }
        .acne-megamenu-thumbnail-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0 !important;
        }
        .acne-megamenu-thumbnail:hover .acne-megamenu-thumbnail-img-wrap img {
          transform: scale(1.05);
        }
        .acne-megamenu-thumbnail span {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.75);
          text-transform: lowercase;
          transition: color 0.25s ease;
        }
        .acne-megamenu-thumbnail:hover span {
          color: #000000;
        }

        /* ══ DESKTOP/MOBILE VISIBILITY ══ */
        .acne-mobile-only {
          display: none !important;
        }
        @media (max-width: 767px) {
          .acne-desktop-only {
            display: none !important;
          }
          .acne-mobile-only {
            display: flex !important;
          }
          button.acne-mobile-only {
            display: flex !important;
          }
        }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .acne-header-inner { 
            padding: 0 16px; 
            height: 54px; 
            display: grid; 
            grid-template-columns: 1fr auto 1fr; 
            align-items: stretch; 
          }
          .acne-logo {
            height: 50px;
            width: 150px;
          }
          .acne-logo-img {
            width: auto !important;
            height: 42px !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
          .acne-mob-icon { width: 28px !important; height: 54px; }
          .acne-right-icon { width: 28px !important; height: 54px; }
          .acne-mob-icon svg,
          .acne-right-icon svg {
            width: 21px !important;
            height: 21px !important;
          }
          .acne-right-icons {
            gap: 6px !important;
          }
          .acne-nav-left-mobile {
            gap: 6px !important;
          }
          .acne-wishlist-icon { display: none !important; }
          
          /* Swap positions of header elements on mobile (when menu is closed) */
          .acne-header:not(.menu-open) .acne-nav-left {
            grid-column: 3 !important;
            grid-row: 1 !important;
            justify-content: flex-end !important;
          }
          .acne-header:not(.menu-open) .acne-nav-right {
            grid-column: 1 !important;
            grid-row: 1 !important;
            justify-content: flex-start !important;
          }
          .acne-header:not(.menu-open) .acne-logo.acne-mobile-only {
            grid-column: 2 !important;
            grid-row: 1 !important;
          }
          .acne-header:not(.menu-open) .acne-nav-left-mobile {
            flex-direction: row-reverse;
          }
          
          /* Active states */
          .acne-mob-icon:active,
          .acne-right-icon:active {
            opacity: 0.45;
          }
        }

        .acne-menu-center-title {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          height: 100%;
        }
        .acne-header-menu-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          letter-spacing: 0.03em;
          color: #000000;
          font-weight: 400;
          white-space: nowrap;
        }
        .acne-header-menu-title.uppercase {
          text-transform: uppercase;
        }
        .acne-header-menu-title.capitalized {
          text-transform: uppercase;
        }
        .acne-nav-right-close-only {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .acne-header.menu-open {
          background: #ffffff !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        .acne-header.menu-open .acne-logo-text,
        .acne-header.menu-open .acne-nav-desktop-link,
        .acne-header.menu-open .acne-right-icon,
        .acne-header.menu-open .acne-mob-icon {
          color: #000000 !important;
        }
        .acne-header.menu-open svg {
          stroke: #000000 !important;
        }
        .acne-header.menu-open svg path,
        .acne-header.menu-open svg line,
        .acne-header.menu-open svg polyline {
          stroke: #000000 !important;
        }
      `}</style>
    </>
  );
}
