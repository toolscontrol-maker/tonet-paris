import Link from 'next/link';
import { getCollections } from '@/lib/shopify';
import HeroSection from '@/components/HeroSection';

export default async function Home() {
  const collections = await getCollections(20);

  return (
    <>
      {/* ─── HERO: randomized images from /public/hero/ ─── */}
      <HeroSection />

      {/* ─── COLLECTIONS SECTION ─── */}
      <section className="shop-section" id="gallery">
        <div className="shop-grid">
          {collections.map((col) => (
            <Link
              key={col.handle}
              href={`/collection/${col.handle}`}
              className="shop-col shop-col-link"
            >
              <div className="shop-col-label">
                {col.title}<span className="shop-now-suffix"> › SHOP NOW</span>
              </div>
              {col.imageUrl && (
                <div className="shop-product shop-product--collection">
                  <div className="shop-product-img">
                    <img src={col.imageUrl} alt={col.title} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════════
           HERO — 2 blocks of 125vh, Tonet Studios style
        ═══════════════════════════════════════════════════ */

        .hero-wrapper {
          display: flex;
          flex-direction: column;
        }

        .hero-block {
          position: relative;
          height: 125vh;
          overflow: hidden;
          contain: paint;
        }

        .hero-block--split { display: flex; }
        .hero-block--full  { display: flex; }

        .hero-panel {
          flex: 1;
          display: block;
          position: relative;
          background-size: cover;
          background-position: center top;
          text-decoration: none;
          transition: filter 0.4s ease, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          will-change: transform;
          transform: translateZ(0);
        }

        .hero-panel:hover {
          filter: brightness(0.88);
          transform: scale(1.03) translateZ(0);
        }

        .shop-label {
          position: absolute;
          top: 120px;
          left: 20px;
          color: rgba(255,255,255,0.92);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          z-index: 10;
        }

        /* Sticky brand anchor */
        .hero-brand-anchor {
          position: sticky;
          top: 50vh;
          height: 0;
          overflow: visible;
          z-index: 6;
          pointer-events: none;
        }

        .hero-brand-text {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          font-size: clamp(3rem, 10vw, 13rem);
          font-weight: 600;
          color: #000;
          white-space: nowrap;
          letter-spacing: -0.055em;
          pointer-events: none;
        }

        .hero-block--split .hero-panel + .hero-panel {
          border-left: 1px solid rgba(255,255,255,0.12);
        }

        /* ═══════════════════════════════════════════════════
           PRODUCT SECTION — 4 columns, Tonet Studios style
        ═══════════════════════════════════════════════════ */

        .shop-section {
          background: #f0f0f0;
          position: relative;
          z-index: 10;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .shop-col {}
        .shop-col-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .shop-col-link:hover { opacity: 1; }
        .shop-product--collection { cursor: pointer; }

        .shop-col-label {
          position: relative;
          padding: 12px 16px;
          font-size: 0.82rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #000;
          text-align: left;
          white-space: nowrap;
        }

        .shop-now-suffix {
          display: none;
        }

        .shop-col:hover .shop-now-suffix {
          display: inline;
        }

        .shop-product {
          display: block;
          padding: 48px 15% 32px;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .shop-product:hover {
          background: #e8e8e8;
        }

        /* Image wrapper: portrait 3:4 ratio, float-like appearance */
        .shop-product-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .shop-product-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;   /* show full product, floating look */
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shop-product:hover .shop-product-img img {
          transform: scale(1.04);
        }



        .shop-col-empty {
          height: 400px;
        }

        /* ═══════════════════════════════════════════════════
           MOBILE — 2 columns, labels not sticky
        ═══════════════════════════════════════════════════ */
        @media (max-width: 767px) {
          /* Hero */
          .hero-block { height: auto; }
          .hero-block--split { flex-direction: column; }
          .hero-block--split .hero-panel { height: 125vw; flex: none; }
          .hero-block--full  .hero-panel { height: 125vw; }
          .hero-brand-text { font-size: 13vw; }
          .shop-label { top: 80px; }

          /* Shop grid: 2 columns */
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .shop-col-label {
            font-size: 0.6875rem;
            padding: 10px 12px;
          }

          .shop-product {
            padding: 24px 10% 20px;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}
