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
                    <img src={col.imageUrl} alt={col.title} loading="lazy" decoding="async" />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        /* Scroll-snap at page level for homepage — mandatory snapping */
        html {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }

        /* ═══════════════════════════════════════════════════
           PRODUCT SECTION — 4 columns, Tonet Paris style
        ═══════════════════════════════════════════════════ */

        .shop-section {
          background: #ffffff;
          position: relative;
          z-index: 10;
          scroll-snap-align: start;
          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .shop-grid {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }
        .shop-grid::-webkit-scrollbar {
          display: none;
        }

        .shop-col {
          flex: 0 0 25vw;
          width: 25vw;
          scroll-snap-align: start;
        }
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
          .shop-col {
            flex: 0 0 75vw;
            width: 75vw;
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
          .shop-col {
            flex: 0 0 50vw;
            width: 50vw;
          }
        }
      `}</style>
    </>
  );
}
