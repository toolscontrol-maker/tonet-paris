'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useLocale } from '@/context/LocaleContext';
import { useTranslation } from '@/lib/i18n';

export default function WishlistClient() {
  const { items, remove } = useWishlist();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();

  return (
    <>
      <div className="wl-wrap">
        {/* Tabs */}
        <nav className="wl-tabs">
          <Link href="/account" className="wl-tab">{t('wishlist.account')}</Link>
          <Link href="/account/orders" className="wl-tab">{t('wishlist.orders')}</Link>
          <Link href="/account/information" className="wl-tab">{t('wishlist.myInfo')}</Link>
          <Link href="/wishlist" className="wl-tab wl-tab--active">{t('wishlist.tabTitle')}</Link>
        </nav>

        <h1 className="wl-title">{t('wishlist.title')}</h1>
        <p className="wl-subtitle"><Link href="/login" className="wl-signin">{t('wishlist.signIn')}</Link> {t('wishlist.subtitleRest')}</p>

        {items.length === 0 ? (
          <p className="wl-empty">{t('wishlist.empty')}</p>
        ) : (
          <div className="wl-grid">
            {items.map((item) => (
              <div key={item.handle} className="wl-card">
                <button
                  className="wl-remove"
                  onClick={() => remove(item.handle)}
                  aria-label="Remove"
                >
                  X {t('wishlist.remove')}
                </button>

                <Link href={`/product/${item.handle}`} className="wl-card-link">
                  <div className="wl-img-wrap">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="wl-img" />
                    )}
                  </div>
                  <div className="wl-meta">
                    <span className="wl-name">{item.title}</span>
                    <span className="wl-price">{formatPrice(item.price, item.currencyCode)}</span>
                    {item.collectionTitle && (
                      <span className="wl-collection">{item.collectionTitle}</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .wl-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          font-family: 'Creato Display', sans-serif;
          font-size: 11px;
          color: #111;
        }

        /* ── Tabs ── */
        .wl-tabs {
          display: flex;
          gap: 24px;
          border-bottom: none;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .wl-tab {
          font-size: 11px;
          font-weight: 400;
          text-decoration: none;
          color: #111;
          letter-spacing: 0.03em;
          padding-bottom: 4px;
          border-bottom: 1px solid transparent;
        }
        .wl-tab:hover {
          border-bottom-color: #111;
        }
        .wl-tab--active {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ── Header ── */
        .wl-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 12px;
        }
        .wl-subtitle {
          font-size: 11px;
          font-weight: 400;
          color: #111;
          margin: 0 0 32px;
        }
        .wl-signin {
          color: #0000cc;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .wl-empty {
          font-size: 12px;
          color: #999;
          margin-top: 32px;
        }

        /* ── Grid ── */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }

        /* ── Card ── */
        .wl-card {
          position: relative;
          border: 1px solid transparent;
        }
        .wl-remove {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111;
          padding: 4px 0;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .wl-card:hover .wl-remove {
          opacity: 1;
        }
        .wl-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .wl-img-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f5f5f5;
          overflow: hidden;
        }
        .wl-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .wl-meta {
          padding: 10px 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .wl-name {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          line-height: 1.3;
          color: #0000cc;
        }
        .wl-price {
          font-size: 11px;
          font-weight: 400;
          color: #111;
        }
        .wl-collection {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.03em;
          color: #999;
        }

        @media (max-width: 767px) {
          .wl-wrap { padding: 16px 16px 100px; }
          .wl-tabs { gap: 16px; margin-bottom: 24px; }
          .wl-grid { grid-template-columns: repeat(2, 1fr); }
          .wl-remove { opacity: 1; }
        }
      `}</style>
    </>
  );
}
