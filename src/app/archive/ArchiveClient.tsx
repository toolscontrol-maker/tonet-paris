'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useTranslation } from '@/lib/i18n';

type Tab = 'personal' | 'requests' | 'registry';

interface AvailRequest {
  id: string;
  product: string;
  title: string;
  size: string;
  color: string;
  notes?: string;
  submittedAt: number;
  status: 'submitted' | 'under_review' | 'sourced' | 'unavailable' | 'fulfilled';
}

interface Collection {
  id: string;
  title: string;
  season: string;
  year: string;
  pieceCount: number;
  coverImage: string;
  description: string;
  lookbook: string[];
}

const COLLECTIONS: Collection[] = [
  {
    id: 'permanence',
    title: 'PERMANENCE',
    season: 'CORE COLLECTION',
    year: 'SEASONLESS',
    pieceCount: 18,
    coverImage: '/hero/ComfyUI-main_reference_00012_.png',
    description: 'A study in weight and form. Silhouette explorations crafted from custom-milled heavyweight fleece, exploring clean seams and natural raw organic tones.',
    lookbook: [
      '/hero/ComfyUI-main_reference_00012_.png',
      '/hero/ComfyUI-main_reference_00018_.png',
      '/hero/ComfyUI-main_reference_00021_.png'
    ]
  },
  {
    id: 'ss26',
    title: 'SS26 — VOL I',
    season: 'SPRING / SUMMER 2026',
    year: '2026',
    pieceCount: 24,
    coverImage: '/hero/ComfyUI-main_reference_00028_.png',
    description: 'Atelier tailorings met with modular utility. Fine raw wool construction blending traditional structure and contemporary relaxed silhouettes.',
    lookbook: [
      '/hero/ComfyUI-main_reference_00028_.png',
      '/hero/ComfyUI-main_reference_00020_.png',
      '/hero/ComfyUI-main_reference_00022_.png'
    ]
  }
];

function archiveId(handle: string): string {
  const n = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `TNT-${String((n % 9000) + 1000).padStart(4, '0')}`;
}

function timeRemaining(addedAt: number | undefined): { text: string; percent: number; expired: boolean } {
  if (!addedAt) return { text: 'ACTIVE', percent: 100, expired: false };
  const elapsed = Date.now() - addedAt;
  const h48 = 48 * 3600 * 1000;
  if (elapsed >= h48) return { text: 'EXPIRED', percent: 0, expired: true };
  const rem = h48 - elapsed;
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  const percent = Math.max(0, Math.min(100, (rem / h48) * 100));
  if (h > 0) return { text: `${h}H REMAINING`, percent, expired: false };
  return { text: `${m}M REMAINING`, percent, expired: false };
}

function formatDate(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();
}

