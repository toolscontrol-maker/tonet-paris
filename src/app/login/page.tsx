"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Step = 'email' | 'login' | 'register';

export default function LoginPage() {
  const { login, register, loginWithGoogle, emailExists, user } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="ss-login-page">
        <div className="ss-login-container">
          <p style={{ textAlign: 'center', paddingTop: 80 }}>Redirecting…</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    if (emailExists(email)) {
      setStep('login');
    } else {
      setStep('register');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await login(email, password);
    if (err) { setError(err); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await register(email, password, firstName, lastName);
    if (err) { setError(err); setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const err = await loginWithGoogle();
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div className="ss-login-page">
      <div className="ss-login-container">

        <h1 className="ss-login-title">Register or Log in</h1>

        {step === 'email' && (
          <>
            <form className="ss-login-form" onSubmit={handleEmailSubmit}>
              <div className="ss-input-wrap">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="ss-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="ss-login-error">{error}</p>}
              <button type="submit" className="ss-btn-continue">
                Continue
              </button>
            </form>

            <div className="ss-divider"><span>or</span></div>

            <button type="button" className="ss-btn-social" onClick={handleGoogle} disabled={loading}>
              <svg className="ss-social-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {step === 'login' && (
          <>
            <p className="ss-step-email">{email}</p>
            <button className="ss-back-link" onClick={() => { setStep('email'); setError(''); }}>&larr; Change email</button>

            <form className="ss-login-form" onSubmit={handleLogin}>
              <div className="ss-input-wrap">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="ss-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="ss-login-error">{error}</p>}
              <button type="submit" className="ss-btn-continue" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {step === 'register' && (
          <>
            <p className="ss-step-email">Create account for <strong>{email}</strong></p>
            <button className="ss-back-link" onClick={() => { setStep('email'); setError(''); }}>&larr; Change email</button>

            <form className="ss-login-form" onSubmit={handleRegister}>
              <div className="ss-input-wrap">
                <input
                  type="text"
                  placeholder="First name"
                  required
                  className="ss-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="ss-input-wrap">
                <input
                  type="text"
                  placeholder="Last name"
                  required
                  className="ss-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="ss-input-wrap">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  className="ss-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="ss-login-error">{error}</p>}
              <button type="submit" className="ss-btn-continue" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </>
        )}

        <p className="ss-login-privacy">
          We process your personal data to create an account and to provide our services. Read in our{' '}
          <a href="#">Privacy policy</a> how we process this data.
        </p>

      </div>

      <style>{`
        .ss-login-page {
          min-height: calc(100vh - 48px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 80px 20px 60px;
          background: #fff;
          color: #111;
          font-family: 'HK Grotesk', 'Inter', Arial, sans-serif;
        }

        .ss-login-container {
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        .ss-login-title {
          font-size: 28px;
          font-weight: 400;
          line-height: 1.3;
          margin: 0 0 40px 0;
          letter-spacing: -0.01em;
          color: #111;
        }

        /* ── Form ── */
        .ss-login-form {
          text-align: left;
        }

        .ss-input-wrap {
          margin-bottom: 16px;
        }

        .ss-input {
          width: 100%;
          padding: 16px 14px;
          font-size: 14px;
          font-family: inherit;
          color: #111;
          background: #fff;
          border: 1px solid #d0d0d0;
          border-radius: 0;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }

        .ss-input:focus {
          border-color: #111;
        }

        .ss-input::placeholder {
          color: #999;
          font-weight: 400;
        }

        .ss-btn-continue {
          width: 100%;
          padding: 16px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 500;
          color: #fff;
          background: #111;
          border: 1px solid #111;
          border-radius: 0;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.15s, color 0.15s;
        }

        .ss-btn-continue:hover:not(:disabled) {
          background: #333;
        }

        .ss-btn-continue:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Divider ── */
        .ss-divider {
          text-align: center;
          margin: 28px 0;
          position: relative;
        }

        .ss-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e0e0e0;
        }

        .ss-divider span {
          background: #fff;
          padding: 0 16px;
          font-size: 13px;
          color: #999;
          position: relative;
        }

        /* ── Social buttons ── */
        .ss-btn-social {
          width: 100%;
          padding: 14px 16px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 400;
          color: #111;
          background: #fff;
          border: 1px solid #d0d0d0;
          border-radius: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: background 0.12s;
          margin-bottom: 10px;
        }

        .ss-btn-social:hover:not(:disabled) {
          background: #f8f8f8;
        }

        .ss-btn-social:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ss-social-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        /* ── Step info ── */
        .ss-step-email {
          font-size: 14px;
          color: #111;
          margin: 0 0 8px;
          text-align: left;
        }

        .ss-back-link {
          background: none;
          border: none;
          color: #111;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          display: inline-block;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-align: left;
        }

        .ss-back-link:hover {
          color: #555;
        }

        .ss-login-error {
          color: #cc0000;
          font-size: 12px;
          margin: -8px 0 12px;
          text-align: left;
        }

        /* ── Privacy footer ── */
        .ss-login-privacy {
          margin-top: 40px;
          font-size: 12px;
          color: #888;
          line-height: 1.6;
          text-align: center;
        }

        .ss-login-privacy a {
          color: #111;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ss-login-privacy a:hover {
          color: #555;
        }

        @media (max-width: 480px) {
          .ss-login-page {
            padding: 60px 16px 40px;
          }
          .ss-login-title {
            font-size: 24px;
            margin-bottom: 32px;
          }
        }
      `}</style>
    </div>
  );
}
