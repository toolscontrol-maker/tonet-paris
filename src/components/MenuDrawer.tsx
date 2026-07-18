"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

interface MenuItem {
  title: string;
  href?: string;
  items?: MenuItem[];
}

const MENU_DATA: MenuItem[] = [
  {
    title: "SALE",
    items: [
      { title: "New In", href: "/collection" },
      { title: "Men", href: "/collection/men" },
      { title: "Women", href: "/collection/women" }
    ]
  },
  {
    title: "NEW ARRIVALS",
    href: "/collection"
  },
  {
    title: "MEN",
    items: [
      { title: "New In", href: "/collection/men" },
      {
        title: "Clothing",
        items: [
          { title: "Coats & Blazers", href: "/collection/men" },
          { title: "Suits", href: "/collection/men" },
          { title: "Jackets & Down Jackets", href: "/collection/men" },
          { title: "Knitwear", href: "/collection/men" },
          { title: "Shirts", href: "/collection/men" },
          { title: "T-Shirts & Sweatshirts", href: "/collection/men" },
          { title: "Sportswear", href: "/collection/men" },
          { title: "Denim", href: "/collection/men" },
          { title: "Pantalones: Largos y Cortos", href: "/collection/men" },
          { title: "View All", href: "/collection/men" }
        ]
      },
      {
        title: "Bags",
        items: [
          { title: "Totes", href: "/collection/men" },
          { title: "Crossbody Bags", href: "/collection/men" },
          { title: "View All", href: "/collection/men" }
        ]
      },
      {
        title: "Shoes",
        items: [
          { title: "Sneakers", href: "/collection/men" },
          { title: "Loafers & Derbies", href: "/collection/men" },
          { title: "View All", href: "/collection/men" }
        ]
      },
      {
        title: "Accessories",
        items: [
          { title: "Sunglasses", href: "/collection/men" },
          { title: "Belts", href: "/collection/men" },
          { title: "Hats", href: "/collection/men" },
          { title: "View All", href: "/collection/men" }
        ]
      },
      { title: "Must Haves", href: "/collection/men" }
    ]
  },
  {
    title: "WOMEN",
    items: [
      { title: "New In", href: "/collection/women" },
      {
        title: "Clothing",
        items: [
          { title: "Coats & Jackets", href: "/collection/women" },
          { title: "Dresses", href: "/collection/women" },
          { title: "Knitwear", href: "/collection/women" },
          { title: "Skirts", href: "/collection/women" },
          { title: "Tops & Shirts", href: "/collection/women" },
          { title: "T-Shirts & Sweatshirts", href: "/collection/women" },
          { title: "Pants & Shorts", href: "/collection/women" },
          { title: "View All", href: "/collection/women" }
        ]
      },
      {
        title: "Bags",
        items: [
          { title: "Crossbody Bags", href: "/collection/women" },
          { title: "Totes & Top Handle Bags", href: "/collection/women" },
          { title: "Mini Bags & Clutches", href: "/collection/women" },
          { title: "View All", href: "/collection/women" }
        ]
      },
      {
        title: "Shoes",
        items: [
          { title: "Ballerinas", href: "/collection/women" },
          { title: "Sandals & Mules", href: "/collection/women" },
          { title: "Sneakers", href: "/collection/women" },
          { title: "Pumps", href: "/collection/women" },
          { title: "View All", href: "/collection/women" }
        ]
      },
      {
        title: "Accessories",
        items: [
          { title: "Jewelry", href: "/collection/women" },
          { title: "Belts", href: "/collection/women" },
          { title: "Sunglasses", href: "/collection/women" },
          { title: "Hats", href: "/collection/women" },
          { title: "View All", href: "/collection/women" }
        ]
      }
    ]
  },
  {
    title: "BAGS",
    items: [
      { title: "Women Bags", href: "/collection/women" },
      { title: "Men Bags", href: "/collection/men" }
    ]
  },
  {
    title: "GIFTS",
    href: "/collection"
  },
  {
    title: "FRAGRANCES",
    href: "/collection"
  },
  {
    title: "V-UNIVERSE",
    href: "/about"
  }
];

