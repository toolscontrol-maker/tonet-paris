"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <footer className="footer">
      
      {!isLoginPage && (
        <>
          <div className="footer-promos">
            <Link href="#" className="promo-card">
              <div className="promo-image">
                <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Shipping" />
              </div>
              <div className="promo-content">
                <h4>FREE SHIPPING & RETURNS</h4>
                <p>Fast delivery and easy returns or exchanges on all orders.</p>
              </div>
            </Link>
            <Link href="#" className="promo-card">
              <div className="promo-image">
                <img src="https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Gallery" />
              </div>
              <div className="promo-content">
                <h4>ACNE PAPER PALAIS ROYAL</h4>
                <p>A permanent gallery by Acne Studios, merging fashion, art, and publishing beneath the arcades.</p>
              </div>
            </Link>
            <Link href="#" className="promo-card">
              <div className="promo-image">
                <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Gift Card" />
              </div>
              <div className="promo-content">
                <h4>GIFT CARD</h4>
                <p>Acne Studios digital gift cards are delivered instantly by email, redeemable online and in store.</p>
              </div>
            </Link>
            <Link href="#" className="promo-card">
              <div className="promo-image">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=500" alt="Runway" />
              </div>
              <div className="promo-content">
                <h4>FW26 RUNWAY</h4>
                <p>Acne Studios presents Women's Fall/Winter 2026. Launching online and in stores September 2026.</p>
              </div>
            </Link>
            <Link href="#" className="promo-card">
              <div className="promo-image">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=500" alt="Stores" />
              </div>
              <div className="promo-content">
                <h4>DISCOVER OUR STORES</h4>
                <p>Explore our store locator to discover your nearest Acne Studios destination.</p>
              </div>
            </Link>
          </div>

          <div className="footer-newsletter">
            <h3>NEWSLETTER</h3>
            <p>Receive news about Acne Studios collections, Acne Paper, events and sales.</p>
            <div className="newsletter-input-wrapper">
              <input type="email" placeholder="EMAIL" />
            </div>
          </div>
        </>
      )}

      <div className="footer-links-container">
        
        {/* Column 1 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-1" className="accordion-toggle" />
          <label htmlFor="footer-col-1" className="col-title">CONTACT US <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">Live chat <span className="text-muted">Offline</span></Link></li>
            <li><Link href="#">Call <span className="text-muted">Offline</span></Link></li>
            <li><Link href="#">Email</Link></li>
          </ul>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-2" className="accordion-toggle" />
          <label htmlFor="footer-col-2" className="col-title">HELP <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">Contact us</Link></li>
            <li><Link href="#">Order status</Link></li>
            <li><Link href="#">Register a return</Link></li>
            <li><Link href="#">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-3" className="accordion-toggle" />
          <label htmlFor="footer-col-3" className="col-title">CLIENT SERVICES <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">Acne Studios Services</Link></li>
            <li><Link href="#">Account</Link></li>
            <li><Link href="#">Find a store</Link></li>
            <li><Link href="#">Product care</Link></li>
            <li><Link href="#">Gift Cards</Link></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <input type="checkbox" id="footer-col-4" className="accordion-toggle" />
          <label htmlFor="footer-col-4" className="col-title">COMPANY <span className="chevron"></span></label>
          <ul className="col-links">
            <li><Link href="#">About</Link></li>
            <li><Link href="#">Press</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Sustainability</Link></li>
            <li><Link href="#">Legal & Privacy</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="bottom-shipping mobile-only-block" style={{ marginBottom: "24px" }}>
          <Link href="#" className="shipping-link">SHIPPING TO SPAIN (ENGLISH)</Link>
        </div>

        <div className="bottom-left">
          <span className="copyright desktop-only">© 2026 ACNE STUDIOS</span>
          <Link href="#" className="cookie-link">Cookie settings</Link>
        </div>
        
        <div className="bottom-center socials">
          <span className="copyright mobile-only" style={{ marginRight: '8px', color: '#000' }}>© 2026 ACNE STUDIOS</span>
          <Link href="#">IG</Link>
          <Link href="#">FB</Link>
          <Link href="#">TW</Link>
          <Link href="#">YT</Link>
          <Link href="#">PT</Link>
          <Link href="#">WB</Link>
        </div>
        
        <div className="bottom-right desktop-only-block">
          <Link href="#" className="shipping-link">SHIPPING TO SPAIN (ENGLISH)</Link>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: #fff;
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          border-top: 1px solid #ededed;
        }
        
        .footer a {
          color: #0000cc;
          text-decoration: none;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        .text-muted {
          color: #888;
          font-size: 10px;
          margin-left: 4px;
        }

        /* Promo Block */
        .footer-promos {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-bottom: 1px solid #ededed;
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
          color: #0000cc;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 500;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
        }

        .promo-content p {
          color: #555;
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
        }

        /* Newsletter */
        .footer-newsletter {
          text-align: center;
          padding: 60px 20px;
          border-bottom: 1px solid #ededed;
        }

        .footer-newsletter h3 {
          font-size: 12px;
          font-weight: 400;
          margin: 0 0 6px 0;
          text-transform: uppercase;
        }

        .footer-newsletter p {
          margin: 0 0 24px 0;
          color: #333;
        }

        .newsletter-input-wrapper input {
          width: 100%;
          max-width: 440px;
          background-color: #f9f9f9;
          border: none;
          padding: 16px 16px;
          font-size: 12px;
          font-family: inherit;
          text-transform: uppercase;
          outline: none;
        }

        .newsletter-input-wrapper input::placeholder {
          color: #888;
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
          font-size: 12px;
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
          text-transform: uppercase;
          color: #000;
        }
        
        .shipping-link, .cookie-link {
          text-transform: uppercase;
        }

        .mobile-only, .mobile-only-block {
          display: none;
        }

        /* Mobile specific adjustments */
        @media (max-width: 767px) {
          .desktop-only, .desktop-only-block {
            display: none !important;
          }

          .mobile-only {
            display: inline-block;
          }

          .mobile-only-block {
            display: block;
          }

          .footer-newsletter {
            padding: 40px 20px;
          }

          .footer-links-container {
            display: flex;
            flex-direction: column;
            padding: 0;
          }

          .footer-col {
            border-bottom: 1px solid #ededed;
          }

          .col-title {
            margin: 0;
            padding: 24px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
          }

          .chevron {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            transform: rotate(45deg);
            transition: transform 0.3s;
          }

          .accordion-toggle:checked + .col-title .chevron {
            transform: rotate(-135deg);
          }

          .col-links {
            display: none;
            padding: 0 20px 24px 20px;
          }

          .accordion-toggle:checked ~ .col-links {
            display: flex;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 32px 20px;
          }

          .bottom-left {
            gap: 0;
            width: 100%;
          }

          .bottom-center {
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 12px;
            width: 100%;
          }

          /* Promo grid becomes a horizontal scroll carousel on mobile */
          .footer-promos {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            border-bottom: 1px solid #ededed;
            gap: 0;
          }

          .footer-promos::-webkit-scrollbar {
            display: none;
          }

          .promo-card {
            flex: 0 0 72vw; /* About 72% of viewport so you can peek the next one */
            max-width: 72vw;
            scroll-snap-align: start;
            border-right: 1px solid #ededed;
          }

          .promo-card:last-child {
            border-right: none;
          }

          .footer-promos {
            padding: 12px 8px 0 8px;
          }

          .promo-image {
            padding: 0;
          }

          .promo-image img {
            aspect-ratio: 10/16;
          }

          .promo-content {
            padding: 12px 16px 32px 16px;
          }
        }
      `}</style>
    </footer>
  );
}
