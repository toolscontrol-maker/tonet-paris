'use client';

import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export default function AccountClient() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (isLoading || !user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.toUpperCase();

  return (
    <>
      {/* ══ HERO BANNER AREA ══ */}
      <div className="dior-hero-banner">
        <img 
          src="/AMIRI_WEB_Account-Page_Banner_1558x520_1-50.webp" 
          alt="Amiri Campaign Model" 
          className="dior-banner-img"
        />
        <div className="dior-banner-overlay">
          <div className="dior-banner-text">
            <span className="dior-banner-sub">THE HOUSE OF TONET TORRENTINNI</span>
            <h1 className="dior-banner-title">WELCOME, {fullName}</h1>
          </div>
        </div>
      </div>

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

        {/* ══ CONTENT SPLIT GRID (LEFT LABEL, RIGHT CONTENT) ══ */}
        <div className="dior-split-row dior-split-row--bordered">
          <div className="dior-split-left">
            <h2 className="dior-section-title">Your Wardrobe</h2>
            <p className="dior-section-desc">
              Explore your personal space, registry files, and request availability for sold-out collections.
            </p>
            <Link href="/collection" className="dior-btn-dark">
              Explore Collections
            </Link>
          </div>
          <div className="dior-split-right">
            <div className="dior-imagery-grid">
              <img src="/hero/ComfyUI-main_reference_00018_.png" alt="Lookbook 01" className="dior-editorial-img" />
              <img src="/hero/ComfyUI-main_reference_00021_.png" alt="Lookbook 02" className="dior-editorial-img" />
            </div>
          </div>
        </div>

        {/* ══ MANAGE ACCOUNT BLOCK ══ */}
        <div className="dior-split-row">
          <div className="dior-split-left">
            <h2 className="dior-section-title">Manage Account</h2>
          </div>
          <div className="dior-split-right">
            <div className="dior-manage-grid">
              
              <div className="dior-manage-col">
                <h3 className="dior-manage-title">Profile</h3>
                <p className="dior-manage-text">Update your personal registration details, password, and communications preferences.</p>
                <Link href="/account/information" className="dior-text-link">Edit</Link>
              </div>

              <div className="dior-manage-col">
                <h3 className="dior-manage-title">Addresses</h3>
                <p className="dior-manage-text">Manage your verified billing and shipping address entries for swift acquisitions.</p>
                <Link href="/account/addresses" className="dior-text-link">Edit</Link>
              </div>

              <div className="dior-manage-col">
                <h3 className="dior-manage-title">Archive Room</h3>
                <p className="dior-manage-text">Access your personal archive collection wishlist and review your registered garments.</p>
                <Link href="/archive?tab=personal" className="dior-text-link">Explore</Link>
              </div>

              <div className="dior-manage-col">
                <h3 className="dior-manage-title">Sourcing Concierge</h3>
                <p className="dior-manage-text">Request sizes or pieces no longer available and track their status in real-time.</p>
                <Link href="/archive?tab=requests" className="dior-text-link">Manage</Link>
              </div>

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
          top: calc(var(--header-height, 64px) + var(--nav-top, 0px));
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
          padding: 12px 24px 100px;
          box-sizing: border-box;
          font-family: var(--font-primary), sans-serif;
        }

        /* Hero Banner */
        .dior-hero-banner {
          position: relative;
          width: 100%;
          height: 520px;
          overflow: hidden;
          margin-top: 0;
          background: #e4e3e1;
        }
        @media (max-width: 767px) {
          .dior-hero-banner {
            margin-top: 0;
            height: 360px;
          }
        }
        .dior-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: contrast(0.95) brightness(1.02);
        }
        .dior-banner-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .dior-banner-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
        }
        .dior-banner-sub {
          font-family: 'Big Noodle Titling', sans-serif;
          font-size: 22px;
          letter-spacing: 0.15em;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
        }
        .dior-banner-title {
          font-family: 'Big Noodle Titling', sans-serif;
          font-size: 56px;
          font-weight: normal;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
        }
        @media (max-width: 767px) {
          .dior-banner-sub {
            font-size: 16px;
            letter-spacing: 0.1em;
          }
          .dior-banner-title {
            font-size: 36px;
          }
        }

        /* Split layouts */
        .dior-split-row {
          display: grid;
          grid-template-columns: 4fr 6fr;
          gap: 64px;
          padding: 56px 0;
          align-items: start;
        }
        .dior-split-row--bordered {
          border-bottom: 1px solid #ddd8d2;
          padding-top: 0;
        }
        .dior-split-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .dior-section-title {
          font-family: var(--font-brand), serif;
          font-size: 20px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 18px;
        }
        .dior-section-desc {
          font-size: 11px;
          line-height: 2.1;
          color: #7c7872;
          letter-spacing: 0.05em;
          margin: 0 0 32px;
          max-width: 320px;
        }

        /* Buttons */
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

        /* Imagery Grid */
        .dior-imagery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .dior-editorial-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border: 1px solid #ddd8d2;
        }

        /* Manage Grid */
        .dior-manage-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .dior-manage-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .dior-manage-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 10px;
        }
        .dior-manage-text {
          font-size: 10.5px;
          line-height: 1.9;
          color: #7c7872;
          letter-spacing: 0.04em;
          margin: 0 0 16px;
        }
        .dior-text-link {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2d2a26;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .dior-text-link:hover {
          color: #7c7872;
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
          .dior-section-desc {
            max-width: 100%;
          }
        }

        @media (max-width: 767px) {
          .dior-space-wrap {
            padding: 40px 16px 80px;
          }
          .dior-hero-banner {
            height: 240px;
            margin-bottom: 40px;
          }
          .dior-manage-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .dior-imagery-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
