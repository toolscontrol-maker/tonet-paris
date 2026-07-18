'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export default function InformationClient() {
  const { user, isLoading } = useRequireAuth();
  const { updateProfile, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();

  const [civility, setCivility] = useState('monsieur');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
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
          
          {/* Left Column: Title & Subtitle */}
          <div className="dior-split-left">
            <h1 className="dior-main-title">Profile</h1>
            <p className="dior-main-subtitle">
              Review and adjust your private registration credentials, access keys, and communication preferences with the Maison.
            </p>
            {saved && (
              <p className="dior-success-badge">PROFILE RECORD UPDATED</p>
            )}
          </div>

          {/* Right Column: Profile forms in stacked Dior blocks */}
          <div className="dior-split-right">
            
            <form onSubmit={handleSave} className="dior-form-sections">
              
              {/* 1. PERSONAL INFORMATION */}
              <div className="dior-profile-block">
                <h3 className="dior-block-title">Personal Information</h3>
                
                <div className="dior-group dior-group--row">
                  <span className="dior-form-label">Title</span>
                  <div className="dior-civility-group">
                    <label className="dior-civility-label">
                      <input 
                        type="radio" 
                        name="civility" 
                        value="monsieur" 
                        checked={civility === 'monsieur'}
                        onChange={() => { setCivility('monsieur'); setEditing(true); }}
                        className="dior-radio" 
                      />
                      <span>Mr.</span>
                    </label>
                    <label className="dior-civility-label">
                      <input 
                        type="radio" 
                        name="civility" 
                        value="madame" 
                        checked={civility === 'madame'}
                        onChange={() => { setCivility('madame'); setEditing(true); }}
                        className="dior-radio" 
                      />
                      <span>Mrs.</span>
                    </label>
                    <label className="dior-civility-label">
                      <input 
                        type="radio" 
                        name="civility" 
                        value="non-binary" 
                        checked={civility === 'non-binary'}
                        onChange={() => { setCivility('non-binary'); setEditing(true); }}
                        className="dior-radio" 
                      />
                      <span>Mx.</span>
                    </label>
                  </div>
                </div>

                <div className="dior-form-grid">
                  <div className="dior-group">
                    <label className="dior-form-label" htmlFor="first-name">First Name *</label>
                    <input
                      id="first-name"
                      type="text"
                      className="dior-input"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setEditing(true); }}
                      required
                    />
                  </div>
                  <div className="dior-group">
                    <label className="dior-form-label" htmlFor="last-name">Last Name *</label>
                    <input
                      id="last-name"
                      type="text"
                      className="dior-input"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setEditing(true); }}
                      required
                    />
                  </div>
                </div>

                <div className="dior-form-grid">
                  <div className="dior-group">
                    <label className="dior-form-label" htmlFor="phone-number">Phone Connection</label>
                    <input
                      id="phone-number"
                      type="tel"
                      className="dior-input"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setEditing(true); }}
                      placeholder="+34 600 00 00 00"
                    />
                  </div>
                  <div className="dior-group">
                    <label className="dior-form-label" htmlFor="birthday">Date of Birth</label>
                    <input
                      id="birthday"
                      type="text"
                      className="dior-input"
                      value={birthday}
                      onChange={(e) => { setBirthday(e.target.value); setEditing(true); }}
                      placeholder="DD / MM / YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SIGN-IN DETAILS */}
              <div className="dior-profile-block dior-profile-block--bordered">
                <h3 className="dior-block-title">Sign-in Details</h3>
                <div className="dior-form-grid">
                  <div className="dior-group">
                    <label className="dior-form-label">Email Address (Registered Principal)</label>
                    <input
                      type="email"
                      className="dior-input dior-input--disabled"
                      value={user.email}
                      disabled
                    />
                  </div>
                  <div className="dior-group dior-group--align-end">
                    <button 
                      type="button" 
                      onClick={() => alert("Password reset link sent to your registered email.")}
                      className="dior-btn-outline dior-btn-outline--fit"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. PREFERENCES / COMMUNICATIONS */}
              <div className="dior-profile-block dior-profile-block--bordered">
                <h3 className="dior-block-title">Communication Preferences</h3>
                <div className="dior-checkbox-wrap">
                  <label className="dior-checkbox-label">
                    <input
                      type="checkbox"
                      className="dior-checkbox"
                      checked={newsletter}
                      onChange={(e) => { setNewsletter(e.target.checked); setEditing(true); }}
                    />
                    <span className="dior-checkbox-text">
                      I wish to receive personalized updates on new collections, lookbooks, private archive drops, and concierge events from TONET TORRENTINNI.
                    </span>
                  </label>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="dior-form-actions">
                <button type="submit" className="dior-btn-dark dior-btn-dark--wide" disabled={!editing}>
                  Validate preferences
                </button>
              </div>

            </form>

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
          margin: 0 0 28px;
        }
        .dior-success-badge {
          font-size: 8.5px;
          letter-spacing: 0.15em;
          color: #2d2a26;
          border: 1px solid #ddd8d2;
          background: #ffffff;
          padding: 12px 24px;
          text-transform: uppercase;
        }

        /* Form sections blocks */
        .dior-form-sections {
          display: flex;
          flex-direction: column;
          gap: 56px;
          width: 100%;
        }
        .dior-profile-block {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 44px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .dior-block-title {
          font-family: var(--font-brand), serif;
          font-size: 15px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 8px;
        }

        /* Inputs & Groups */
        .dior-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        .dior-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dior-group--row {
          flex-direction: row;
          align-items: center;
          gap: 28px;
        }
        .dior-group--align-end {
          justify-content: flex-end;
        }
        .dior-form-label {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #7c7872;
          margin-bottom: 2px;
        }
        .dior-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 300;
          letter-spacing: 0.12em;
          padding: 10px 0;
          outline: none;
          border-radius: 0;
          transition: border-color 0.4s;
        }
        .dior-input:focus {
          border-color: #2d2a26;
        }
        .dior-input--disabled {
          border-bottom-color: rgba(0, 0, 0, 0.04);
          color: #7c7872;
          cursor: not-allowed;
        }

        /* Radios & Civility */
        .dior-civility-group {
          display: flex;
          gap: 28px;
        }
        .dior-civility-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #2d2a26;
          cursor: pointer;
        }
        .dior-radio {
          accent-color: #34383d;
          width: 13px;
          height: 13px;
          cursor: pointer;
        }

        /* Checkbox & preferences */
        .dior-checkbox-wrap {
          display: flex;
          align-items: center;
        }
        .dior-checkbox-label {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          cursor: pointer;
        }
        .dior-checkbox {
          accent-color: #34383d;
          width: 14px;
          height: 14px;
          border-radius: 0 !important;
          margin-top: 2px;
        }
        .dior-checkbox-text {
          font-size: 10px;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: #7c7872;
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
          border: none;
          padding: 18px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
        }
        .dior-btn-dark:disabled {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.35);
          cursor: not-allowed;
        }
        .dior-btn-dark:not(:disabled):hover {
          opacity: 0.9;
        }
        .dior-btn-dark--wide {
          min-width: 240px;
          align-self: flex-start;
        }
        .dior-btn-outline {
          background: transparent;
          border: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 8.5px;
          font-weight: 400;
          letter-spacing: 0.2em;
          padding: 12px 24px;
          cursor: pointer;
          transition: border-color 0.3s;
          border-radius: 0;
          text-transform: uppercase;
          text-align: center;
        }
        .dior-btn-outline:hover {
          border-color: #2d2a26;
        }
        .dior-btn-outline--fit {
          align-self: flex-start;
        }

        .dior-form-actions {
          display: flex;
          justify-content: flex-start;
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
          .dior-profile-block {
            padding: 24px;
          }
          .dior-form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .dior-btn-dark--wide {
            width: 100%;
          }
          .dior-btn-outline--fit {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
