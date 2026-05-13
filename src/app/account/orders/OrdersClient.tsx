'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n';

export default function OrdersClient() {
  const { user, isLoading } = useRequireAuth();
  const { t } = useTranslation();

  if (isLoading || !user) return null;

  return (
    <>
      <div className="ord-wrap">
        <nav className="ord-tabs">
          <Link href="/account" className="ord-tab">{t('account.overview')}</Link>
          <Link href="/account/orders" className="ord-tab ord-tab--active">{t('wishlist.orders')}</Link>
          <Link href="/account/information" className="ord-tab">{t('wishlist.myInfo')}</Link>
          <Link href="/wishlist" className="ord-tab">{t('wishlist.tabTitle')}</Link>
        </nav>

        <h1 className="ord-title">{t('wishlist.orders')}</h1>
        <p className="ord-empty">{t('account.noOrders')}</p>
      </div>

      <style>{`
        .ord-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          font-family: 'Creato Display', sans-serif;
          color: #111;
        }
        .ord-tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .ord-tab {
          font-size: 11px;
          font-weight: 400;
          text-decoration: none;
          color: #111;
          letter-spacing: 0.03em;
          padding-bottom: 4px;
          border-bottom: 1px solid transparent;
        }
        .ord-tab:hover { border-bottom-color: #111; }
        .ord-tab--active {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .ord-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 16px;
        }
        .ord-empty {
          font-size: 12px;
          color: #999;
        }
        @media (max-width: 767px) {
          .ord-wrap { padding: 16px 16px 100px; }
        }
      `}</style>
    </>
  );
}
