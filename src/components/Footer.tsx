"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const pathname = usePathname();
  const isMinimalPage = pathname === "/login"
    || pathname === "/wishlist"
    || pathname === "/contact"
    || pathname.startsWith("/account");
  const { t } = useTranslation();

  return (
    <footer className="footer">
      


      <div className="footer-links-container">
        
        {/* Column 1 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-1" className="accordion-toggle" defaultChecked />
          <label htmlFor="footer-col-1" className="col-title">{t('footer.contactUs')} <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">{t('footer.liveChat')} <span className="text-muted">{t('footer.offline')}</span></Link></li>
            <li><Link href="#">{t('footer.callLabel')} <span className="text-muted">{t('footer.offline')}</span></Link></li>
            <li><Link href="#">{t('footer.emailLabel')}</Link></li>
            {!isMinimalPage && (
              <li className="fnc-wrapper">
                <div className="footer-newsletter-compact">
                  <h4 className="fnc-title">Lo último en productos y diseño</h4>
                  <div className="fnc-form">
                    <input type="email" placeholder="Ingresa tu correo electrónico" className="fnc-input" />
                    <button type="submit" className="fnc-submit">Suscribirse</button>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-2" className="accordion-toggle" />
          <label htmlFor="footer-col-2" className="col-title">{t('footer.helpTitle')} <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="/contact">{t('footer.contactUsLink')}</Link></li>
            <li><Link href="/contact/order-status">{t('footer.orderStatus')}</Link></li>
            <li><Link href="/contact/returns">{t('footer.registerReturn')}</Link></li>
            <li><Link href="/contact/faqs">{t('footer.faqs')}</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-3" className="accordion-toggle" defaultChecked />
          <label htmlFor="footer-col-3" className="col-title">{t('footer.clientServices')} <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">{t('footer.services')}</Link></li>
            <li><Link href="#">{t('footer.accountLabel')}</Link></li>
            <li><Link href="#">{t('footer.findStore')}</Link></li>
            <li><Link href="#">{t('footer.productCare')}</Link></li>
            <li><Link href="#">{t('footer.giftCards')}</Link></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-4" className="accordion-toggle" defaultChecked />
          <label htmlFor="footer-col-4" className="col-title">{t('footer.company')} <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">{t('footer.about')}</Link></li>
            <li><Link href="#">{t('footer.press')}</Link></li>
            <li><Link href="#">{t('footer.careers')}</Link></li>
            <li><Link href="#">{t('footer.sustainability')}</Link></li>
            <li><Link href="#">{t('footer.legalPrivacy')}</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="bottom-left">
          <span className="copyright desktop-only">{t('footer.copyright')}</span>
          <Link href="#" className="cookie-link">{t('footer.cookieSettings')}</Link>
        </div>
        
        <div className="bottom-center socials">
          <span className="copyright mobile-only" style={{ marginRight: '8px', color: '#000' }}>{t('footer.copyright')}</span>
          <Link href="#">IG</Link>
          <Link href="#">FB</Link>
          <Link href="#">TW</Link>
          <Link href="#">YT</Link>
          <Link href="#">PT</Link>
          <Link href="#">WB</Link>
        </div>
        
      </div>

      <style>{`
        .footer {
          background-color: #fff;
          color: #000;
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.6;
          letter-spacing: 0.02em;
          border-top: none;
          scroll-snap-align: start;
          min-height: 80vh;
          min-height: 80dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .footer a {
          color: #000;
          text-decoration: none;
        }

        .footer a:hover {
          color: #333;
          text-decoration: underline;
        }

        .text-muted {
          color: #777;
          font-size: 10px;
          margin-left: 4px;
        }

        /* Promo Block */
        .footer-promos {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding: 2vw 2vw 0 2vw;
          gap: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .promo-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }

        .promo-card:hover h4 {
          text-decoration: underline;
        }

        .promo-image {
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .promo-image img {
          width: 100%;
          aspect-ratio: 10/16;
          object-fit: cover;
          display: block;
        }

        .promo-content {
          padding: 8px 8px 24px 8px;
          flex: 1;
        }

        .promo-content h4 {
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          margin: 0 0 10px 0;
          letter-spacing: 0.10em;
          line-height: 1.2;
        }

        .promo-content p {
          color: #999;
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
        }

        /* Newsletter Compact */
        .footer-newsletter-compact {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fnc-title {
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          margin: 0;
          color: #000;
        }
        .fnc-form {
          display: flex;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
        }
        .fnc-input {
          flex: 1;
          background: transparent !important;
          border: none !important;
          padding: 4px 0 !important;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          color: #000 !important;
        }
        .fnc-input::placeholder {
          color: #666;
        }
        .fnc-submit {
          background: transparent !important;
          border: none !important;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 0 4px 12px !important;
          color: #000 !important;
          text-transform: uppercase;
        }
        .fnc-submit:hover {
          color: #666 !important;
        }

        /* Columns Desktop */
        .footer-links-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 40px 20px 80px 20px;
          border-bottom: 1px solid #ededed;
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .accordion-toggle {
          display: none;
        }

        .col-title {
          font-size: 13px;
          font-weight: 400;
          text-transform: uppercase;
          margin-bottom: 24px;
          cursor: default;
          color: #000;
        }

        .col-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chevron {
          display: none;
        }

        /* Bottom Bar */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 20px 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .bottom-left, .bottom-right {
          flex: 1;
        }
        
        .bottom-right {
          text-align: right;
        }
        
        .bottom-center {
          flex: 2;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .bottom-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .copyright {
          font-family: var(--font-brand);
          font-size: 14px;
          text-transform: none;
          color: #000;
        }
        
        .shipping-link, .cookie-link {
          text-transform: uppercase;
        }
        button.shipping-link {
          background: none;
          border: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .mobile-only, .mobile-only-block {
          display: none;
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .desktop-only, .desktop-only-block { display: none !important; }
          .mobile-only { display: inline-block; }
          .mobile-only-block { display: block; }

          .footer {
            min-height: unset;
          }

          /* Accordion columns */
          .footer-links-container {
            display: flex;
            flex-direction: column;
            padding: 0;
            border-bottom: 1px solid #ededed;
            margin: 0;
            max-width: 100%;
            text-align: left;
          }

          .footer-col {
            border-bottom: 1px solid #ededed;
          }
          .footer-col:last-child { border-bottom: none; }

          .col-title {
            margin: 0;
            padding: 18px 16px;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            text-align: left;
          }

          .chevron {
            display: inline-block;
            width: 7px;
            height: 7px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            transform: rotate(45deg);
            transition: transform 0.25s;
            flex-shrink: 0;
          }

          .accordion-toggle:checked + .col-title .chevron {
            transform: rotate(-135deg);
          }

          .col-links {
            display: none;
            flex-direction: column;
            gap: 0;
            padding: 0 16px 16px;
            text-align: left;
          }

          .col-links li a {
            display: block;
            padding: 9px 0;
            font-size: 13px;
            color: #444;
            border-bottom: 1px solid #f3f3f3;
          }
          .col-links li:last-child a { border-bottom: none; }

          .accordion-toggle:checked ~ .col-links {
            display: flex;
          }

          /* Newsletter inside accordion */
          .fnc-wrapper { padding-top: 8px; }
          .footer-newsletter-compact { margin-top: 8px; }

          /* Bottom bar */
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            padding: 24px 16px 32px;
            margin: 0;
            max-width: 100%;
          }

          .bottom-center.socials {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            gap: 20px;
            flex-wrap: nowrap;
            width: 100%;
            margin-bottom: 20px;
            order: 1;
          }

          .bottom-left {
            order: 2;
          }

          .bottom-center.socials a {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.06em;
            color: #000;
            text-transform: uppercase;
          }

          .bottom-left {
            width: 100%;
            gap: 6px;
            display: flex;
            flex-direction: column;
          }

          .copyright {
            font-size: 13px;
            color: #888;
            font-family: var(--font-primary);
          }

          .cookie-link {
            font-size: 13px;
            color: #888;
            text-decoration: underline;
            text-underline-offset: 2px;
          }
        }
      `}</style>
    </footer>
  );
}
