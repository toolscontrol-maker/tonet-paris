'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n';

const PHONE_PREFIXES = [
  { code: '+34', label: 'Spain (+34)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+1',  label: 'US/CA (+1)' },
  { code: '+46', label: 'Sweden (+46)' },
  { code: '+31', label: 'Netherlands (+31)' },
  { code: '+351', label: 'Portugal (+351)' },
  { code: '+41', label: 'Switzerland (+41)' },
];

export default function WelcomeClient() {
  const { user, isLoading } = useRequireAuth();
  const { updateProfile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [phonePrefix, setPhonePrefix] = useState('+34');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [newsletter, setNewsletter] = useState(false);

  if (isLoading || !user) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone: phone || undefined,
      phonePrefix: phone ? phonePrefix : undefined,
      birthDate: birthDate || undefined,
      newsletter,
      onboardingComplete: true,
    });
    router.push('/account');
  };

  const handleSkip = () => {
    updateProfile({ onboardingComplete: true });
    router.push('/account');
  };

  return (
    <>
      <div className="wb-wrap">
        <h1 className="wb-title">{t('welcome.title')}, {user.firstName}</h1>
        <p className="wb-subtitle">{t('welcome.subtitle')}</p>

        <form className="wb-form" onSubmit={handleContinue}>
          {/* Phone */}
          <label className="wb-label">{t('welcome.phone')}</label>
          <div className="wb-phone-row">
            <select
              className="wb-select"
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
            >
              {PHONE_PREFIXES.map(p => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
            <input
              type="tel"
              className="wb-input"
              placeholder={t('welcome.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Birth date */}
          <label className="wb-label">{t('welcome.birthDate')}</label>
          <input
            type="date"
            className="wb-input wb-input-full"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          {/* Newsletter */}
          <label className="wb-checkbox">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span>{t('welcome.newsletter')}</span>
          </label>

          <button type="submit" className="wb-btn wb-btn-primary">
            {t('welcome.continue')}
          </button>
        </form>

        <button className="wb-btn wb-btn-skip" onClick={handleSkip}>
          {t('welcome.skip')}
        </button>
      </div>

      <style>{`
        .wb-wrap {
          max-width: 480px;
          margin: 0 auto;
          padding: 60px 24px 80px;
          font-family: Arial, Helvetica, sans-serif;
          color: #111;
        }
        .wb-title {
          font-size: 19px;
          font-weight: 400;
          margin: 0 0 8px;
        }
        .wb-subtitle {
          font-size: 13px;
          color: #555;
          margin: 0 0 32px;
        }
        .wb-form {
          display: flex;
          flex-direction: column;
        }
        .wb-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          margin-bottom: 8px;
        }
        .wb-phone-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .wb-select {
          width: 160px;
          background: #f7f7f7;
          border: none;
          padding: 14px 12px;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #111;
          outline: none;
          appearance: none;
        }
        .wb-input {
          flex: 1;
          background: #f7f7f7;
          border: none;
          padding: 14px 12px;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #111;
          outline: none;
        }
        .wb-input-full {
          width: 100%;
          margin-bottom: 24px;
        }
        .wb-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
          color: #333;
          margin-bottom: 32px;
          cursor: pointer;
        }
        .wb-checkbox input[type="checkbox"] {
          margin-top: 2px;
          width: 16px;
          height: 16px;
          accent-color: #000;
        }
        .wb-btn {
          width: 100%;
          padding: 16px;
          font-size: 11px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          font-weight: 500;
          border: 1px solid #000;
          transition: background 0.2s, color 0.2s;
        }
        .wb-btn-primary {
          background: #000;
          color: #fff;
          margin-bottom: 12px;
        }
        .wb-btn-primary:hover {
          background: #FAF8F5;
          color: #000;
        }
        .wb-btn-skip {
          background: transparent;
          color: #111;
        }
        .wb-btn-skip:hover {
          background: #f0f0f0;
        }
        @media (max-width: 767px) {
          .wb-wrap { padding: 32px 16px 100px; }
        }
      `}</style>
    </>
  );
}
