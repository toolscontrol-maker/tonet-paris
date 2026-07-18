'use client';

import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const MOCK_ACQUISITIONS = [
  {
    id: 'TNT-ACQ-9821',
    date: 1779344400000,
    total: 790.00,
    currency: 'EUR',
    status: 'delivered' as 'delivered' | 'shipped' | 'preparing',
    payment: 'MASTERCARD **** 4892',
    collection: 'SS26 — VOL I',
    items: [
      {
        handle: 'heavyweight-raglan-zip-hoodie',
        title: 'HEAVYWEIGHT RAGLAN ZIP HOODIE',
        price: 790.00,
        size: 'L',
        color: 'CARBON BLACK',
        imageUrl: '/hero/ComfyUI-main_reference_00028_.png'
      }
    ]
  },
  {
    id: 'TNT-ACQ-9421',
    date: 1776944400000,
    total: 320.00,
    currency: 'EUR',
    status: 'delivered' as 'delivered' | 'shipped' | 'preparing',
    payment: 'MASTERCARD **** 4892',
    collection: 'PERMANENCE',
    items: [
      {
        handle: 'essential-heavyweight-shorts',
        title: 'ESSENTIAL HEAVYWEIGHT SHORTS',
        price: 320.00,
        size: 'M',
        color: 'HUESO',
        imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
      }
    ]
  }
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();
}

