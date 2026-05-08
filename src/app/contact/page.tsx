import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <div className="contact-wrap">
        <nav className="contact-tabs">
          <Link href="/contact" className="contact-tab active">Contact us</Link>
          <Link href="/contact/order-status" className="contact-tab">Order status</Link>
          <Link href="/contact/returns" className="contact-tab">Register a return</Link>
          <Link href="/contact/size-guide" className="contact-tab">Size guide</Link>
          <Link href="/contact/faqs" className="contact-tab">FAQs</Link>
        </nav>

        <div className="contact-body">
          <h1 className="contact-heading">Contact us</h1>
          <p className="contact-intro">
            Contact our client services advisors to receive personalised support on product related
            inquiries, tailored recommendations and styling advice, suggestions on gifts, account
            management and more.
          </p>

          <div className="contact-options">
            <div className="contact-option">
              <div className="contact-option-header">
                <span className="contact-option-title">Live chat</span>
                <span className="contact-badge">Offline</span>
              </div>
              <p className="contact-option-sub">Monday to Saturday, 9am to 6pm CET</p>
            </div>

            <div className="contact-option">
              <div className="contact-option-header">
                <span className="contact-option-title">Call</span>
                <span className="contact-badge">Offline</span>
              </div>
              <p className="contact-option-phone">+34 000 000 000</p>
              <p className="contact-option-sub">Monday to Saturday, 9am to 6pm CET</p>
            </div>

            <div className="contact-option">
              <div className="contact-option-header">
                <span className="contact-option-title">Email</span>
              </div>
              <a href="mailto:contact@tonetparis.com" className="contact-email">
                contact@tonetparis.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .contact-wrap {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          color: #111;
          min-height: 100vh;
          padding-top: 60px;
        }

        /* TABS */
        .contact-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #e0e0e0;
          padding: 0 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .contact-tabs::-webkit-scrollbar { display: none; }
        .contact-tab {
          padding: 14px 20px;
          font-size: 11px;
          text-transform: none;
          color: #555;
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .contact-tab:hover { color: #000; }
        .contact-tab.active {
          color: #000;
          border-bottom-color: #000;
        }

        /* BODY */
        .contact-body {
          max-width: 540px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .contact-heading {
          font-size: 22px;
          font-weight: 400;
          margin: 0 0 18px 0;
          letter-spacing: -0.01em;
        }

        .contact-intro {
          font-size: 12px;
          line-height: 1.75;
          color: #333;
          margin-bottom: 36px;
        }

        /* OPTIONS */
        .contact-options {
          display: flex;
          flex-direction: column;
        }
        .contact-option {
          padding: 18px 0;
          border-bottom: 1px solid #e8e8e8;
        }
        .contact-option:first-child { border-top: 1px solid #e8e8e8; }

        .contact-option-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }
        .contact-option-title {
          font-size: 12px;
          color: #0033bb;
          font-weight: 400;
        }
        .contact-badge {
          font-size: 10px;
          color: #888;
        }
        .contact-option-phone {
          font-size: 12px;
          color: #111;
          margin: 2px 0 4px;
        }
        .contact-option-sub {
          font-size: 11px;
          color: #666;
          margin: 0;
        }
        .contact-email {
          font-size: 12px;
          color: #111;
          text-decoration: none;
        }
        .contact-email:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}
