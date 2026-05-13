'use client';

import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';

export default function AccountClient() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();

  if (isLoading || !user) return null;

  const firstCartItem = cart.lines[0];

  return (
    <>
      <div className="acc-wrap">
        {/* Tabs */}
        <nav className="acc-tabs">
          <Link href="/account" className="acc-tab acc-tab--active">{t('account.overview')}</Link>
          <Link href="/account/orders" className="acc-tab">{t('wishlist.orders')}</Link>
          <Link href="/account/information" className="acc-tab">{t('wishlist.myInfo')}</Link>
          <Link href="/wishlist" className="acc-tab">{t('wishlist.tabTitle')}</Link>
        </nav>

        {/* Welcome header */}
        <h1 className="acc-title">{t('account.welcomeBack')}, {user.firstName}</h1>
        <p className="acc-email">{user.email}</p>

        {/* Grid blocks */}
        <div className="acc-grid">
          {/* In your cart */}
          <Link href="#" className="acc-block" onClick={(e) => { e.preventDefault(); }}>
            <h3 className="acc-block-title">{t('account.inYourCart')}</h3>
            {firstCartItem ? (
              <div className="acc-cart-preview">
                {firstCartItem.image && (
                  <img src={firstCartItem.image} alt={firstCartItem.name} className="acc-cart-img" />
                )}
                <div className="acc-cart-info">
                  <span className="acc-cart-name">{firstCartItem.name}</span>
                  <span className="acc-cart-price">{formatPrice(firstCartItem.price, firstCartItem.currencyCode)}</span>
                </div>
              </div>
            ) : (
              <p className="acc-block-empty">{t('account.cartEmpty')}</p>
            )}
          </Link>

          {/* Orders & Returns */}
          <Link href="/account/orders" className="acc-block">
            <h3 className="acc-block-title">{t('wishlist.orders')}</h3>
            <p className="acc-block-empty">{t('account.noOrders')}</p>
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className="acc-block">
            <h3 className="acc-block-title">{t('wishlist.tabTitle')}</h3>
            {wishlistItems.length > 0 ? (
              <div className="acc-wish-preview">
                {wishlistItems.slice(0, 3).map(item => (
                  <img key={item.handle} src={item.imageUrl} alt={item.title} className="acc-wish-img" />
                ))}
                {wishlistItems.length > 3 && (
                  <span className="acc-wish-more">+{wishlistItems.length - 3}</span>
                )}
              </div>
            ) : (
              <p className="acc-block-empty">{t('account.wishlistEmpty')}</p>
            )}
          </Link>

          {/* My Information */}
          <Link href="/account/information" className="acc-block">
            <h3 className="acc-block-title">{t('wishlist.myInfo')}</h3>
            <p className="acc-block-desc">{user.firstName} {user.lastName}</p>
            <p className="acc-block-desc">{user.email}</p>
          </Link>

          {/* Appointments — placeholder */}
          <div className="acc-block acc-block--disabled">
            <h3 className="acc-block-title">{t('account.appointments')}</h3>
            <p className="acc-block-empty">{t('account.comingSoon')}</p>
          </div>
        </div>

        {/* Logout */}
        <button className="acc-logout" onClick={logout}>
          {t('account.logout')}
        </button>
      </div>

      <style>{`
        .acc-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          font-family: 'Creato Display', sans-serif;
          color: #111;
        }

        /* Tabs */
        .acc-tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .acc-tab {
          font-size: 11px;
          font-weight: 400;
          text-decoration: none;
          color: #111;
          letter-spacing: 0.03em;
          padding-bottom: 4px;
          border-bottom: 1px solid transparent;
        }
        .acc-tab:hover { border-bottom-color: #111; }
        .acc-tab--active {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* Header */
        .acc-title {
          font-size: 19px;
          font-weight: 400;
          margin: 0 0 4px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .acc-email {
          font-size: 12px;
          color: #888;
          margin: 0 0 32px;
        }

        /* Grid */
        .acc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .acc-block {
          border: 1px solid #e0e0e0;
          padding: 20px;
          min-height: 140px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s;
        }
        .acc-block:hover { border-color: #111; }
        .acc-block--disabled {
          opacity: 0.5;
          cursor: default;
        }
        .acc-block--disabled:hover { border-color: #e0e0e0; }
        .acc-block-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 12px;
        }
        .acc-block-empty {
          font-size: 11px;
          color: #999;
          margin: 0;
        }
        .acc-block-desc {
          font-size: 11px;
          color: #555;
          margin: 0 0 2px;
        }

        /* Cart preview */
        .acc-cart-preview {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .acc-cart-img {
          width: 48px;
          height: 64px;
          object-fit: contain;
          background: #f5f5f5;
        }
        .acc-cart-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .acc-cart-name {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .acc-cart-price {
          font-size: 11px;
          color: #555;
        }

        /* Wishlist preview */
        .acc-wish-preview {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .acc-wish-img {
          width: 40px;
          height: 52px;
          object-fit: contain;
          background: #f5f5f5;
        }
        .acc-wish-more {
          font-size: 11px;
          color: #888;
          margin-left: 4px;
        }

        /* Logout */
        .acc-logout {
          background: none;
          border: 1px solid #111;
          padding: 14px 32px;
          font-size: 11px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }
        .acc-logout:hover {
          background: #111;
          color: #fff;
        }

        @media (max-width: 767px) {
          .acc-wrap { padding: 16px 16px 100px; }
          .acc-tabs { gap: 16px; }
          .acc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
