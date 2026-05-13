'use client';

import { useState, useEffect } from 'react';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizes?: string[];
  preselectedSize?: string;
  productTitle?: string;
}

export default function NotifyMeModal({
  isOpen,
  onClose,
  sizes = [],
  preselectedSize = '',
  productTitle = '',
}: NotifyMeModalProps) {
  const [selectedSize, setSelectedSize] = useState(preselectedSize);
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync preselected size when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(preselectedSize);
      setEmail('');
      setAgreed(false);
      setNewsletter(false);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen, preselectedSize]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Privacy Policy to continue.');
      return;
    }
    setError('');
    setLoading(true);

    // TODO: wire up to Klaviyo / email marketing API
    // e.g. await fetch('/api/notify', { method: 'POST', body: JSON.stringify({ email, size: selectedSize, product: productTitle, newsletter }) })
    await new Promise(r => setTimeout(r, 600)); // simulate network

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      {/* Overlay */}
      <div className="nm-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="nm-modal" role="dialog" aria-modal="true" aria-labelledby="nm-title">
        <div className="nm-header">
          <span className="nm-title" id="nm-title">NOTIFY ME</span>
          <button className="nm-close-btn" onClick={onClose} aria-label="Close">
            ✕ CLOSE
          </button>
        </div>

        {submitted ? (
          <div className="nm-success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <p className="nm-success-title">You're on the list</p>
            <p className="nm-success-sub">
              We'll email you at <strong>{email}</strong> when{productTitle ? ` ${productTitle}` : ' this product'} is back in stock
              {selectedSize ? ` in size ${selectedSize}` : ''}.
            </p>
            <button className="nm-done-btn" onClick={onClose}>DONE</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="nm-form" noValidate>
            <p className="nm-subtitle">
              Select your size and we will email you when this product is back in stock.
            </p>

            {sizes.length > 0 && (
              <div className="nm-sizes">
                {sizes.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`nm-size-btn${selectedSize === s ? ' active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <input
              type="email"
              className={`nm-email${error && !email ? ' nm-input-error' : ''}`}
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
            />

            <label className="nm-check-label">
              <input
                type="checkbox"
                className="nm-checkbox"
                checked={agreed}
                onChange={e => { setAgreed(e.target.checked); setError(''); }}
              />
              <span>
                I confirm that I have read and understood the{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>
              </span>
            </label>

            <label className="nm-check-label">
              <input
                type="checkbox"
                className="nm-checkbox"
                checked={newsletter}
                onChange={e => setNewsletter(e.target.checked)}
              />
              <span>I would like to receive updates about new launches and other inspirational content</span>
            </label>

            {error && <p className="nm-error">{error}</p>}

            <button type="submit" className="nm-submit-btn" disabled={loading}>
              {loading ? 'SENDING…' : 'NOTIFY ME'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .nm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 900;
        }
        .nm-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 901;
          background: #fff;
          width: min(520px, calc(100vw - 32px));
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          font-family: 'Creato Display', sans-serif;
          color: #111;
        }
        .nm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 16px;
          border-bottom: 1px solid #e8e8e8;
        }
        .nm-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .nm-close-btn {
          background: none;
          border: none;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          cursor: pointer;
          color: #111;
          font-family: inherit;
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nm-close-btn:hover { opacity: 0.6; }

        /* Form */
        .nm-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .nm-subtitle {
          font-size: 12px;
          font-weight: 400;
          line-height: 1.6;
          color: #333;
          margin: 0;
        }

        /* Size grid */
        .nm-sizes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          border: 1px solid #d8d8d8;
        }
        .nm-size-btn {
          padding: 14px 8px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border: none;
          border-right: 1px solid #d8d8d8;
          border-radius: 0;
          background: #fff;
          cursor: pointer;
          color: #111;
          text-align: center;
          transition: background 0.12s;
        }
        .nm-size-btn:last-child { border-right: none; }
        .nm-size-btn:hover { background: #f5f5f5; }
        .nm-size-btn.active { background: #99bbff; color: #111; }

        /* Email */
        .nm-email {
          width: 100%;
          padding: 14px 12px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid #d8d8d8;
          border-radius: 0;
          background: #fff;
          outline: none;
          color: #111;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .nm-email::placeholder { color: #aaa; }
        .nm-email:focus { border-color: #111; }
        .nm-email.nm-input-error { border-color: #cc0000; }

        /* Checkboxes */
        .nm-check-label {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 11px;
          font-weight: 400;
          line-height: 1.55;
          color: #333;
          cursor: pointer;
        }
        .nm-checkbox {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 1px;
          border: 1px solid #aaa;
          border-radius: 0;
          cursor: pointer;
          accent-color: #111;
        }
        .nm-check-label a { color: #0000cc; text-decoration: none; }
        .nm-check-label a:hover { text-decoration: underline; }

        /* Error */
        .nm-error {
          font-size: 11px;
          color: #cc0000;
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* Submit */
        .nm-submit-btn {
          width: 100%;
          padding: 18px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 0;
          font-size: 11px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 4px;
        }
        .nm-submit-btn:hover { opacity: 0.85; }
        .nm-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Success state */
        .nm-success {
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .nm-success-title {
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .nm-success-sub {
          font-size: 12px;
          font-weight: 400;
          line-height: 1.6;
          color: #555;
          margin: 0;
        }
        .nm-done-btn {
          margin-top: 16px;
          padding: 14px 40px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 0;
          font-size: 11px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          cursor: pointer;
        }
        .nm-done-btn:hover { opacity: 0.85; }

        @media (max-width: 480px) {
          .nm-modal {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            transform: none;
            width: 100%;
            max-height: 90vh;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
}
