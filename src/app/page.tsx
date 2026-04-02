import Link from 'next/link';
import { getProducts } from '@/lib/shopify';

export default async function Home() {
  const products = await getProducts();

  // Split products into 4 category columns (round-robin)
  const categories = [
    { name: 'ARTE FÍSICO', slug: 'arte-fisico' },
    { name: 'ARTE DIGITAL', slug: 'arte-digital' },
    { name: 'ESCULTURAS', slug: 'esculturas' },
    { name: 'FIGURAS', slug: 'figuras' },
  ];

  const cols = categories.map((cat, i) => ({
    ...cat,
    products: products.filter((_, idx) => idx % 4 === i),
  }));

  return (
    <>
      {/* ─── HERO: 3 stacked blocks of 125vh each, Acne Studios style ─── */}
      <div className="hero-wrapper">

        {/*
          Sticky anchor: FIRST child. top:50vh → the anchor pins at the
          viewport centre. Text is centered ON the anchor with translate(-50%,-50%).
          When hero-wrapper exits the viewport the anchor travels with it.
        */}
        <div className="hero-brand-anchor" aria-hidden="true">
          <div className="hero-brand-text">Toni Studios</div>
        </div>

        {/* ── Block 1: Split 2 images ── */}
        <div className="hero-block hero-block--split">
          <Link href="#" className="hero-panel" style={{ backgroundImage: "url('/img-hero-new-1.png')" }}>
            <span className="shop-label">SHOP NEW COLLECTION</span>
          </Link>
          <Link href="#" className="hero-panel" style={{ backgroundImage: "url('/img-hero-new-2.png')" }}>
            <span className="shop-label">SHOP LAST COLLECTIONS</span>
          </Link>
        </div>

        {/* ── Block 2: Single full-width image ── */}
        <div className="hero-block hero-block--full">
          <Link href="#" className="hero-panel" style={{ backgroundImage: "url('/hero-1.webp')" }}>
            <span className="shop-label">SHOP THE LOOK</span>
          </Link>
        </div>

        {/* ── Block 3: Split 2 images ── */}
        <div className="hero-block hero-block--split">
          <Link href="#" className="hero-panel" style={{ backgroundImage: "url('/hero-2.webp')" }}>
            <span className="shop-label">NEW ARRIVALS</span>
          </Link>
          <Link href="#" className="hero-panel" style={{ backgroundImage: "url('/hero-1.webp')" }}>
            <span className="shop-label">CURATED SELECTION</span>
          </Link>
        </div>

      </div>

      {/* ─── PRODUCTS SECTION (arriba) — productos individuales, label NO sticky ─── */}
      <section className="shop-section shop-section--products" id="gallery">
        <div className="shop-grid">
          {products.map((product) => (
            <div className="shop-col" key={product.id}>

              {/* Static label (no sticky) */}
              <div className="shop-col-label shop-col-label--static">
                SHOP NOW
              </div>

              {/* Single product card */}
              <Link href={`/product/${product.id}`} className="shop-product shop-product--detail">
                <div className="shop-product-img">
                  <img src={product.imageUrl} alt={product.title} />
                </div>
                <div className="shop-product-meta">
                  <span className="shop-product-name">{product.title}</span>
                  <span className="shop-product-price">${product.price}</span>
                </div>
              </Link>

            </div>
          ))}
        </div>
      </section>

      {/* ─── COLLECTIONS SECTION (abajo) — categorías, label STICKY ─── */}
      <section className="shop-section shop-section--collections">
        <div className="shop-grid">
          {cols.map((col) => (
            <div className="shop-col" key={col.name}>

              {/* Sticky category label */}
              <div className="shop-col-label">
                {col.name} &rsaquo; SHOP NOW
              </div>

              {/* Products in this column */}
              {col.products.length > 0 ? (
                col.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="shop-product"
                  >
                    <div className="shop-product-img">
                      <img src={product.imageUrl} alt={product.title} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="shop-col-empty" />
              )}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════════
           HERO — 3 blocks of 125vh, Acne Studios style
        ═══════════════════════════════════════════════════ */

        .hero-wrapper {
          display: flex;
          flex-direction: column;
        }

        .hero-block {
          position: relative;
          height: 125vh;
          overflow: hidden;
        }

        .hero-block--split { display: flex; }
        .hero-block--full  { display: flex; }

        .hero-panel {
          flex: 1;
          display: block;
          position: relative;
          background-size: cover;
          background-position: center;
          text-decoration: none;
          transition: filter 0.4s ease;
          overflow: hidden;
        }

        .hero-panel:hover { filter: brightness(0.88); }

        .hero-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          background-size: cover;
          background-position: center;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-panel:hover::before { transform: scale(1.03); }

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
           PRODUCT SECTION — 4 columns, Acne Studios style
        ═══════════════════════════════════════════════════ */

        .shop-section {
          background: #f5f5f5;
          border-top: 1px solid #e4e4e4;
          /* Ensure this stacks on top so hero brand text disappears under it */
          position: relative;
          z-index: 10;
        }

        /* 4 equal columns with left border on section + right border on each col */
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-left: 1px solid #e4e4e4;
        }

        .shop-col {
          border-right: 1px solid #e4e4e4;
          /* min-height so empty cols look intentional */
          min-height: 80vh;
        }

        /* ── Sticky category label ── */
        .shop-col-label {
          position: sticky;
          top: 80px;
          padding: 14px 16px;
          font-size: 0.76rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #000;
          text-align: center;
          z-index: 4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Product card inside a column ── */
        .shop-product {
          display: block;
          padding: 48px 15% 32px;
          text-decoration: none;
          border-bottom: 1px solid #e4e4e4;
          transition: background 0.2s ease;
        }

        .shop-product:hover {
          background: #ebebeb;
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



        /* Empty column: leave space */
        .shop-col-empty {
          height: 400px;
        }

        /* Section separator */
        .shop-section--collections {
          border-top: 1px solid #e4e4e4;
        }

        /* Label overide: NOT sticky in products section */
        .shop-col-label--static {
          position: relative;
          top: 0;
        }

        /* Product name + price (product section only) */
        .shop-product--detail .shop-product-meta {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }

        .shop-product-name {
          font-size: 12.5px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: #111;
          display: block;
        }

        .shop-product-price {
          font-size: 12.5px;
          color: #666;
          display: block;
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

          /* Labels: not sticky on mobile */
          .shop-col-label {
            position: relative;
            top: 0;
            font-size: 0.55rem;
            padding: 10px 12px;
          }

          .shop-product {
            padding: 24px 10% 20px;
          }

          .shop-product-name,
          .shop-product-price {
            font-size: 9.5px;
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
