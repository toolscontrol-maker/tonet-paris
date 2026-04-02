"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

export default function MenuDrawer() {
  const { isMenuOpen, closeMenu } = useUI();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <>
      <div className={`md-backdrop ${isMenuOpen ? "open" : ""}`} aria-hidden="true" />
      
      <div className={`md-drawer ${isMenuOpen ? "open" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">
        
        {/* HEADER */}
        <div className="md-header">
          <Link href="/" className="md-brand" onClick={closeMenu}>TONISTUDIOS.COM</Link>
          <button className="md-close" onClick={closeMenu} aria-label="Close menu">
            X CLOSE
          </button>
        </div>

        {/* LIST */}
        <div className="md-content">
          
          <button className="md-item justify-between" onClick={closeMenu}>
            <span>SEARCH</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>

          <Link href="#" className="md-item justify-between" onClick={closeMenu}>
            <span>WOMAN</span>
            <span className="md-arrow">&gt;</span>
          </Link>
          
          <Link href="#" className="md-item justify-between" onClick={closeMenu}>
            <span>MAN</span>
            <span className="md-arrow">&gt;</span>
          </Link>
          
          <Link href="#" className="md-item justify-between" onClick={closeMenu}>
            <span>BAGS</span>
            <span className="md-arrow">&gt;</span>
          </Link>
          
          <Link href="#" className="md-item" onClick={closeMenu}>
            <span>RUNWAY</span>
          </Link>

          <div className="md-spacer"></div>

          <Link href="#" className="md-item justify-between" onClick={closeMenu}>
            <span>WISHLIST</span>
            <span className="flex-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              2
            </span>
          </Link>

          <Link href="/login" className="md-item justify-between" onClick={closeMenu}>
            <span>ACCOUNT</span>
            <span className="md-arrow">&gt;</span>
          </Link>

          <Link href="#" className="md-item" onClick={closeMenu}>
            <span>STORES</span>
          </Link>

          <Link href="#" className="md-item" onClick={closeMenu}>
            <span>SHIPPING TO SPAIN (ENGLISH)</span>
          </Link>

          <div className="md-spacer"></div>

          <Link href="#" className="md-item justify-between" onClick={closeMenu}>
            <span>HELP</span>
            <span className="md-arrow">&gt;</span>
          </Link>

          <div className="md-spacer-small"></div>

          <div className="md-info-block">
            <strong>LIVE CHAT <span className="muted">OFFLINE</span></strong>
            <p>Monday to Saturday, 9am to 6pm CET</p>
          </div>

          <div className="md-info-block border-none">
            <strong>CALL <span className="muted">OFFLINE</span></strong>
            <p>+46 10 888 73 05</p>
            <p>Monday to Saturday, 9am to 6pm CET</p>
          </div>

        </div>

      </div>

      <style>{`
        .md-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
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
          width: 90vw;
          max-width: 440px;
          background: #fff;
          color: #000;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 1px solid #111;
        }
        @media(max-width: 440px) {
          .md-drawer {
            width: 100vw;
            border-right: none;
          }
        }

        .md-drawer.open {
          transform: translateX(0);
        }

        .md-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #111;
          font-family: Arial, sans-serif;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .md-brand {
          font-weight: 500;
          text-decoration: none;
          color: #000;
        }

        .md-close {
          background: none;
          border: none;
          color: #0000ee;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .md-content {
          display: flex;
          flex-direction: column;
        }

        .md-item {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid #e4e4e4;
          font-family: Arial, sans-serif;
          font-size: 11.5px;
          color: #000;
          text-decoration: none;
          background: #fff;
          border-left: none;
          border-right: none;
          border-top: none;
          text-align: left;
          cursor: pointer;
          width: 100%;
        }

        .justify-between {
          justify-content: space-between;
        }

        .flex-center {
          display: flex;
          align-items: center;
        }

        .gap-1 {
          gap: 4px;
        }

        .md-arrow {
          font-family: monospace;
          color: #000;
        }

        .md-spacer {
          height: 18px;
          border-bottom: 1px solid #e4e4e4;
        }

        .md-spacer-small {
          height: 8px;
        }

        .md-info-block {
          padding: 16px 20px;
          border-bottom: 1px solid #e4e4e4;
          font-family: Arial, sans-serif;
          font-size: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .border-none {
          border-bottom: none;
        }

        .md-info-block strong {
          font-weight: 500;
          font-size: 10.5px;
        }

        .md-info-block p {
          margin: 0;
          color: #333;
        }

        .muted {
          color: #888;
          margin-left: 4px;
        }
      `}</style>
    </>
  );
}
