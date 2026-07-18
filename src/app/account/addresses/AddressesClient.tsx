'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

interface Address {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    address1: 'Calle Serrano 42, 3ºB',
    city: 'Madrid',
    zip: '28001',
    country: 'Spain',
    phone: '+34 600 12 34 56',
    isDefaultShipping: true,
    isDefaultBilling: true,
  }
];

export default function AddressesClient() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Spain');
  const [phone, setPhone] = useState('');
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('tonet-addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        setAddresses(DEFAULT_ADDRESSES);
        localStorage.setItem('tonet-addresses', JSON.stringify(DEFAULT_ADDRESSES));
      }
    } catch {}
  }, []);

  if (isLoading || !user || !mounted) return null;

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address1.trim() || !city.trim() || !zip.trim() || !country.trim() || !phone.trim()) return;

    let updated: Address[];
    if (editId) {
      updated = addresses.map(addr => {
        if (addr.id === editId) {
          return {
            ...addr,
            address1,
            address2: address2 || undefined,
            city,
            zip,
            country,
            phone,
            isDefaultShipping: isDefaultShipping || addr.isDefaultShipping,
            isDefaultBilling: isDefaultBilling || addr.isDefaultBilling,
          };
        }
        return addr;
      });
    } else {
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        address1,
        address2: address2 || undefined,
        city,
        zip,
        country,
        phone,
        isDefaultShipping: isDefaultShipping || addresses.length === 0,
        isDefaultBilling: isDefaultBilling || addresses.length === 0,
      };
      updated = [...addresses, newAddress];
    }

    // If default is selected, unset other defaults
    if (isDefaultShipping) {
      const targetId = editId || updated[updated.length - 1].id;
      updated = updated.map(addr => ({
        ...addr,
        isDefaultShipping: addr.id === targetId,
      }));
    }
    if (isDefaultBilling) {
      const targetId = editId || updated[updated.length - 1].id;
      updated = updated.map(addr => ({
        ...addr,
        isDefaultBilling: addr.id === targetId,
      }));
    }

    setAddresses(updated);
    localStorage.setItem('tonet-addresses', JSON.stringify(updated));

    // Reset form
    setAddress1('');
    setAddress2('');
    setCity('');
    setZip('');
    setPhone('');
    setIsDefaultShipping(false);
    setIsDefaultBilling(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (addr: Address) => {
    setEditId(addr.id);
    setAddress1(addr.address1);
    setAddress2(addr.address2 || '');
    setCity(addr.city);
    setZip(addr.zip);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsDefaultShipping(addr.isDefaultShipping);
    setIsDefaultBilling(addr.isDefaultBilling);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    setAddresses(updated);
    localStorage.setItem('tonet-addresses', JSON.stringify(updated));
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
            <h1 className="dior-main-title">Addresses</h1>
            <p className="dior-main-subtitle">
              Add and manage your shipping and billing locations. Registered addresses ensure seamless checkouts during exclusive collection drops.
            </p>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditId(null); }} className="dior-btn-outline dior-btn-outline--fit dior-add-btn">
                Add new address
              </button>
            )}
          </div>

          {/* Right Column: Address Cards / Form */}
          <div className="dior-split-right">
            
            {showForm ? (
              
              /* ADD / EDIT ADDRESS FORM */
              <div className="dior-form-panel">
                <h3 className="dior-block-title">{editId ? 'Edit Address' : 'New Address'}</h3>
                
                <form onSubmit={handleAddOrEdit} className="dior-sourcing-form">
                  <div className="dior-form-group">
                    <label className="dior-form-label" htmlFor="address-1">Address Line 1 *</label>
                    <input
                      id="address-1"
                      type="text"
                      className="dior-input"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      required
                    />
                  </div>

                  <div className="dior-form-group">
                    <label className="dior-form-label" htmlFor="address-2">Address Line 2 (Optional)</label>
                    <input
                      id="address-2"
                      type="text"
                      className="dior-input"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                    />
                  </div>

                  <div className="dior-form-grid">
                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="city-name">City *</label>
                      <input
                        id="city-name"
                        type="text"
                        className="dior-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="zip-code">Postal / Zip Code *</label>
                      <input
                        id="zip-code"
                        type="text"
                        className="dior-input"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="dior-form-grid">
                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="country-name">Country *</label>
                      <input
                        id="country-name"
                        type="text"
                        className="dior-input"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="addr-phone">Phone Connection *</label>
                      <input
                        id="addr-phone"
                        type="tel"
                        className="dior-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="dior-checkbox-wrap">
                    <label className="dior-checkbox-label">
                      <input
                        type="checkbox"
                        className="dior-checkbox"
                        checked={isDefaultShipping}
                        onChange={(e) => setIsDefaultShipping(e.target.checked)}
                      />
                      <span className="dior-checkbox-text">Set as default shipping address</span>
                    </label>
                  </div>

                  <div className="dior-checkbox-wrap">
                    <label className="dior-checkbox-label">
                      <input
                        type="checkbox"
                        className="dior-checkbox"
                        checked={isDefaultBilling}
                        onChange={(e) => setIsDefaultBilling(e.target.checked)}
                      />
                      <span className="dior-checkbox-text">Set as default billing address</span>
                    </label>
                  </div>

                  <div className="dior-form-actions">
                    <button type="submit" className="dior-btn-dark">
                      Save address
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setShowForm(false); setEditId(null); }} 
                      className="dior-btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

            ) : (

              /* ADDRESS CARDS LIST */
              <div className="dior-address-list">
                <h3 className="dior-section-lbl">SAVED ADDRESSES</h3>
                
                {addresses.length === 0 ? (
                  <div className="dior-empty-state">
                    <p className="dior-empty-text">No registered addresses found.</p>
                  </div>
                ) : (
                  <div className="dior-address-grid">
                    {addresses.map(addr => (
                      <div key={addr.id} className="dior-address-card">
                        
                        <div className="dior-address-badges">
                          {addr.isDefaultShipping && <span className="dior-addr-badge">DEFAULT SHIPPING</span>}
                          {addr.isDefaultBilling && <span className="dior-addr-badge">DEFAULT BILLING</span>}
                        </div>

                        <div className="dior-address-info">
                          <p className="dior-address-line">{addr.address1}</p>
                          {addr.address2 && <p className="dior-address-line">{addr.address2}</p>}
                          <p className="dior-address-line">{addr.zip} {addr.city}</p>
                          <p className="dior-address-line">{addr.country}</p>
                          <p className="dior-address-line dior-address-phone">TEL: {addr.phone}</p>
                        </div>

                        <div className="dior-address-actions">
                          <button onClick={() => handleEditClick(addr)} className="dior-address-btn">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(addr.id)} className="dior-address-btn dior-address-btn--delete">
                            Delete
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>

            )}

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

        .dior-add-btn {
          margin-top: 10px;
        }

        /* Section Subheaders */
        .dior-section-lbl {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #7c7872;
          margin: 0 0 20px;
        }

        /* Form panel */
        .dior-form-panel {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 44px;
        }
        .dior-block-title {
          font-family: var(--font-brand), serif;
          font-size: 15px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 8px;
        }
        .dior-sourcing-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 24px;
        }

        /* Address cards list */
        .dior-address-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dior-address-card {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dior-address-badges {
          display: flex;
          gap: 12px;
        }
        .dior-addr-badge {
          font-size: 7.5px;
          letter-spacing: 0.2em;
          border: 1px solid #ddd8d2;
          padding: 4px 8px;
          color: #7c7872;
        }
        .dior-address-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dior-address-line {
          font-size: 11.5px;
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: #2d2a26;
          margin: 0;
        }
        .dior-address-phone {
          color: #7c7872;
          margin-top: 4px;
        }

        .dior-address-actions {
          display: flex;
          gap: 24px;
          border-top: 1px solid #ddd8d2;
          padding-top: 20px;
        }
        .dior-address-btn {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 4px;
          color: #2d2a26;
          cursor: pointer;
          padding: 0;
        }
        .dior-address-btn:hover {
          color: #7c7872;
        }
        .dior-address-btn--delete {
          color: #c0392b;
        }
        .dior-address-btn--delete:hover {
          color: #962d22;
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
        .dior-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          padding: 15px 32px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
        }
        .dior-btn-dark:hover {
          opacity: 0.9;
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
          gap: 20px;
          justify-content: flex-start;
        }

        /* Empty State */
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
          .dior-form-panel {
            padding: 24px;
          }
          .dior-form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .dior-address-card {
            padding: 20px;
          }
          .dior-form-actions {
            flex-direction: column;
            width: 100%;
          }
          .dior-form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
