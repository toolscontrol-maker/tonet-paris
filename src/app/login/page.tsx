"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/lib/i18n";

type Step = 'email' | 'login' | 'register';

export default function LoginPage() {
  const { login, register, loginWithGoogle, emailExists, user } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect handled by AuthContext
  // but show nothing while it processes
  if (user) {
    return (
      <div className="login-page">
        <div className="login-container">
          <p style={{ textAlign: 'center', paddingTop: 80 }}>{t('auth.redirecting')}</p>
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
      setError(t('auth.nameRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMin'));
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
    <div className="login-page">
      <div className="login-container">
        
        <h1 className="login-title">{t('auth.title')}</h1>
        
        <div className="login-location">
          Spain, <a href="#" className="change-location">{t('auth.changeLocation')}</a>
        </div>

        {step === 'email' && (
          <>
            <ul className="login-benefits">
              <li>{t('auth.benefit1')}</li>
              <li>{t('auth.benefit2')}</li>
              <li>{t('auth.benefit3')}</li>
              <li>{t('auth.benefit4')}</li>
              <li>{t('auth.benefit5')}</li>
            </ul>

            <form className="login-form" onSubmit={handleEmailSubmit}>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="EMAIL"
                  required
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-continue">
                {t('auth.continue')}
              </button>
            </form>

            <div className="login-divider"><span>OR</span></div>

            <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="btn-google-text">GOOGLE</span>
            </button>
          </>
        )}

        {step === 'login' && (
          <>
            <p className="login-step-info">{email}</p>
            <button className="login-back-link" onClick={() => { setStep('email'); setError(''); }}>&larr; {t('auth.changeEmail')}</button>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder={t('auth.password')}
                  required
                  className="email-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="btn-continue" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signInBtn')}
              </button>
            </form>
          </>
        )}

        {step === 'register' && (
          <>
            <p className="login-step-info">{t('auth.createAccount')} <strong>{email}</strong></p>
            <button className="login-back-link" onClick={() => { setStep('email'); setError(''); }}>&larr; {t('auth.changeEmail')}</button>

            <form className="login-form" onSubmit={handleRegister}>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder={t('auth.firstName')}
                  required
                  className="email-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder={t('auth.lastName')}
                  required
                  className="email-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder={t('auth.password')}
                  required
                  minLength={6}
                  className="email-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="btn-continue" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.registerBtn')}
              </button>
            </form>
          </>
        )}

        <div className="login-footer">
          This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
        </div>

      </div>

      <style>{`
        .login-page {
          min-height: calc(100vh - 48px);
          display: flex;
          justify-content: center;
          padding: 80px 20px;
          background: #FAF8F5;
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 480px;
        }

        .login-title {
          font-size: 19px;
          font-weight: 400;
          margin-bottom: 8px;
        }

        .login-location {
          font-size: 13px;
          color: #111;
          margin-bottom: 24px;
        }

        .change-location {
          color: #0000ee;
          text-decoration: none;
        }

        .change-location:hover {
          text-decoration: underline;
        }

        .login-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          font-size: 13px;
          color: #333;
        }

        .login-benefits li {
          position: relative;
          padding-left: 16px;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .login-benefits li::before {
          content: "-";
          position: absolute;
          left: 0;
          top: 0;
        }

        .login-form {
          margin-bottom: 24px;
        }

        .input-wrapper {
          background-color: #f7f7f7;
          margin-bottom: 16px;
        }

        .email-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 18px 16px;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #000;
          outline: none;
          text-transform: uppercase;
        }

        .email-input::placeholder {
          color: #888;
        }

        .btn-continue {
          width: 100%;
          background: #000;
          color: #fff;
          border: none;
          padding: 18px 16px;
          font-size: 11px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          cursor: pointer;
          font-weight: 500;
          letter-spacing: 0.5px;
          border: 1px solid #000;
          transition: background-color 0.2s, color 0.2s;
        }

        .btn-continue:hover {
          background: #FAF8F5;
          color: #000;
        }

        .login-divider {
          text-align: center;
          margin: 24px 0;
          position: relative;
        }
        
        .login-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e4e4e4;
          z-index: 1;
        }

        .login-divider span {
          background: #FAF8F5;
          padding: 0 16px;
          color: #888;
          font-size: 11px;
          position: relative;
          z-index: 2;
          font-family: Arial, sans-serif;
        }

        .btn-google {
          width: 100%;
          background: #FAF8F5;
          border: 1px solid #111;
          color: #000;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: Arial, sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-google:hover {
          background: #f7f7f7;
        }

        .login-footer {
          margin-top: 24px;
          font-size: 9px;
          color: #888;
          text-align: right;
          font-family: Arial, sans-serif;
        }

        .login-footer a {
          color: #0000ee;
          text-decoration: none;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        .login-step-info {
          font-size: 13px;
          color: #111;
          margin: 0 0 8px;
        }
        .login-back-link {
          background: none;
          border: none;
          color: #0000cc;
          font-size: 11px;
          font-family: Arial, sans-serif;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          display: inline-block;
          text-decoration: none;
          letter-spacing: 0.02em;
        }
        .login-back-link:hover {
          text-decoration: underline;
        }
        .login-error {
          color: #cc0000;
          font-size: 11px;
          margin: -8px 0 12px;
        }
        .btn-continue:disabled,
        .btn-google:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