export default function MenuDrawer() {
  const { 
    isMenuOpen, 
    closeMenu,
    menuLevel: level,
    setMenuLevel: setLevel,
    menuActiveItemL1: activeItemL1,
    setMenuActiveItemL1: setActiveItemL1,
    menuActiveItemL2: activeItemL2,
    setMenuActiveItemL2: setActiveItemL2
  } = useUI();
  
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isMenuOpen, closeMenu]);

  const handleItemClick = (item: MenuItem, currentLevel: 1 | 2) => {
    if (item.items) {
      if (currentLevel === 1) {
        setActiveItemL1(item);
        setLevel(2);
      } else {
        setActiveItemL2(item);
        setLevel(3);
      }
    } else if (item.href) {
      closeMenu();
      router.push(item.href);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`md-backdrop ${isMenuOpen ? "open" : ""}`} aria-hidden="true" />

      {/* Drawer */}
      <div 
        className={`md-drawer ${isMenuOpen ? "open" : ""}`} 
        ref={drawerRef} 
        role="dialog" 
        aria-modal="true"
      >

        {/* Sliding Panels Track */}
        <div className="md-panels-wrapper">
          <div 
            className="md-panels-track" 
            style={{ transform: `translateX(-${(3 - level) * 33.333}%)` }}
          >
            {/* PANEL 3 (Level 3 Details) */}
            <div className="md-panel">
              <div className="md-panel-main">
                <nav className="md-nav-links">
                  {activeItemL2?.items?.map((item: { title: string; href: string }) => (
                    <button
                      key={item.title}
                      type="button"
                      className="md-nav-row capitalized"
                      onClick={() => handleItemClick(item, 2)}
                    >
                      <span className="md-nav-label">{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Panel 3 Campaign Card */}
              <div className="md-panel-campaign">
                <Link href="/collection" className="md-campaign-card" onClick={closeMenu}>
                  <div className="md-campaign-img-wrap">
                    <img src="/hero/journal_garden_landscape_1.png" alt="TONET Campaign" />
                  </div>
                </Link>
              </div>
            </div>

            {/* PANEL 2 (Level 2 Subcategories) */}
            <div className="md-panel">
              <div className="md-panel-main">
                <nav className="md-nav-links">
                  {activeItemL1?.items?.map((item: MenuItem) => (
                    <button
                      key={item.title}
                      type="button"
                      className="md-nav-row uppercase"
                      onClick={() => handleItemClick(item, 2)}
                    >
                      <span className="md-nav-label">{item.title}</span>
                      {item.items && <ChevronRight size={14} strokeWidth={1} className="md-arrow-icon" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Panel 2 Campaign Card */}
              <div className="md-panel-campaign">
                <Link href="/collection" className="md-campaign-card" onClick={closeMenu}>
                  <div className="md-campaign-img-wrap">
                    <img src="/hero/journal_garden_landscape_1.png" alt="TONET Campaign" />
                  </div>
                </Link>
              </div>
            </div>

            {/* PANEL 1 (Level 1 Categories) */}
            <div className="md-panel">
              <div className="md-panel-main">
                <nav className="md-nav-links">
                  {MENU_DATA.map((item: MenuItem) => (
                    <button
                      key={item.title}
                      type="button"
                      className="md-nav-row uppercase"
                      onClick={() => handleItemClick(item, 1)}
                    >
                      <span className="md-nav-label">{item.title}</span>
                      {item.items && <ChevronRight size={14} strokeWidth={1} className="md-arrow-icon" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Panel 1 Footer Links */}
              <footer className="md-panel-footer">
                <Link href="/account" className="md-footer-link" onClick={closeMenu}>
                  My Account
                </Link>
                <Link href="/stores" className="md-footer-link" onClick={closeMenu}>
                  Store Locator
                </Link>
                <Link href="/contact" className="md-footer-link" onClick={closeMenu}>
                  Customer Service
                </Link>
              </footer>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .md-backdrop {
          position: fixed;
          top: var(--header-height, 64px);
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }
        .md-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ══ DRAWER CONTAINER ══ */
        .md-drawer {
          position: fixed;
          top: var(--header-height, 64px);
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 480px;
          height: calc(100vh - var(--header-height, 64px));
          background: #ffffff;
          display: flex;
          flex-direction: column;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
          border-radius: 0 !important;
        }
        .md-drawer.open {
          transform: translateX(0);
        }
        .md-drawer *,
        .md-drawer {
          border-radius: 0 !important;
          box-sizing: border-box;
        }

        /* ══ HEADER ══ */
        .md-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 0 16px;
          flex-shrink: 0;
        }
        .md-header-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          transition: opacity 0.2s ease;
        }
        .md-header-btn:hover {
          opacity: 0.6;
        }
        .md-header-spacer {
          width: 34px;
        }
        .md-header-title-container {
          flex: 1;
          text-align: center;
        }
        .md-logo {
          font-family: 'Saint Carell', sans-serif;
          font-size: 14px;
          letter-spacing: 0.12em;
          font-weight: normal;
          color: #000000;
        }
        .md-category-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #000000;
        }
        .md-category-title.uppercase {
          text-transform: uppercase;
        }
        .md-category-title.capitalized {
          text-transform: capitalize;
        }

        /* ══ SLIDING WRAPPER ══ */
        .md-panels-wrapper {
          flex: 1;
          overflow: hidden;
          width: 100%;
          position: relative;
        }
        .md-panels-track {
          display: flex;
          width: 300%;
          height: 100%;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .md-panel {
          width: 33.333%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .md-panel::-webkit-scrollbar {
          display: none;
        }
        .md-panel-main {
          flex: 1;
        }

        /* ══ NAVIGATION ROWS ══ */
        .md-nav-links {
          display: flex;
          flex-direction: column;
          padding: 8px 0;
        }
        .md-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          padding: 16px 24px;
          cursor: pointer;
          text-align: left;
          color: #000000;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          transition: background-color 0.2s ease;
        }
        .md-nav-row:hover {
          background-color: rgba(0, 0, 0, 0.01);
        }
        .md-nav-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          font-weight: 300;
          letter-spacing: 0.08em;
          line-height: 1.2;
        }
        .md-nav-row.uppercase .md-nav-label {
          text-transform: uppercase;
          font-weight: 400;
          letter-spacing: 0.12em;
        }
        .md-nav-row.capitalized .md-nav-label {
          text-transform: capitalize;
        }
        .md-arrow-icon {
          color: rgba(0, 0, 0, 0.35);
        }

        /* ══ FOOTER (Panel 1 Bottom) ══ */
        .md-panel-footer {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          background-color: #fafafa;
        }
        .md-footer-link {
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .md-footer-link:hover {
          color: #000000;
        }

        /* ══ CAMPAIGN CARD (Panels 2 & 3 Bottom) ══ */
        .md-panel-campaign {
          padding: 20px 24px 28px;
          background-color: #ffffff;
        }
        .md-campaign-card {
          display: block;
          width: 100%;
          text-decoration: none;
        }
        .md-campaign-img-wrap {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #fafafa;
        }
        .md-campaign-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .md-campaign-card:hover img {
          transform: scale(1.03);
        }
      `}</style>
    </>
  );
}
