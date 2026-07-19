'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { user, login, register, loginWithGoogle, isLoading } = useAuth();
  const router = useRouter();

  // Sign In states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNewsletter, setRegNewsletter] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/account');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    const err = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (err) {
      setLoginError(err);
    } else {
      router.push('/account');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('All fields are required.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    setRegLoading(true);
    setRegError('');
    const err = await register(regEmail, regPassword, regFirstName, regLastName);
    setRegLoading(false);
    if (err) {
      setRegError(err);
    } else {
      router.push('/account');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    const err = await loginWithGoogle();
    setLoginLoading(false);
    if (err) {
      setLoginError(err);
    }
  };

  if (isLoading || user) {
    return (
      <div className="auth-loading-screen">
        <p>Verifying Maison Access…</p>
        <style>{`
          .auth-loading-screen {
            background: #f4f3f1;
            color: #2d2a26;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
            font-family: var(--font-primary), sans-serif;
            font-size: 9px;
            letter-spacing: 0.25em;
            text-transform: uppercase;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page-root">
      {/* ══ TOP LOGO HEADER ══ */}
      <header className="auth-header">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-text">TONET</span>
        </Link>
      </header>

      {/* ══ MAIN ONBOARDING PORTAL ══ */}
      <main className="auth-portal-wrap">
        <div className="auth-portal-grid">
          
          {/* LEFT COLUMN: SIGN IN */}
          <section className="auth-col">
            <h1 className="auth-col-title">Sign In</h1>
            <p className="auth-col-intro">
              Log in to your verified Maison account to view your Personal Archive, track Past Acquisitions, and coordinate private Sourcing Requests.
            </p>

            {loginError && <p className="auth-error-msg">{loginError}</p>}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-group">
                <label className="auth-label" htmlFor="login-email">Email Address *</label>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="login-password">Password *</label>
                <input
                  id="login-password"
                  type="password"
                  className="auth-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-btn-dark" disabled={loginLoading}>
                {loginLoading ? 'VERIFYING RECORD...' : 'SIGN IN'}
              </button>

              <button type="button" className="auth-btn-outline" onClick={handleGoogleSignIn} disabled={loginLoading}>
                SIGN IN WITH GOOGLE
              </button>
            </form>
          </section>

          {/* RIGHT COLUMN: CREATE ACCOUNT */}
          <section className="auth-col auth-col--right">
            <h1 className="auth-col-title">Create Account</h1>
            <p className="auth-col-intro">
              Register a private collector profile to gain access to exclusive collection drops, track archive garment retention times, and source unavailable pieces.
            </p>

            {regError && <p className="auth-error-msg">{regError}</p>}

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-form-row">
                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-first-name">First Name *</label>
                  <input
                    id="reg-first-name"
                    type="text"
                    className="auth-input"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-last-name">Last Name *</label>
                  <input
                    id="reg-last-name"
                    type="text"
                    className="auth-input"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="reg-email">Email Address *</label>
                <input
                  id="reg-email"
                  type="email"
                  className="auth-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="reg-password">Password *</label>
                <input
                  id="reg-password"
                  type="password"
                  className="auth-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="auth-checkbox-group">
                <label className="auth-checkbox-lbl">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={regNewsletter}
                    onChange={(e) => setRegNewsletter(e.target.checked)}
                  />
                  <span className="auth-checkbox-text">
                    I wish to receive personalized updates on new collections, private archive drops, and events from TONET TORRENTINNI.
                  </span>
                </label>
              </div>

              <button type="submit" className="auth-btn-dark" disabled={regLoading}>
                {regLoading ? 'CREATING HOUSE RECORD...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </section>

        </div>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="auth-footer">
        <span className="auth-footer-link">PRIVACY POLICY</span>
        <span className="auth-footer-link">LEGAL NOTICE</span>
      </footer>

      <style>{`
        /* ══ LUXURY LIGHT BEIGE PALETTE ══ */
        .auth-page-root {
          background: #f4f3f1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-primary), sans-serif;
          color: #2d2a26;
          box-sizing: border-box;
        }

        /* Header logo */
        .auth-header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 24px;
          border-bottom: 1px solid #ddd8d2;
          background: #ffffff;
        }
        .auth-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-logo-text {
          font-family: var(--font-primary), sans-serif;
          font-size: 26px;
          color: #000000;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Portal grid layout */
        .auth-portal-wrap {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 80px 24px;
          box-sizing: border-box;
        }
        .auth-portal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 96px;
        }

        .auth-col {
          display: flex;
          flex-direction: column;
        }
        .auth-col--right {
          border-left: 1px solid #ddd8d2;
          padding-left: 96px;
        }

        .auth-col-title {
          font-family: var(--font-brand), serif;
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0 0 16px;
          text-transform: uppercase;
        }
        .auth-col-intro {
          font-size: 11px;
          line-height: 2.1;
          color: #7c7872;
          letter-spacing: 0.05em;
          margin: 0 0 44px;
          max-width: 440px;
        }

        .auth-error-msg {
          font-size: 10px;
          letter-spacing: 0.05em;
          color: #c0392b;
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        /* Forms */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .auth-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .auth-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #7c7872;
        }
        .auth-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.12em;
          padding: 10px 0;
          outline: none;
          border-radius: 0;
          transition: border-color 0.4s;
        }
        .auth-input:focus {
          border-color: #2d2a26;
        }

        /* Checkbox */
        .auth-checkbox-group {
          margin-top: 10px;
        }
        .auth-checkbox-lbl {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          cursor: pointer;
        }
        .auth-checkbox {
          accent-color: #34383d;
          width: 14px;
          height: 14px;
          border-radius: 0 !important;
          margin-top: 3px;
        }
        .auth-checkbox-text {
          font-size: 10px;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: #7c7872;
        }

        /* Buttons */
        .auth-btn-dark {
          background: #34383d;
          color: #f7f5f0;
          font-family: inherit;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.3em;
          border: none;
          padding: 18px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
          margin-top: 12px;
          text-transform: uppercase;
        }
        .auth-btn-dark:hover {
          opacity: 0.9;
        }
        .auth-btn-outline {
          background: transparent;
          border: 1px solid #ddd8d2;
          color: #2d2a26;
          font-family: inherit;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.3em;
          padding: 18px;
          cursor: pointer;
          transition: border-color 0.3s;
          border-radius: 0;
          text-transform: uppercase;
          text-align: center;
        }
        .auth-btn-outline:hover {
          border-color: #2d2a26;
        }

        /* Footer */
        .auth-footer {
          display: flex;
          justify-content: center;
          gap: 40px;
          padding: 44px;
          border-top: 1px solid #ddd8d2;
          background: #ffffff;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: #7c7872;
        }
        .auth-footer-link {
          cursor: pointer;
          transition: color 0.3s;
        }
        .auth-footer-link:hover {
          color: #2d2a26;
        }

        @media (max-width: 991px) {
          .auth-portal-grid {
            gap: 48px;
          }
          .auth-col--right {
            padding-left: 48px;
          }
        }

        @media (max-width: 767px) {
          .auth-portal-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .auth-col--right {
            border-left: none;
            padding-left: 0;
            border-top: 1px solid #ddd8d2;
            padding-top: 60px;
          }
          .auth-portal-wrap {
            padding: 44px 20px;
          }
        }
      `}</style>
    </div>
  );
}
