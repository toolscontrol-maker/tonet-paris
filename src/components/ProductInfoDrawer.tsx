"use client";

import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  heroImage?: string;
  children: React.ReactNode;
}

export default function ProductInfoDrawer({ isOpen, onClose, title, heroImage, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`pid-backdrop${isOpen ? " open" : ""}`} onClick={onClose} />
      <div className={`pid-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="pid-header">
          <span className="pid-title">{title}</span>
          <button className="pid-close" onClick={onClose}>X CLOSE</button>
        </div>
        {heroImage && (
          <div className="pid-hero">
            <img src={heroImage} alt={title} />
          </div>
        )}
        <div className="pid-body">{children}</div>
      </div>

      <style>{`
        .pid-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.28);
          z-index: 1100;
          opacity: 0; pointer-events: none;
          transition: opacity 0.18s ease;
        }
        .pid-backdrop.open { opacity: 1; pointer-events: auto; }

        .pid-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 380px; max-width: 100%;
          background: #FAF8F5;
          z-index: 1101;
          transform: translateX(100%);
          transition: transform 0.22s ease;
          display: flex; flex-direction: column;
          border-left: 1px solid #d0d0d0;
          font-family: Arial, Helvetica, sans-serif;
          overflow-y: auto;
        }
        .pid-drawer.open { transform: translateX(0); }

        .pid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #111;
          flex-shrink: 0;
        }
        .pid-title {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #111;
        }
        .pid-close {
          background: none; border: none;
          font-family: inherit;
          font-size: 11px; font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0033bb; cursor: pointer;
          padding: 0;
        }
        .pid-close:hover { text-decoration: underline; }

        .pid-hero {
          width: 100%;
          flex-shrink: 0;
          background: #f5f5f5;
        }
        .pid-hero img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        .pid-body {
          padding: 20px 16px;
          font-size: 12px;
          line-height: 1.75;
          color: #222;
        }
      `}</style>
    </>
  );
}
