'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

function archiveId(handle: string): string {
  const n = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `TNT-${String((n % 9000) + 1000).padStart(4, '0')}`;
}

function timeRemaining(addedAt: number | undefined): { text: string; expired: boolean } {
  if (!addedAt) return { text: 'Active', expired: false };
  const elapsed = Date.now() - addedAt;
  const h48 = 48 * 3600 * 1000;
  if (elapsed >= h48) return { text: 'Expired', expired: true };
  const rem = h48 - elapsed;
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  if (h > 0) return { text: `${h}h remaining`, expired: false };
  return { text: `${m}m remaining`, expired: false };
}

function formatAdded(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();
}

export default function WishlistClient() {
  const { items, remove } = useWishlist();
  const [, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <div className="pa-wrap">

        {/* ── Header */}
        <div className="pa-header">
          <span className="pa-supra">Tonet</span>
          <h1 className="pa-title">Personal Archive</h1>
          <p className="pa-desc">
            A temporary collection of pieces retained for future consideration.
            <br />
            Items remain archived for 48 hours.
          </p>
        </div>

        {/* ── Empty state */}
        {items.length === 0 ? (
          <div className="pa-empty">
            <span className="pa-empty-title">Your archive is empty.</span>
            <p className="pa-empty-sub">
              Browse the collection and add pieces to build your personal archive.
            </p>
            <Link href="/collection" className="pa-browse">Browse the Collection</Link>
          </div>
        ) : (
          <div className="pa-entries">
            {items.map((item) => {
              const id = archiveId(item.handle);
              const { text: remaining, expired } = timeRemaining(item.addedAt);
              return (
                <div key={item.handle} className={`pa-entry${expired ? ' pa-entry--expired' : ''}`}>

                  {/* Image */}
                  <Link href={`/product/${item.handle}`} className="pa-img-link">
                    <div className={`pa-img-wrap ${(item as any).isManual || item.imageUrl.startsWith('/products/') ? 'tonet-custom-slide-fill' : ''}`}>
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className={`pa-img ${(item as any).isManual || item.imageUrl.startsWith('/products/') ? 'tonet-custom-img-fill' : ''}`} 
                        />
                      )}
                    </div>
                  </Link>

                  {/* Catalogue data */}
                  <div className="pa-data">
                    <div className="pa-data-top">
                      <span className="pa-id">{id}</span>
                      {item.collectionTitle && (
                        <span className="pa-collection">{item.collectionTitle.toUpperCase()}</span>
                      )}
                    </div>

                    <Link href={`/product/${item.handle}`} className="pa-title-link">
                      <h2 className="pa-piece-title">{item.title.toUpperCase()}</h2>
                    </Link>

                    <div className="pa-fields">
                      <div className="pa-field">
                        <span className="pa-field-label">Added</span>
                        <span className="pa-field-value">{formatAdded(item.addedAt)}</span>
                      </div>
                      <div className="pa-field">
                        <span className="pa-field-label">Duration</span>
                        <span className={`pa-field-value${expired ? ' pa-field-expired' : ''}`}>
                          {remaining}
                        </span>
                      </div>
                      <div className="pa-field">
                        <span className="pa-field-label">Status</span>
                        <span className={`pa-status${expired ? ' pa-status--expired' : ''}`}>
                          {expired ? 'Expired' : 'Available'}
                        </span>
                      </div>
                    </div>

                    <button className="pa-remove" onClick={() => remove(item.handle)}>
                      Remove from Archive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        /* ═══════════════════════════════════════
           TONET — PERSONAL ARCHIVE
        ═══════════════════════════════════════ */
        html, body { background: #0c0c0c !important; }

        .pa-wrap {
          min-height: 100vh;
          background: #0c0c0c;
          padding: 130px 48px 120px;
          box-sizing: border-box;
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.7);
        }

        /* Header */
        .pa-header {
          max-width: 560px;
          margin: 0 auto 88px;
          text-align: center;
          padding-bottom: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pa-supra {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          margin-bottom: 28px;
          padding-right: 0.55em;
        }
        .pa-title {
          font-family: var(--font-brand);
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 300;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.7);
          margin: 0 0 28px;
          padding-right: 0.18em;
        }
        .pa-desc {
          font-size: 10px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.2);
          margin: 0;
        }

        /* Empty */
        .pa-empty {
          max-width: 440px;
          margin: 80px auto;
          text-align: center;
        }
        .pa-empty-title {
          display: block;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 16px;
        }
        .pa-empty-sub {
          font-size: 10px;
          font-weight: 300;
          line-height: 2;
          color: rgba(255,255,255,0.16);
          margin: 0 0 44px;
        }
        .pa-browse {
          display: inline-block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 6px;
          transition: color 0.35s, border-color 0.35s;
        }
        .pa-browse:hover { color: rgba(255,255,255,0.55); border-bottom-color: rgba(255,255,255,0.3); }

        /* Entries */
        .pa-entries {
          max-width: 860px;
          margin: 0 auto;
        }
        .pa-entry {
          display: grid;
          grid-template-columns: 108px 1fr;
          gap: 44px;
          padding: 44px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: opacity 0.4s;
        }
        .pa-entry:first-child { border-top: 1px solid rgba(255,255,255,0.05); }
        .pa-entry--expired { opacity: 0.38; }

        /* Image */
        .pa-img-link { display: block; text-decoration: none; }
        .pa-img-wrap {
          width: 108px;
          aspect-ratio: 3 / 4;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          overflow: hidden;
        }
        .pa-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
          display: block;
          filter: grayscale(0.1);
          transition: filter 0.4s;
        }
        .pa-img-wrap:hover .pa-img { filter: grayscale(0); }

        /* Data column */
        .pa-data {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 22px;
          padding: 2px 0;
        }
        .pa-data-top { display: flex; flex-direction: column; gap: 5px; }
        .pa-id {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.48em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          padding-right: 0.48em;
        }
        .pa-collection {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
        }

        .pa-title-link { text-decoration: none; }
        .pa-piece-title {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.68);
          margin: 0;
          line-height: 1.6;
          transition: color 0.3s;
        }
        .pa-title-link:hover .pa-piece-title { color: rgba(255,255,255,0.92); }

        /* Fields */
        .pa-fields {
          display: flex;
          gap: 44px;
          flex-wrap: wrap;
        }
        .pa-field { display: flex; flex-direction: column; gap: 6px; }
        .pa-field-label {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          padding-right: 0.42em;
        }
        .pa-field-value {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.4);
        }
        .pa-field-expired { color: rgba(255,255,255,0.18) !important; }

        .pa-status {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          padding-right: 0.35em;
        }
        .pa-status--expired { color: rgba(255,255,255,0.16); }

        /* Remove */
        .pa-remove {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: var(--font-primary);
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          text-decoration: underline;
          text-underline-offset: 3px;
          align-self: flex-start;
          transition: color 0.3s;
        }
        .pa-remove:hover { color: rgba(255,255,255,0.35); }

        @media (max-width: 767px) {
          .pa-wrap { padding: 100px 24px 80px; }
          .pa-header { margin-bottom: 60px; padding-bottom: 48px; }
          .pa-entry { grid-template-columns: 84px 1fr; gap: 22px; padding: 32px 0; }
          .pa-img-wrap { width: 84px; }
          .pa-fields { gap: 24px; }
          .pa-piece-title { font-size: 10px; letter-spacing: 0.14em; }
        }
      `}</style>
    </>
  );
}
