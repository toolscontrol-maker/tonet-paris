"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ANNOUNCEMENTS = [
  "PRE FALL-WINTER COLLECTION LIVE NOW"
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [fadeState, setFadeState] = useState("in");
  const pathname = usePathname();
  const [isAtTop, setIsAtTop] = useState(true);

  // Check if dismissed previously
  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed") === "true";
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  // Cycle announcements
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setFadeState("in");
      }, 400); // duration of fade-out
    }, 4000); // slide interval

    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
    window.dispatchEvent(new Event("announcement-dismissed"));
  };

  if (!visible || pathname.startsWith("/product/")) return null;

  return (
    <div className="ann-bar">
      <div className={`ann-content ann-fade-${fadeState}`}>
        {ANNOUNCEMENTS[index]}
      </div>
      <button className="ann-close" onClick={handleDismiss} aria-label="Dismiss announcement">
        ✕
      </button>

      <style>{`
        .ann-bar {
          height: 40px;
          background-color: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 600;
          font-family: 'Erode', var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: lowercase !important;
          padding: 0 40px;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ann-content {
          text-align: center;
          transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: lowercase !important;
        }
        .ann-fade-in {
          opacity: 0.95;
          transform: translateY(0);
        }
        .ann-fade-out {
          opacity: 0;
          transform: translateY(-4px);
        }
        .ann-close {
          position: absolute;
          right: 20px;
          background: none;
          border: none;
          color: #ffffff;
          opacity: 0.45;
          cursor: pointer;
          font-size: 11px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
          outline: none;
        }
        .ann-close:hover {
          opacity: 0.95;
        }
        @media (max-width: 767px) {
          .ann-bar {
            font-size: 9px;
            letter-spacing: 0.12em;
            padding: 0 32px 0 16px;
          }
          .ann-close {
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
}
