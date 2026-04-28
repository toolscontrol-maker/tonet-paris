'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n';

export default function InformationClient() {
  const { user, isLoading } = useRequireAuth();
  const { updateProfile } = useAuth();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Sync form with user data once loaded
  if (user && !editing && !saved) {
    if (firstName !== user.firstName || lastName !== user.lastName) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || '');
      setNewsletter(user.newsletter);
    }
  }

  if (isLoading || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || undefined,
      newsletter,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="info-wrap">
        <nav className="info-tabs">
          <Link href="/account" className="info-tab">{t('account.overview')}</Link>
          <Link href="/account/orders" className="info-tab">{t('wishlist.orders')}</Link>
          <Link href="/account/information" className="info-tab info-tab--active">{t('wishlist.myInfo')}</Link>
          <Link href="/wishlist" className="info-tab">{t('wishlist.tabTitle')}</Link>
        </nav>

        <h1 className="info-title">{t('account.myInfoTitle')}</h1>

        <form className="info-form" onSubmit={handleSave}>
          <label className="info-label">{t('auth.firstName')}</label>
          <input
            className="info-input"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setEditing(true); }}
          />

          <label className="info-label">{t('auth.lastName')}</label>
          <input
            className="info-input"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setEditing(true); }}
          />

          <label className="info-label">Email</label>
          <input className="info-input info-input--disabled" value={user.email} disabled />

          <label className="info-label">{t('welcome.phone')}</label>
          <input
            className="info-input"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setEditing(true); }}
            placeholder="+34 600000000"
          />

          <label className="info-checkbox">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => { setNewsletter(e.target.checked); setEditing(true); }}
            />
            <span>{t('welcome.newsletter')}</span>
          </label>

          {saved && <p className="info-saved">{t('account.saved')}</p>}

          <button type="submit" className="info-btn" disabled={!editing}>
            {t('account.saveChanges')}
          </button>
        </form>
      </div>

      <style>{`
        .info-wrap {
          max-width: 480px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          color: #111;
        }
        .info-tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .info-tab {
          font-size: 11px;
          font-weight: 400;
          text-decoration: none;
          color: #111;
          letter-spacing: 0.03em;
          padding-bottom: 4px;
          border-bottom: 1px solid transparent;
        }
        .info-tab:hover { border-bottom-color: #111; }
        .info-tab--active {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .info-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 24px;
        }
        .info-form {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          margin-bottom: 6px;
        }
        .info-input {
          background: #f7f7f7;
          border: none;
          padding: 14px 12px;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #111;
          outline: none;
          margin-bottom: 20px;
        }
        .info-input--disabled {
          color: #999;
          cursor: not-allowed;
        }
        .info-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
          color: #333;
          margin-bottom: 24px;
          cursor: pointer;
        }
        .info-checkbox input[type="checkbox"] {
          margin-top: 2px;
          width: 16px;
          height: 16px;
          accent-color: #000;
        }
        .info-saved {
          color: #2d6e2d;
          font-size: 11px;
          margin: 0 0 12px;
        }
        .info-btn {
          background: #000;
          color: #fff;
          border: 1px solid #000;
          padding: 16px;
          font-size: 11px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }
        .info-btn:hover { background: #FAF8F5; color: #000; }
        .info-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 767px) {
          .info-wrap { padding: 16px 16px 100px; }
        }
      `}</style>
    </>
  );
}
