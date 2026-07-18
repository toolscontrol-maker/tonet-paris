'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    image: '/hero/journal_garden_landscape_1.png',
    label: 'For Him',
    href: '/collection',
  },
  {
    image: '/hero/art_garden_landscape.png',
    label: 'For Her',
    href: '/collection',
  },
  {
    image: '/hero/world_garden_landscape.png',
    label: 'New In',
    href: '/collection',
  },
];

export default function FashionClient() {
  useEffect(() => {
    document.body.classList.add('fashion-page');
    return () => {
      document.body.classList.remove('fashion-page');
    };
  }, []);

  return (
    <>
      <style>{`
        body.fashion-page {
          padding-top: 0 !important;
        }

        /* ── Hero ───────────────────────────────────── */
        .fashion-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }

        .fashion-hero__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .fashion-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.55) 100%
          );
          pointer-events: none;
        }

        .fashion-hero__content {
          position: absolute;
          bottom: 56px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 2;
        }

        .fashion-hero__title {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 20px;
        }

        .fashion-hero__indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .fashion-hero__dash {
          width: 20px;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.35);
          border-radius: 1px;
          transition: background 0.3s ease;
        }

        .fashion-hero__dash--active {
          background: #fff;
          width: 28px;
        }

        /* ── Category Grid ──────────────────────────── */
        .fashion-grid {
          background: #000;
          padding: 8px 8px 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .fashion-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          display: block;
          text-decoration: none;
          cursor: pointer;
        }

        .fashion-card__image-wrapper {
          position: absolute;
          inset: 0;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .fashion-card:hover .fashion-card__image-wrapper {
          transform: scale(1.02);
        }

        .fashion-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fashion-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 60%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
        }

        .fashion-card__label {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: #fff;
          text-transform: uppercase;
          white-space: nowrap;
          z-index: 2;
        }

        /* ── Featured / Archive ─────────────────────── */
        .fashion-featured {
          position: relative;
          width: 100%;
          height: 75vh;
          overflow: hidden;
          background: #000;
        }

        .fashion-featured__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .fashion-featured__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 40%,
            rgba(0, 0, 0, 0.6) 100%
          );
          pointer-events: none;
        }

        .fashion-featured__content {
          position: absolute;
          bottom: 56px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 2;
        }

        .fashion-featured__title {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 24px;
        }

        .fashion-featured__link {
          display: inline-block;
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.14em;
          color: #fff;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          padding-bottom: 4px;
          transition: border-color 0.3s ease;
        }

        .fashion-featured__link:hover {
          border-color: #fff;
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 768px) {
          .fashion-grid {
            grid-template-columns: 1fr;
            padding: 6px;
            gap: 6px;
          }

          .fashion-card {
            aspect-ratio: 3 / 4;
          }

          .fashion-hero__title {
            font-size: 18px;
          }

          .fashion-hero__content {
            bottom: 40px;
          }

          .fashion-featured {
            height: 60vh;
          }

          .fashion-featured__title {
            font-size: 22px;
          }
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="fashion-hero">
        <Image
          src="/hero/collection_garden_landscape.png"
          alt="TONET — The Collection"
          fill
          priority
          sizes="100vw"
          className="fashion-hero__image"
        />
        <div className="fashion-hero__overlay" />
        <div className="fashion-hero__content">
          <h1 className="fashion-hero__title">The Collection</h1>
          <div className="fashion-hero__indicators">
            <span className="fashion-hero__dash" />
            <span className="fashion-hero__dash fashion-hero__dash--active" />
            <span className="fashion-hero__dash" />
          </div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────── */}
      <section className="fashion-grid">
        {categories.map((cat) => (
          <Link key={cat.label} href={cat.href} className="fashion-card">
            <div className="fashion-card__image-wrapper">
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="fashion-card__image"
              />
            </div>
            <div className="fashion-card__overlay" />
            <span className="fashion-card__label">{cat.label}</span>
          </Link>
        ))}
      </section>

      {/* ── Featured / Archive ────────────────────────── */}
      <section className="fashion-featured">
        <Image
          src="/hero/archive_garden_landscape.png"
          alt="The Archive — TONET"
          fill
          sizes="100vw"
          className="fashion-featured__image"
        />
        <div className="fashion-featured__overlay" />
        <div className="fashion-featured__content">
          <h2 className="fashion-featured__title">The Archive</h2>
          <Link href="/archive" className="fashion-featured__link">
            Discover
          </Link>
        </div>
      </section>
    </>
  );
}