export default function OrdersClient() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const { formatPrice } = useLocale();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (isLoading || !user) return null;

  return (
    <>
      {/* ══ HORIZONTAL MAISON NAVIGATION TABS ══ */}
      <nav className="dior-tabs-nav">
        <div className="dior-tabs-container">
          <div className="dior-tabs-list">
            <Link href="/account" className={`dior-tab ${pathname === '/account' ? 'active' : ''}`}>
              {t('account.overviewTab')}
            </Link>
            <Link href="/account/orders" className={`dior-tab ${pathname === '/account/orders' ? 'active' : ''}`}>
              {t('account.ordersTab')}
            </Link>
            <Link href="/archive?tab=personal" className="dior-tab">
              {t('account.wishlistTab')}
            </Link>
            <Link href="/account/information" className={`dior-tab ${pathname === '/account/information' ? 'active' : ''}`}>
              {t('account.profileTab')}
            </Link>
            <Link href="/account/addresses" className={`dior-tab ${pathname === '/account/addresses' ? 'active' : ''}`}>
              {t('account.addressesTab')}
            </Link>
            <Link href="/archive?tab=requests" className="dior-tab">
              {t('account.requestsTab')}
            </Link>
            <Link href="/archive?tab=registry" className="dior-tab">
              {t('account.registryTab')}
            </Link>
          </div>
          <button onClick={logout} className="dior-logout-btn">
            {t('account.logoutTab')} <span className="dior-logout-arrow">→</span>
          </button>
        </div>
      </nav>

      <div className="dior-space-wrap">
        {/* ══ SPLIT ROW LAYOUT (TITLE LEFT, CONTENT RIGHT) ══ */}
        <div className="dior-split-row">
          
          {/* Left Column: Serif Title */}
          <div className="dior-split-left">
            <h1 className="dior-main-title">Past Acquisitions</h1>
            <p className="dior-main-subtitle">
              A comprehensive ledger of garments acquired and registered to your personal wardrobe from our seasonal releases.
            </p>
          </div>

          {/* Right Column: Timeline / List */}
          <div className="dior-split-right">
            
            {/* Spotlight section */}
            <div className="dior-timeline-notable">
              <h3 className="dior-timeline-lbl">NOTABLE PIECE</h3>
              <div className="dior-spotlight-item">
                <img src="/hero/ComfyUI-main_reference_00028_.png" alt="Notable garment" className="dior-spotlight-img" />
                <div className="dior-spotlight-info">
                  <span className="dior-spotlight-season">SS26 — VOL I</span>
                  <h4 className="dior-spotlight-title">HEAVYWEIGHT RAGLAN ZIP HOODIE</h4>
                  <p className="dior-spotlight-desc">Registered in your collection lookbook. Hand-numbered edition.</p>
                </div>
              </div>
            </div>

            <div className="dior-timeline-list">
              <h3 className="dior-timeline-lbl">ACQUISITION HISTORY</h3>
              
              {MOCK_ACQUISITIONS.length > 0 ? (
                MOCK_ACQUISITIONS.map(acq => (
                  <div key={acq.id} className="dior-order-node">
                    
                    <div className="dior-order-header">
                      <div className="dior-order-meta">
                        <span className="dior-order-date">{formatDate(acq.date)}</span>
                        <span className="dior-order-id">{acq.id}</span>
                      </div>
                      <div className="dior-order-status">
                        <span className={`dior-status-badge ${acq.status}`}>
                          {acq.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="dior-order-items">
                      {acq.items.map(item => (
                        <div key={item.handle} className="dior-order-item-row">
                          <img src={item.imageUrl} alt={item.title} className="dior-order-item-img" />
                          <div className="dior-order-item-details">
                            <h5 className="dior-order-item-title">{item.title}</h5>
                            <span className="dior-order-item-spec">
                              SIZE: {item.size} &nbsp;&bull;&nbsp; COLOR: {item.color}
                            </span>
                            <span className="dior-order-item-price">
                              {formatPrice(item.price, acq.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="dior-order-footer">
                      <span className="dior-order-payment">{acq.payment}</span>
                      <div className="dior-order-actions">
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); alert("Invoice downloaded successfully (Mock PDF)."); }} 
                          className="dior-order-link"
                        >
                          Invoice (PDF)
                        </a>
                        <Link href={`/product/${acq.items[0].handle}`} className="dior-order-link">
                          Reorder
                        </Link>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="dior-empty-state">
                  <p className="dior-empty-text">No acquisitions registered.</p>
                  <Link href="/collection" className="dior-btn-dark">
                    Explore Collections
                  </Link>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ══ COMPONENT LEGAL FOOTER ══ */}
        <footer className="dior-internal-footer">
          <span className="dior-footer-link">PRIVACY POLICY</span>
          <span className="dior-footer-link">LEGAL NOTICE</span>
        </footer>
      </div>

      <style>{`
        /* ══ DIOR LUXURY THEME STYLING ══ */
        html, body {
          background: #f4f3f1 !important;
          color: #2d2a26 !important;
        }

        /* Tabs Nav */
        .dior-tabs-nav {
          background: #ffffff;
          border-bottom: 1px solid #ddd8d2;
          width: 100%;
          position: sticky;
          top: var(--header-height, 64px);
          z-index: 10;
        }
        .dior-tabs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }
        .dior-tabs-list {
          display: flex;
          height: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dior-tabs-list::-webkit-scrollbar {
          display: none;
        }
        .dior-tab {
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: none;
          color: #7c7872;
          text-decoration: none;
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 100%;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.3s, border-color 0.3s;
          white-space: nowrap;
        }
        .dior-tab:hover {
          color: #2d2a26;
        }
        .dior-tab.active {
          color: #2d2a26;
          font-weight: 400;
          border-bottom-color: #2d2a26;
        }
        .dior-logout-btn {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: none;
          color: #7c7872;
          cursor: pointer;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
        }
        .dior-logout-btn:hover {
          color: #2d2a26;
        }
        .dior-logout-arrow {
          font-size: 10px;
        }

        /* Space Wrap */
        .dior-space-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          box-sizing: border-box;
          font-family: var(--font-primary), sans-serif;
        }

        /* Split layouts */
        .dior-split-row {
          display: grid;
          grid-template-columns: 4fr 6fr;
          gap: 84px;
          padding: 32px 0;
          align-items: start;
        }
        .dior-split-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: sticky;
          top: 180px;
        }
        .dior-main-title {
          font-family: var(--font-brand), serif;
          font-size: 26px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 20px;
        }
        .dior-main-subtitle {
          font-size: 11px;
          line-height: 2.1;
          color: #7c7872;
          letter-spacing: 0.05em;
          margin: 0;
        }

        /* Right Panel Details */
        .dior-timeline-notable {
          margin-bottom: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid #ddd8d2;
        }
        .dior-timeline-lbl {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.3em;
          color: #7c7872;
          margin: 0 0 20px;
          text-transform: uppercase;
        }
        .dior-spotlight-item {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 28px;
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 24px;
          align-items: center;
        }
        .dior-spotlight-img {
          width: 100px;
          aspect-ratio: 3 / 4;
          object-fit: contain;
          background: #f4f3f1;
          padding: 8px;
          box-sizing: border-box;
          filter: grayscale(0.1);
        }
        .dior-spotlight-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dior-spotlight-season {
          font-size: 7.5px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .dior-spotlight-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .dior-spotlight-desc {
          font-size: 10px;
          color: #7c7872;
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* Orders list nodes */
        .dior-timeline-list {
          display: flex;
          flex-direction: column;
        }
        .dior-order-node {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 32px;
          margin-bottom: 24px;
        }
        .dior-order-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd8d2;
          padding-bottom: 18px;
          margin-bottom: 24px;
          align-items: center;
        }
        .dior-order-meta {
          display: flex;
          gap: 20px;
        }
        .dior-order-date {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #2d2a26;
        }
        .dior-order-id {
          font-size: 8.5px;
          letter-spacing: 0.2em;
          color: #7c7872;
        }
        .dior-status-badge {
          font-size: 7.5px;
          font-weight: 400;
          letter-spacing: 0.2em;
          padding: 4px 10px;
          border: 1px solid #ddd8d2;
          color: #2d2a26;
        }

        .dior-order-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .dior-order-item-row {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .dior-order-item-img {
          width: 52px;
          height: 68px;
          object-fit: contain;
          background: #f4f3f1;
          padding: 6px;
          box-sizing: border-box;
        }
        .dior-order-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dior-order-item-title {
          font-family: var(--font-brand), serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .dior-order-item-spec {
          font-size: 8px;
          color: #7c7872;
          letter-spacing: 0.15em;
        }
        .dior-order-item-price {
          font-size: 9.5px;
          color: #2d2a26;
          letter-spacing: 0.05em;
        }

        .dior-order-footer {
          border-top: 1px solid #ddd8d2;
          padding-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dior-order-payment {
          font-size: 8px;
          letter-spacing: 0.18em;
          color: #7c7872;
          text-transform: uppercase;
        }
        .dior-order-actions {
          display: flex;
          gap: 24px;
        }
        .dior-order-link {
          font-size: 8.5px;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2d2a26;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .dior-order-link:hover {
          color: #7c7872;
        }

        /* Empty state */
        .dior-empty-state {
          text-align: center;
          padding: 64px;
          border: 1px dashed #ddd8d2;
          background: #ffffff;
        }
        .dior-empty-text {
          font-size: 11px;
          color: #7c7872;
          letter-spacing: 0.08em;
          margin-bottom: 24px;
        }
        .dior-btn-dark {
          background: #34383d;
          color: #f7f5f0;
          font-family: inherit;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 15px 32px;
          transition: opacity 0.3s;
          display: inline-block;
          border-radius: 0;
        }
        .dior-btn-dark:hover {
          opacity: 0.9;
        }

        /* Legal Footer */
        .dior-internal-footer {
          display: flex;
          justify-content: center;
          gap: 40px;
          padding: 60px 0 20px;
          border-top: 1px solid #ddd8d2;
          margin-top: 40px;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .dior-footer-link {
          cursor: pointer;
          transition: color 0.3s;
        }
        .dior-footer-link:hover {
          color: #2d2a26;
        }

        @media (max-width: 991px) {
          .dior-split-row {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .dior-split-left {
            position: static;
          }
        }

        @media (max-width: 767px) {
          .dior-space-wrap {
            padding: 40px 16px 80px;
          }
          .dior-order-node {
            padding: 20px;
          }
          .dior-order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .dior-order-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .dior-order-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
