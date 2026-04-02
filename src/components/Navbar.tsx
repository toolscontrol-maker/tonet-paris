"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";

export default function Navbar() {
  const { openCart, openSearch, openMenu } = useUI();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product/");

  // All pages now start below the header, ensuring it doesn't overlap content.
  useEffect(() => {
    const body = document.body;
    if (isProduct) {
      body.style.paddingTop = "88px";
    } else {
      body.style.paddingTop = "48px";
    }

    // Return to default padding on unmount
    return () => {
      body.style.paddingTop = "48px";
    };
  }, [isProduct]);

  const solid = true;

  return (
    <>
      <header className={`acne-header ${solid ? "solid" : "transparent"}`}>
        <div className="acne-header-inner">
          {/* LEFT: Nav links (desktop) | Hamburger (mobile) */}
          <div className="acne-nav-left">
            <nav className="acne-nav-links desktop-only">
              <Link href="/">WOMAN</Link>
              <Link href="/">MAN</Link>
              <Link href="/">BAGS</Link>
              <Link href="/">RUNWAY</Link>
            </nav>
            <div className="acne-mobile-left mobile-only">
              <button className="acne-icon-btn" aria-label="Menu" onClick={openMenu}>
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="0" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="0" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              <div className="acne-icon-sep" />
              <button className="acne-icon-btn" aria-label="Search" onClick={openSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </div>

          {!isHome && (
            <Link href="/" className="acne-logo">
              Toni Studios
            </Link>
          )}

          {/* RIGHT: SEARCH HELP ACCOUNT BAG (desktop) | ACCOUNT BAG (mobile) */}
          <div className="acne-nav-right">
            <button className="acne-text-btn desktop-only" aria-label="Search" onClick={openSearch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>SEARCH</span>
            </button>
            <Link href="#" className="acne-text-btn desktop-only" aria-label="Help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>HELP</span>
            </Link>
            <Link href="/login" className="acne-text-btn desktop-only" aria-label="Account">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>ACCOUNT</span>
            </Link>
            <div className="acne-icon-sep mobile-only" />
            <Link href="/login" className="acne-icon-btn mobile-only" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <div className="acne-icon-sep mobile-only" />
            <button className="acne-bag-btn" onClick={openCart} aria-label="Open bag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#a3ff00" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="bag-count">02</span>
            </button>
          </div>
        </div>

        {/* ── SECONDARY STICKY NAV (Product Only) ── */}
        {isProduct && (
          <div className="acne-subnav">
            <div className="acne-subnav-inner">
              <Link href="/" className="back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Gallery</span>
              </Link>
              <div className="subnav-links desktop-only">
                <Link href="#">All collections</Link>
                <Link href="#">New Arrival</Link>
                <Link href="#" className="active">Abstracts</Link>
                <Link href="#">Portraits</Link>
              </div>
              <div className="subnav-mobile mobile-only">
                <span>Abstracts</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        .acne-header {
          position: fixed;
          top: 0;
          left: 0; right: 0;
          z-index: 500;
          transition: background-color 0.25s ease, border-bottom-color 0.25s ease;
        }
        .acne-header.transparent {
          background: transparent;
        }
        .acne-header.solid {
          background: #fff;
          border-bottom: 1px solid #ededed;
        }

        .acne-header-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          height: 48px;
          padding: 4px 20px 0;
          position: relative;
        }

        .acne-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          font-size: 40px;
          font-weight: 600;
          letter-spacing: -0.055em;
          color: #000;
          text-decoration: none;
          white-space: nowrap;
        }

        .acne-nav-left { display: flex; align-items: flex-start; flex: 1; }
        .acne-nav-links { display: flex; gap: 28px; }
        .acne-nav-links a {
          font-size: 12px; font-family: Arial, sans-serif;
          text-transform: uppercase; text-decoration: none; color: #000;
          letter-spacing: 1.2px;
        }

        .acne-nav-right { flex: 1; display: flex; align-items: flex-start; justify-content: flex-end; }
        .acne-text-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-family: Arial, sans-serif;
          text-transform: uppercase; color: #000; text-decoration: none;
          background: none; border: none; cursor: pointer; padding: 0 12px;
          height: 24px; letter-spacing: 1.2px;
        }

        .acne-bag-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer; color: #000;
          padding: 0 0 0 12px; height: 24px;
        }
        .bag-count { font-size: 11px; text-transform: uppercase; }

        .acne-icon-btn {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; color: #000;
          padding: 0 12px; height: 24px;
        }

        .acne-icon-sep { width: 1px; height: 20px; background: #ededed; }
        .acne-mobile-left { display: flex; align-items: center; }

        /* ── SUBNAV ── */
        .acne-subnav {
          height: 40px;
          background: #fff;
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
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          color: #000;
        }
        .subnav-links {
          display: flex;
          gap: 24px;
        }
        .subnav-links a {
          font-size: 11px;
          text-transform: uppercase;
          color: #768194;
        }
        .subnav-links a.active { color: #000; font-weight: 500; }
        .subnav-mobile span { font-size: 11px; text-transform: uppercase; font-weight: 500; }

        .desktop-only { display: flex !important; }
        .mobile-only  { display: none !important; }

        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
          .acne-header-inner { padding: 0; }
          .acne-logo { 
            font-size: 20px; 
            letter-spacing: -0.055em; 
          }
          .acne-bag-btn { padding: 0 14px; }
          .acne-subnav-inner { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
