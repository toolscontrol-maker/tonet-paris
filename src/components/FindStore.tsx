'use client';
import Link from 'next/link';
export default function FindStore() {
  return (
    <>
      <Link href="/stores" className="find-store dark-section">
        <div className="find-store-img">
          <img
            src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=900&q=80"
            alt="Tienda Tonet Paris"
          />
        </div>
        <div className="find-store-content">
          <h2 className="find-store-title">Encuentra tu tienda</h2>
          <p className="find-store-desc">
            Visita una de nuestras tiendas para personalizaciones, sesiones de
            prueba y asesoramiento de expertos.
          </p>
          <span className="find-store-link">Encontrar tienda</span>
        </div>
      </Link>



      <style>{`
        .find-store {
          display: flex;
          flex-direction: row;
          background: #111;
          color: #fff;
          scroll-snap-align: start;
          height: 100vh;
          height: 100dvh;
          padding: 0 60px;
          padding-top: 70px;
          box-sizing: border-box;
          align-items: center;
          text-decoration: none;
          opacity: 1 !important;
          user-select: none;
        }
        .find-store:hover {
          opacity: 1 !important;
        }
        .find-store-img {
          width: 55%;
          flex-shrink: 0;
          order: 2;
        }
        .find-store-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .find-store-content {
          order: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 60px;
        }
        .find-store-title {
          font-family: 'DM Sans', serif;
          font-size: 28px;
          font-weight: 400;
          font-style: italic;
          margin: 0 0 20px;
          line-height: 1.3;
        }
        .find-store-desc {
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.7;
          color: rgba(255,255,255,0.75);
          margin: 0 0 28px;
          max-width: 340px;
        }
        .find-store-link {
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          text-decoration: underline;
          text-underline-offset: 3px;
          opacity: 1 !important;
        }


        @media (max-width: 767px) {
          .find-store {
            flex-direction: column;
            padding: 0;
            padding-top: 70px;
            align-items: stretch;
          }
          .find-store-img {
            width: 100%;
            order: 1;
            aspect-ratio: 4 / 3;
          }
          .find-store-content {
            order: 2;
            padding: 40px 24px 48px;
            justify-content: flex-start;
          }
          .find-store-title {
            font-size: 22px;
            margin-bottom: 14px;
          }
          .find-store-desc {
            font-size: 13px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </>
  );
}