export default function ArchiveClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, remove } = useWishlist();
  const { user, logout } = useAuth();
  const { formatPrice } = useLocale();
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? 'personal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Sourcing form
  const [sourcePiece, setSourcePiece] = useState('');
  const [sourceSize, setSourceSize] = useState('M');
  const [sourceColor, setSourceColor] = useState('CARBON BLACK');
  const [sourceNotes, setSourceNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Collections state
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const [availRequests, setAvailRequests] = useState<AvailRequest[]>([]);
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setAvailRequests(JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]'));
    } catch {}
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  // Sync tab if query parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
      setSelectedCollection(null);
    }
  }, [tabParam]);

  if (!mounted) return null;

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setSelectedCollection(null);
    router.replace(`/archive?tab=${tab}`, { scroll: false });
  }

  function removeRequest(id: string) {
    const updated = availRequests.filter(r => r.id !== id);
    setAvailRequests(updated);
    localStorage.setItem('tonet-avail-requests', JSON.stringify(updated));
  }

  function handleSourcingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourcePiece.trim()) return;

    const newRequest: AvailRequest = {
      id: `REQ-${Date.now()}`,
      product: sourcePiece.toLowerCase().replace(/\s+/g, '-'),
      title: sourcePiece.trim().toUpperCase(),
      size: sourceSize,
      color: sourceColor.toUpperCase(),
      notes: sourceNotes.trim() || undefined,
      submittedAt: Date.now(),
      status: 'submitted',
    };

    const updated = [newRequest, ...availRequests];
    setAvailRequests(updated);
    localStorage.setItem('tonet-avail-requests', JSON.stringify(updated));

    // Clear form
    setSourcePiece('');
    setSourceNotes('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSeason = seasonFilter === 'ALL' || (item.collectionTitle && item.collectionTitle.toUpperCase() === seasonFilter.toUpperCase());
    const matchesCategory = categoryFilter === 'ALL' || (item.title && item.title.toUpperCase().includes(categoryFilter.toUpperCase()));
    return matchesSeason && matchesCategory;
  });

  const recentlyArchived = items.slice(-3).reverse();

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
            <Link href="/archive?tab=personal" className={`dior-tab ${activeTab === 'personal' ? 'active' : ''}`}>
              {t('account.wishlistTab')}
            </Link>
            <Link href="/account/information" className={`dior-tab ${pathname === '/account/information' ? 'active' : ''}`}>
              {t('account.profileTab')}
            </Link>
            <Link href="/account/addresses" className={`dior-tab ${pathname === '/account/addresses' ? 'active' : ''}`}>
              {t('account.addressesTab')}
            </Link>
            <Link href="/archive?tab=requests" className={`dior-tab ${activeTab === 'requests' ? 'active' : ''}`}>
              {t('account.requestsTab')}
            </Link>
            <Link href="/archive?tab=registry" className={`dior-tab ${activeTab === 'registry' ? 'active' : ''}`}>
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
          
          {/* LEFT COLUMN: TITLE & INTRO */}
          <div className="dior-split-left">
            {activeTab === 'personal' && (
              <>
                <h1 className="dior-main-title">Personal Archive</h1>
                <p className="dior-main-subtitle">
                  Review garments currently saved to your personal vault. Garments are retained here for up to 48 hours to secure availability.
                </p>
              </>
            )}
            {activeTab === 'requests' && (
              <>
                <h1 className="dior-main-title">Sourcing Requests</h1>
                <p className="dior-main-subtitle">
                  Submit customized availability targets to our sourcing team. We will contact you immediately once the item becomes sourced.
                </p>
              </>
            )}
            {activeTab === 'registry' && (
              <>
                <h1 className="dior-main-title">Collection Registry</h1>
                <p className="dior-main-subtitle">
                  Cross-reference past collections lookbooks and verify registered garments in your personal wardrobe archive checklist.
                </p>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: TABS CONTENT */}
          <div className="dior-split-right">
            
            {/* 1. PERSONAL ARCHIVE TAB */}
            {activeTab === 'personal' && (
              <div className="dior-fade-in">
                
                {/* Spotlight "Recently Archived" */}
                {recentlyArchived.length > 0 && (
                  <div className="dior-spotlight-section">
                    <h3 className="dior-section-lbl">RECENTLY ARCHIVED</h3>
                    <div className="dior-spotlight-list">
                      {recentlyArchived.map(item => (
                        <div key={`spot-${item.handle}`} className="dior-spotlight-card">
                          <img src={item.imageUrl} alt={item.title} className="dior-spotlight-thumb" />
                          <div className="dior-spotlight-info">
                            <span className="dior-spotlight-season">{item.collectionTitle?.toUpperCase()}</span>
                            <h4 className="dior-spotlight-title">{item.title.toUpperCase()}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter and View Toggles */}
                <div className="dior-filters-bar">
                  <div className="dior-filters-left">
                    <div className="dior-filter-select-wrap">
                      <span className="dior-filter-label">Season</span>
                      <select className="dior-filter-select" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                        <option value="ALL">ALL SEASONS</option>
                        <option value="PERMANENCE">PERMANENCE</option>
                        <option value="SS26 — VOL I">SS26 — VOL I</option>
                      </select>
                    </div>

                    <div className="dior-filter-select-wrap">
                      <span className="dior-filter-label">Category</span>
                      <select className="dior-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">ALL ITEMS</option>
                        <option value="HOODIE">HOODIES</option>
                        <option value="SHORTS">SHORTS</option>
                        <option value="TEE">TEES</option>
                        <option value="PANTS">PANTS</option>
                      </select>
                    </div>
                  </div>

                  <div className="dior-view-toggles">
                    <button className={`dior-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>GRID</button>
                    <button className={`dior-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>LIST</button>
                  </div>
                </div>

                {/* Products listing */}
                {filteredItems.length === 0 ? (
                  <div className="dior-empty-state">
                    <p className="dior-empty-text">No garments currently preserved in your Personal Archive.</p>
                    <Link href="/collection" className="dior-btn-dark">Explore Collections</Link>
                  </div>
                ) : viewMode === 'grid' ? (
                  
                  /* GRID VIEW */
                  <div className="dior-editorial-grid">
                    {filteredItems.map(item => {
                      const id = archiveId(item.handle);
                      const { text: remText, percent, expired } = timeRemaining(item.addedAt);
                      return (
                        <div key={item.handle} className={`dior-product-card ${expired ? 'expired' : ''}`}>
                          <Link href={`/product/${item.handle}`} className="dior-card-media-wrap">
                            <img src={item.imageUrl} alt={item.title} className="dior-card-img" />
                            {expired && <div className="dior-expired-badge">EXPIRED</div>}
                          </Link>
                          
                          <div className="dior-card-body">
                            <div className="dior-card-metadata">
                              <span className="dior-card-id">{id}</span>
                              <span className="dior-card-season">{item.collectionTitle?.toUpperCase()}</span>
                            </div>
                            <h4 className="dior-card-title">
                              <Link href={`/product/${item.handle}`}>{item.title.toUpperCase()}</Link>
                            </h4>
                            <div className="dior-card-price">{formatPrice(item.price, item.currencyCode)}</div>
                            
                            {/* Visual retention bar */}
                            <div className="dior-retention-wrap">
                              <div className="dior-retention-line" style={{ width: `${percent}%` }} />
                              <div className="dior-retention-lbls">
                                <span>RETENTION</span>
                                <span className={expired ? 'expired-text' : ''}>{remText}</span>
                              </div>
                            </div>

                            <button className="dior-card-dismiss-btn" onClick={() => remove(item.handle)}>
                              DISMISS PIECE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                ) : (

                  /* LIST VIEW */
                  <div className="dior-list-view">
                    {filteredItems.map(item => {
                      const id = archiveId(item.handle);
                      const { text: remText, expired } = timeRemaining(item.addedAt);
                      return (
                        <div key={`list-${item.handle}`} className={`dior-list-row ${expired ? 'expired' : ''}`}>
                          <img src={item.imageUrl} alt={item.title} className="dior-list-img" />
                          <div className="dior-list-details">
                            <span className="dior-list-id">{id}</span>
                            <h4 className="dior-list-title">
                              <Link href={`/product/${item.handle}`}>{item.title.toUpperCase()}</Link>
                            </h4>
                            <span className="dior-list-season">{item.collectionTitle?.toUpperCase()}</span>
                          </div>
                          <div className="dior-list-retention">
                            <span className="dior-list-lbl">RETENTION</span>
                            <span className={`dior-list-val ${expired ? 'expired-text' : ''}`}>{remText}</span>
                          </div>
                          <div className="dior-list-price">{formatPrice(item.price, item.currencyCode)}</div>
                          <button className="dior-list-dismiss" onClick={() => remove(item.handle)}>
                            Dismiss
                          </button>
                        </div>
                      );
                    })}
                  </div>

                )}

              </div>
            )}

            {/* 2. SOURCING REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="dior-fade-in">
                
                {/* Availability Concierge Form */}
                <div className="dior-sourcing-panel">
                  <h3 className="dior-section-lbl">SOURCING CONCIERGE</h3>
                  <form className="dior-sourcing-form" onSubmit={handleSourcingSubmit}>
                    
                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="piece-name">Garment / Piece Name *</label>
                      <input
                        id="piece-name"
                        type="text"
                        required
                        className="dior-input"
                        placeholder="e.g. HEAVYWEIGHT RAGLAN ZIP HOODIE"
                        value={sourcePiece}
                        onChange={(e) => setSourcePiece(e.target.value)}
                      />
                    </div>

                    <div className="dior-form-grid">
                      <div className="dior-form-group">
                        <label className="dior-form-label">Requested Size</label>
                        <select className="dior-select" value={sourceSize} onChange={(e) => setSourceSize(e.target.value)}>
                          <option value="S">S / SMALL</option>
                          <option value="M">M / MEDIUM</option>
                          <option value="L">L / LARGE</option>
                          <option value="XL">XL / EXTRA LARGE</option>
                        </select>
                      </div>

                      <div className="dior-form-group">
                        <label className="dior-form-label">Desired Color / Wash</label>
                        <select className="dior-select" value={sourceColor} onChange={(e) => setSourceColor(e.target.value)}>
                          <option value="CARBON BLACK">CARBON BLACK</option>
                          <option value="ASH GRAY">ASH GRAY</option>
                          <option value="HUESO / OFF-WHITE">HUESO / OFF-WHITE</option>
                        </select>
                      </div>
                    </div>

                    <div className="dior-form-group">
                      <label className="dior-form-label" htmlFor="concierge-notes">Collector Specifications (Optional)</label>
                      <textarea
                        id="concierge-notes"
                        className="dior-textarea"
                        placeholder="Specify custom lengths, collection versions or vintage requests..."
                        value={sourceNotes}
                        onChange={(e) => setSourceNotes(e.target.value)}
                      />
                    </div>

                    {formSuccess && (
                      <p className="dior-form-success-msg">CONCIERGE REQUEST SUBMITTED SUCCESSFULLY</p>
                    )}

                    <button type="submit" className="dior-btn-dark">
                      Submit sourcing request
                    </button>
                  </form>
                </div>

                {/* Sourcing History */}
                <div className="dior-sourcing-history">
                  <h3 className="dior-section-lbl">SUBMITTED REQUESTS</h3>
                  
                  {availRequests.length === 0 ? (
                    <div className="dior-empty-state">
                      <p className="dior-empty-text">No requests registered. You will be notified should availability change.</p>
                    </div>
                  ) : (
                    <div className="dior-requests-list">
                      {availRequests.map(req => (
                        <div key={req.id} className="dior-request-card">
                          <div className="dior-request-header">
                            <span className="dior-request-id">{req.id}</span>
                            <span className={`dior-request-badge ${req.status}`}>
                              {req.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <h4 className="dior-request-title">{req.title}</h4>
                          
                          <div className="dior-request-details">
                            <span>SIZE: {req.size}</span>
                            <span>COLOR: {req.color}</span>
                            <span>DATE: {formatDate(req.submittedAt)}</span>
                          </div>

                          {req.notes && (
                            <p className="dior-request-notes">“{req.notes}”</p>
                          )}

                          <button className="dior-request-dismiss" onClick={() => removeRequest(req.id)}>
                            Dismiss request
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* 3. COLLECTION REGISTRY TAB */}
            {activeTab === 'registry' && (
              <div className="dior-fade-in">
                
                {!selectedCollection ? (
                  /* COLLECTIONS GRID */
                  <div className="dior-collections-panel">
                    <h3 className="dior-section-lbl">REGISTERED COLLECTIONS</h3>
                    <div className="dior-collections-grid">
                      {COLLECTIONS.map(col => (
                        <div key={col.id} className="dior-collection-card" onClick={() => setSelectedCollection(col)}>
                          <div className="dior-collection-img-wrap">
                            <img src={col.coverImage} alt={col.title} className="dior-collection-img" />
                          </div>
                          <div className="dior-collection-body">
                            <span className="dior-collection-season">{col.season}</span>
                            <h4 className="dior-collection-title">{col.title}</h4>
                            <div className="dior-collection-meta">
                              <span>YEAR: {col.year}</span>
                              <span>{col.pieceCount} PIECES REGISTERED</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* COLLECTION DETAIL LOOKBOOK VIEW */
                  <div className="dior-detail-view">
                    <button className="dior-back-btn" onClick={() => setSelectedCollection(null)}>
                      ← Return to collections
                    </button>

                    <div className="dior-detail-hero">
                      <div className="dior-detail-hero-info">
                        <span className="dior-detail-season">{selectedCollection.season}</span>
                        <h2 className="dior-detail-title">{selectedCollection.title}</h2>
                        <p className="dior-detail-desc">{selectedCollection.description}</p>
                      </div>
                      <img src={selectedCollection.coverImage} alt={selectedCollection.title} className="dior-detail-img" />
                    </div>

                    {/* Editorial lookbook images */}
                    <div className="dior-detail-lookbook-section">
                      <h3 className="dior-section-lbl">EDITORIAL LOOKBOOK</h3>
                      <div className="dior-lookbook-grid">
                        {selectedCollection.lookbook.map((img, idx) => (
                          <div key={idx} className="dior-lookbook-img-wrap">
                            <img src={img} alt={`Look ${idx + 1}`} className="dior-lookbook-img" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wardrobe Checklist */}
                    <div className="dior-detail-checklist">
                      <h3 className="dior-section-lbl">GARMENT ARCHIVE CHECKLIST</h3>
                      
                      <div className="dior-checklist-list">
                        
                        <div className="dior-checklist-item">
                          <div className="dior-checklist-info">
                            <span className="dior-checklist-name">HEAVYWEIGHT RAGLAN ZIP HOODIE</span>
                            <span className="dior-checklist-status active">IN WARDROBE</span>
                          </div>
                          <Link href="/product/heavyweight-raglan-zip-hoodie" className="dior-checklist-link">
                            View piece
                          </Link>
                        </div>

                        <div className="dior-checklist-item">
                          <div className="dior-checklist-info">
                            <span className="dior-checklist-name">ESSENTIAL HEAVYWEIGHT SHORTS</span>
                            <span className="dior-checklist-status active">IN WARDROBE</span>
                          </div>
                          <Link href="/product/essential-heavyweight-shorts" className="dior-checklist-link">
                            View piece
                          </Link>
                        </div>

                        <div className="dior-checklist-item">
                          <div className="dior-checklist-info">
                            <span className="dior-checklist-name">UNISEX SUNFADE WAFFLE BOXY TEE</span>
                            <span className="dior-checklist-status inactive">UNREGISTERED</span>
                          </div>
                          <Link href="/product/unisex-sunfade-waffle-boxy-tee" className="dior-checklist-link">
                            Explore
                          </Link>
                        </div>

                      </div>
                    </div>

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
          margin: 0;
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

        /* Spotlight List (Recently Archived) */
        .dior-spotlight-section {
          margin-bottom: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid #ddd8d2;
        }
        .dior-spotlight-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .dior-spotlight-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 16px;
        }
        .dior-spotlight-thumb {
          width: 44px;
          height: 56px;
          object-fit: contain;
          background: rgba(0, 0, 0, 0.015);
          filter: grayscale(0.2);
        }
        .dior-spotlight-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dior-spotlight-season {
          font-size: 7px;
          letter-spacing: 0.2em;
          color: #7c7872;
        }
        .dior-spotlight-title {
          font-size: 8.5px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #2d2a26;
        }

        /* Filters Bar */
        .dior-filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd8d2;
          padding-bottom: 16px;
          margin-bottom: 40px;
        }
        .dior-filters-left {
          display: flex;
          gap: 32px;
        }
        .dior-filter-select-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dior-filter-label {
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7c7872;
        }
        .dior-filter-select {
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2d2a26;
          outline: none;
          cursor: pointer;
        }
        .dior-filter-select option {
          background: #ffffff;
          color: #2d2a26;
        }
        .dior-view-toggles {
          display: flex;
          gap: 16px;
        }
        .dior-view-btn {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: #7c7872;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
        }
        .dior-view-btn.active,
        .dior-view-btn:hover {
          color: #2d2a26;
        }

        /* Editorial Grid cards */
        .dior-editorial-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        .dior-product-card {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          display: flex;
          flex-direction: column;
        }
        .dior-card-media-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: rgba(0, 0, 0, 0.015);
          overflow: hidden;
          position: relative;
          display: block;
        }
        .dior-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(1) contrast(1.02);
          transition: filter 0.5s, transform 0.5s;
          padding: 24px;
          box-sizing: border-box;
        }
        .dior-product-card:hover .dior-card-img {
          filter: grayscale(0) contrast(1);
          transform: scale(1.015);
        }
        .dior-expired-badge {
          position: absolute;
          inset: 0;
          background: rgba(244, 243, 241, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: #2d2a26;
          backdrop-filter: blur(1.5px);
        }
        .dior-card-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
        }
        .dior-card-metadata {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .dior-card-id {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .dior-card-season {
          font-size: 7.5px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .dior-card-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin: 0 0 10px;
        }
        .dior-card-title a {
          color: #2d2a26;
          text-decoration: none;
        }
        .dior-card-price {
          font-size: 9.5px;
          color: #7c7872;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
        }
        .dior-retention-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 28px;
        }
        .dior-retention-wrap::before {
          content: "";
          height: 1px;
          background: #ddd8d2;
          width: 100%;
        }
        .dior-retention-line {
          height: 1px;
          background: #2d2a26;
        }
        .dior-product-card.expired .dior-retention-line {
          background: rgba(0, 0, 0, 0.08);
        }
        .dior-retention-lbls {
          display: flex;
          justify-content: space-between;
          font-size: 7.5px;
          letter-spacing: 0.2em;
          color: #7c7872;
        }
        .dior-card-dismiss-btn {
          background: transparent;
          border: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.2em;
          padding: 12px;
          cursor: pointer;
          transition: border-color 0.3s, color 0.3s;
          border-radius: 0;
          text-transform: uppercase;
        }
        .dior-card-dismiss-btn:hover {
          border-color: #2d2a26;
        }

        /* List View */
        .dior-list-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dior-list-row {
          display: grid;
          grid-template-columns: 64px 2fr 1.5fr 1fr auto;
          align-items: center;
          gap: 40px;
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 16px 24px;
        }
        .dior-list-img {
          width: 64px;
          height: 80px;
          object-fit: contain;
          background: rgba(0, 0, 0, 0.015);
          padding: 8px;
          box-sizing: border-box;
          filter: grayscale(0.5);
        }
        .dior-list-row:hover .dior-list-img {
          filter: grayscale(0);
        }
        .dior-list-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dior-list-id {
          font-size: 8px;
          color: #7c7872;
          letter-spacing: 0.25em;
        }
        .dior-list-title {
          font-family: var(--font-brand), serif;
          font-size: 12.5px;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .dior-list-title a { color: inherit; text-decoration: none; }
        .dior-list-season {
          font-size: 8px;
          color: #7c7872;
          letter-spacing: 0.15em;
        }
        .dior-list-retention {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dior-list-lbl {
          font-size: 7.5px;
          color: #7c7872;
          letter-spacing: 0.2em;
        }
        .dior-list-val {
          font-size: 8.5px;
          color: #2d2a26;
          letter-spacing: 0.1em;
        }
        .dior-list-price {
          font-size: 9.5px;
          color: #2d2a26;
          letter-spacing: 0.05em;
        }
        .dior-list-dismiss {
          background: none;
          border: none;
          color: #7c7872;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          text-transform: uppercase;
        }
        .dior-list-dismiss:hover {
          color: #2d2a26;
        }

        /* Sourcing Panel */
        .dior-sourcing-panel {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 44px;
          margin-bottom: 48px;
        }
        .dior-sourcing-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 24px;
        }
        .dior-textarea {
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
          min-height: 80px;
          resize: vertical;
        }
        .dior-textarea:focus {
          border-color: #2d2a26;
        }
        .dior-select {
          background: transparent;
          border: none;
          border-bottom: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.15em;
          padding: 10px 0;
          outline: none;
          border-radius: 0;
          cursor: pointer;
        }
        .dior-select option {
          background: #ffffff;
          color: #2d2a26;
        }
        .dior-form-success-msg {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #2d2a26;
          text-transform: uppercase;
          margin: 0;
        }

        /* Sourcing history requests list */
        .dior-requests-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dior-request-card {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dior-request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dior-request-id {
          font-size: 8.5px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .dior-request-badge {
          font-size: 7.5px;
          letter-spacing: 0.2em;
          border: 1px solid #ddd8d2;
          padding: 4px 8px;
          color: #2d2a26;
        }
        .dior-request-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .dior-request-details {
          display: flex;
          gap: 24px;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: #7c7872;
        }
        .dior-request-notes {
          font-size: 9.5px;
          font-style: italic;
          color: #7c7872;
          margin: 0;
          border-left: 1px solid #ddd8d2;
          padding-left: 12px;
        }
        .dior-request-dismiss {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-decoration: underline;
          text-underline-offset: 4px;
          color: #7c7872;
          cursor: pointer;
          align-self: flex-start;
          padding: 0;
          text-transform: uppercase;
        }
        .dior-request-dismiss:hover {
          color: #2d2a26;
        }

        /* Collections tab listing */
        .dior-collections-panel {
          display: flex;
          flex-direction: column;
        }
        .dior-collections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        .dior-collection-card {
          background: #ffffff;
          border: 1px solid #ddd8d2;
          cursor: pointer;
        }
        .dior-collection-img-wrap {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: rgba(0, 0, 0, 0.015);
          overflow: hidden;
        }
        .dior-collection-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.5);
          transition: filter 0.5s, transform 0.5s;
        }
        .dior-collection-card:hover .dior-collection-img {
          filter: grayscale(0);
          transform: scale(1.015);
        }
        .dior-collection-body {
          padding: 24px;
        }
        .dior-collection-season {
          font-size: 7px;
          letter-spacing: 0.3em;
          color: #7c7872;
          display: block;
          margin-bottom: 6px;
        }
        .dior-collection-title {
          font-family: var(--font-brand), serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
          margin: 0 0 14px;
        }
        .dior-collection-meta {
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: #7c7872;
        }

        /* Collections detail view lookbook */
        .dior-detail-view {
          display: flex;
          flex-direction: column;
          gap: 56px;
        }
        .dior-back-btn {
          align-self: flex-start;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8.5px;
          letter-spacing: 0.25em;
          color: #7c7872;
          cursor: pointer;
          transition: color 0.3s;
          padding: 4px 0;
          text-transform: uppercase;
        }
        .dior-back-btn:hover {
          color: #2d2a26;
        }
        .dior-detail-hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
          border-bottom: 1px solid #ddd8d2;
          padding-bottom: 40px;
        }
        .dior-detail-hero-info {
          display: flex;
          flex-direction: column;
        }
        .dior-detail-season {
          font-size: 8px;
          letter-spacing: 0.3em;
          color: #7c7872;
          margin-bottom: 10px;
        }
        .dior-detail-title {
          font-family: var(--font-brand), serif;
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0 0 20px;
        }
        .dior-detail-desc {
          font-size: 11px;
          line-height: 2.1;
          color: #7c7872;
          letter-spacing: 0.05em;
          margin: 0;
          max-width: 380px;
        }
        .dior-detail-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border: 1px solid #ddd8d2;
        }

        .dior-detail-lookbook-section {
          display: flex;
          flex-direction: column;
        }
        .dior-lookbook-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .dior-lookbook-img-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: rgba(0,0,0,0.015);
          border: 1px solid #ddd8d2;
        }
        .dior-lookbook-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.5);
          transition: filter 0.4s;
        }
        .dior-lookbook-img-wrap:hover .dior-lookbook-img {
          filter: grayscale(0);
        }

        /* Wardrobe checklist */
        .dior-detail-checklist {
          border-top: 1px solid #ddd8d2;
          padding-top: 40px;
        }
        .dior-checklist-list {
          display: flex;
          flex-direction: column;
          border: 1px solid #ddd8d2;
        }
        .dior-checklist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          background: #ffffff;
        }
        .dior-checklist-item:not(:last-child) {
          border-bottom: 1px solid #ddd8d2;
        }
        .dior-checklist-info {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .dior-checklist-name {
          font-family: var(--font-brand), serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #2d2a26;
        }
        .dior-checklist-status {
          font-size: 7.5px;
          letter-spacing: 0.2em;
        }
        .dior-checklist-status.active {
          color: #7c7872;
        }
        .dior-checklist-status.inactive {
          color: rgba(0,0,0,0.18);
        }
        .dior-checklist-link {
          font-size: 8.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2d2a26;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .dior-checklist-link:hover {
          color: #7c7872;
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
          margin-bottom: 24px;
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
          .dior-detail-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .dior-space-wrap {
            padding: 40px 16px 80px;
          }
          .dior-spotlight-list {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .dior-filters-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .dior-view-toggles {
            display: none;
          }
          .dior-editorial-grid {
            grid-template-columns: 1fr;
          }
          .dior-list-row {
            grid-template-columns: 48px 1fr;
            gap: 16px;
            padding: 16px;
          }
          .dior-list-img {
            width: 48px;
            height: 60px;
          }
          .dior-list-retention,
          .dior-list-price {
            display: none;
          }
          .dior-sourcing-panel {
            padding: 24px;
          }
          .dior-form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .dior-collections-grid {
            grid-template-columns: 1fr;
          }
          .dior-lookbook-grid {
            grid-template-columns: 1fr;
          }
          .dior-checklist-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px;
          }
          .dior-checklist-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
