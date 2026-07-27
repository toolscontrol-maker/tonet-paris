import Link from "next/link";
import HomeSnapInitializer from "@/components/HomeSnapInitializer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TONET TORRENTINNI | Official Online Store",
  description: "Explore the TONET TORRENTINNI Pre-Fall 2026 Collection, Men's and Women's New Arrivals, and iconic California streetwear.",
};

export default async function Home() {
  return (
    <div className="am-home">
      <HomeSnapInitializer />

      {/* 1. HERO CAMPAIGN BANNER: PRE-FALL 2026 */}
      <section className="am-hero">
        <div className="am-hero-media">
          <img src="/hero-campaign.jpeg" alt="TONET Campaign" className="am-hero-img" />
          <div className="am-hero-bottom-content">
            <span className="am-hero-collection-title">PRE-FALL 2026</span>
            <div className="am-hero-buttons">
              <Link href="/collection/women" className="am-hero-btn">
                PARA ELLA
              </Link>
              <Link href="/collection/men" className="am-hero-btn">
                PARA ÉL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE WORLD OF TONET */}
      <section className="am-world-tonet-section">
        <h2 className="am-world-tonet-title">THE WORLD OF TONET</h2>
        <div className="am-world-tonet-grid">
          <div className="am-world-tonet-col">
            <div className="am-world-tonet-media" style={{ backgroundColor: '#3a0610' }}>
            </div>
            <div className="am-world-tonet-overlay">
              <div className="am-world-tonet-hover-content">
                <span className="am-world-tonet-label">ABOUT</span>
                <div className="am-world-tonet-sublinks">
                  <Link href="/about" className="am-world-tonet-sublink">ABOUT TONET</Link>
                  <Link href="/careers" className="am-world-tonet-sublink">CAREERS</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="am-world-tonet-col">
            <div className="am-world-tonet-media" style={{ backgroundColor: '#351607' }}>
            </div>
            <div className="am-world-tonet-overlay">
              <div className="am-world-tonet-hover-content">
                <span className="am-world-tonet-label">COLLECTIONS</span>
                <div className="am-world-tonet-sublinks">
                  <Link href="/collection/all" className="am-world-tonet-sublink">VIEW ALL</Link>
                  <Link href="/collection/campaigns" className="am-world-tonet-sublink">CAMPAIGNS</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="am-world-tonet-col">
            <div className="am-world-tonet-media">
              <img 
                src="/stores-bg.jpg" 
                alt="Stores" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div className="am-world-tonet-overlay">
              <div className="am-world-tonet-hover-content">
                <span className="am-world-tonet-label">STORES</span>
                <div className="am-world-tonet-sublinks">
                  <Link href="/stores" className="am-world-tonet-sublink">STORE LOCATOR</Link>
                  <Link href="/stores" className="am-world-tonet-sublink">STOCKISTS</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        html.home-snap-active {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }
        html.home-snap-active footer {
          scroll-snap-align: end;
        }

        .am-home {
          background-color: #ffffff;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          width: 100%;
        }

        /* ── HERO ── */
        .am-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000000;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-hero-media {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
        }
        .am-hero-media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0.6) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .am-hero-bottom-content {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 3;
          width: 100%;
          max-width: 600px;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .am-hero-collection-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          text-transform: uppercase;
        }
        .am-hero-buttons {
          display: flex;
          gap: 16px;
          width: 100%;
          justify-content: center;
        }
        .am-hero-btn {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 14px 36px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background-color 0.3s, border-color 0.3s, transform 0.2s;
          cursor: pointer;
          border-radius: 0; /* Rectangular Borders Rule */
          display: inline-block;
          text-align: center;
          min-width: 140px;
        }
        .am-hero-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.8);
        }
        @media (max-width: 768px) {
          .am-hero-bottom-content {
            bottom: 48px;
            gap: 12px;
          }
          .am-hero-btn {
            padding: 12px 24px;
            font-size: 10px;
            min-width: 120px;
          }
        }
        .am-hero-center-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: none;
        }
        .am-hero-logo-text {
          font-family: 'Saint Carell', sans-serif;
          font-size: 80px;
          font-weight: 300;
          color: #ffffff;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .am-hero-logo-text {
            font-size: 48px;
          }
        }
        .am-hero-logo-wrap {
          background: #000000;
          padding: 24px;
          border: 1px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
        }
        .am-hero-logo {
          width: 120px;
          height: 120px;
          object-fit: contain;
          filter: invert(1);
        }
        /* Grid styles removed */
        .am-hero-img,
        .am-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-hero-overlay {
          position: absolute;
          inset: 0;
          background: transparent;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 60px 48px;
          z-index: 3;
        }
        .am-hero-feeling-block {
          display: inline-block;
          border: 1px solid #ffffff;
          background-color: transparent;
          color: #ffffff;
          padding: 18px 44px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-align: center;
          text-transform: uppercase;
          text-decoration: none;
          transition: background-color 0.3s, color 0.3s, opacity 0.3s;
        }
        .am-hero-feeling-block:hover {
          background-color: #ffffff;
          color: #000000;
        }
        .am-hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .am-hero-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 36px;
          font-weight: 300;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .am-hero-cta {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.3s;
        }
        .am-hero-cta:hover {
          opacity: 0.7;
        }

        /* ── SECTION TITLE ── */
        .am-section-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-align: center;
          margin: 0 0 40px;
          text-transform: uppercase;
          color: #000000;
        }

        /* ── SPLIT ARRIVALS ── */
        .am-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          border-bottom: 1px solid #eaeaea;
          height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        @media (min-width: 768px) {
          .am-split-grid {
            grid-template-columns: repeat(var(--cols, 2), 1fr);
          }
        }
        .am-split-col {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        @media (min-width: 768px) {
          .am-split-col:not(:last-child) {
            border-right: 1px solid #eaeaea;
          }
        }
        .am-split-media {
          width: 100%;
          flex: 1 1 auto;
          overflow: hidden;
          background: #e3e7ec;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .am-split-logo-wrap {
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .am-split-logo {
          width: 80px;
          height: 80px;
        }
        .am-split-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-split-content {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          flex: 0 0 auto;
        }
        .am-split-title {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
          color: #000000;
        }
        .am-split-cta {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .am-split-cta:hover {
          opacity: 0.6;
        }

        /* ── LANDSCAPE ── */
        .am-landscape {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #ffffff;
          border-bottom: 1px solid #eaeaea;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-landscape-media {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: #0a192f;
        }
        .am-landscape-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .am-landscape-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 48px;
          z-index: 10;
        }
        .am-landscape-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .am-landscape-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 28px;
          font-weight: 300;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .am-landscape-cta {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .am-landscape-cta:hover {
          opacity: 0.7;
        }

        /* ── THE WORLD OF TONET ── */
        .am-world-tonet-section {
          padding: 80px 48px;
          height: 100vh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .am-world-tonet-title {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-align: center;
          margin: 0 0 50px 0;
          text-transform: uppercase;
          color: #000000;
        }
        .am-world-tonet-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .am-world-tonet-col {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .am-world-tonet-media {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #fcfcfc;
          transition: filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
        }
        .am-world-tonet-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.6s ease;
        }
        .am-world-tonet-col:hover .am-world-tonet-overlay {
          background-color: rgba(0, 0, 0, 0.35);
        }
        .am-world-tonet-col:hover .am-world-tonet-media {
          filter: blur(6px) brightness(0.5);
        }
        .am-world-tonet-hover-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .am-world-tonet-label {
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          pointer-events: none;
          display: block;
          text-align: center;
        }
        .am-world-tonet-sublinks {
          opacity: 0;
          visibility: hidden;
          max-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: opacity 0.4s ease, max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.4s, margin-top 0.4s;
          margin-top: 0;
          width: 100%;
        }
        .am-world-tonet-col:hover .am-world-tonet-sublinks {
          opacity: 1;
          visibility: visible;
          max-height: 100px;
          margin-top: 20px;
        }
        .am-world-tonet-sublink {
          color: rgba(255, 255, 255, 0.7);
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.3s;
          display: block;
          text-align: center;
        }
        .am-world-tonet-sublink:hover {
          color: #ffffff;
        }

        /* ── MOBILE OVERRIDES ── */
        @media (max-width: 767px) {
          .am-hero {
            height: 100vh;
          }
          .am-hero-overlay {
            padding: 40px 20px;
          }
          .am-hero-title {
            font-size: 26px;
          }
          .am-split-grid {
            grid-template-columns: 1fr;
            height: auto;
            scroll-snap-align: none;
            scroll-snap-stop: none;
            border-bottom: none;
          }
          .am-split-col {
            height: 100vh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
          .am-split-col:not(:last-child) {
            border-bottom: 1px solid #eaeaea;
          }
          .am-split-content {
            padding: 24px 16px;
          }
          .am-split-title {
            font-size: 12px;
          }
          .am-landscape {
            height: 100vh;
          }
          .am-landscape-overlay {
            padding: 32px 20px;
          }
          .am-landscape-title {
            font-size: 22px;
          }
          .am-world-tonet-section {
            padding: 80px 0;
            height: 100vh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
          .am-world-tonet-title {
            margin-bottom: 40px;
            font-size: 13px;
            padding: 0 20px;
          }
          .am-world-tonet-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 16px;
            padding: 0 40px;
            scrollbar-width: none;
            width: 100%;
            box-sizing: border-box;
          }
          .am-world-tonet-grid::-webkit-scrollbar {
            display: none;
          }
          .am-world-tonet-col {
            flex: 0 0 75%;
            scroll-snap-align: center;
            height: auto;
          }
          .am-world-tonet-media {
            filter: blur(4px) brightness(0.6);
            aspect-ratio: 1 / 1;
          }
          .am-world-tonet-overlay {
            background-color: rgba(0, 0, 0, 0.25);
          }
          .am-world-tonet-sublinks {
            opacity: 1;
            visibility: visible;
            max-height: 100px;
            margin-top: 16px;
          }
          
          /* Active feedbacks */
          .am-prod-card:active,
          .am-split-cta:active,
          .am-hero-feeling-block:active,
          .am-hero-cta:active,
          .am-landscape-cta:active,
          .am-world-tonet-sublink:active {
            opacity: 0.5;
          }
        }
      `}</style>

    </div>
  );
}
