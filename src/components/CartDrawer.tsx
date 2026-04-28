"use client";

import { useUI } from "@/context/UIContext";
import { useCart, CartLine } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  colour: string;
  size: string;
  qty: number;
  image: string;
}

function lineToItem(line: CartLine): CartItem {
  const colourOpt = line.options.find(
    (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
  );
  const sizeOpt = line.options.find((o) => o.name.toLowerCase() === "size");
  return {
    id: line.id,
    variantId: line.variantId,
    name: line.name,
    price: line.price,
    colour: colourOpt?.value ?? "",
    size: sizeOpt?.value ?? (line.variantTitle || ""),
    qty: line.quantity,
    image: line.image,
  };
}

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUI();
  const { cart, cartCount, addToCart, removeFromCart, updateQty } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();

  const items: CartItem[] = cart.lines.map(lineToItem);

  const [undoItem, setUndoItem] = useState<CartItem | null>(null);
  const [undoType, setUndoType] = useState<"remove" | "wishlist" | null>(null);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isCartOpen]);

  async function changeQty(id: string, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateQty(id, item.qty + delta);
  }

  async function removeItem(id: string, type: "remove" | "wishlist") {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setUndoItem(item);
    setUndoType(type);
    await removeFromCart(id);
    setTimeout(() => {
      setUndoItem(null);
      setUndoType(null);
    }, 5000);
  }

  async function undoRemove() {
    if (!undoItem) return;
    await addToCart(undoItem.variantId, undoItem.qty);
    setUndoItem(null);
    setUndoType(null);
  }

  const totalFormatted = formatPrice(cart.totalAmount, cart.currencyCode ?? 'EUR');

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${isCartOpen ? "open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`cd-drawer ${isCartOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* ── HEADER ── */}
        <div className="cd-header">
          <span className="cd-bag-label">
            {t('cart.bag')}{" "}
            <span className="cd-count">
              {String(cartCount).padStart(2, "0")}
            </span>
          </span>
          <button className="cd-close" onClick={closeCart}>
            {t('cart.close')}
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="cd-body">
          {/* Undo confirmation bar */}
          {undoItem && (
            <div className="cd-undo-bar">
              <span>
                {undoType === "wishlist"
                  ? t('cart.movedToWishlist')
                  : t('cart.itemRemoved')}
              </span>
              <button className="cd-undo-btn" onClick={undoRemove}>
                {t('cart.undo')}
              </button>
            </div>
          )}

          {items.length === 0 && !undoItem && (
            <div className="cd-empty">{t('cart.empty')}</div>
          )}


          {items.map((item) => (
            <div key={item.id} className="cd-item">
              {/* Name + Price */}
              <div className="cd-item-header">
                <span className="cd-item-name">{item.name}</span>
                <span className="cd-item-price">
                  {formatPrice(item.price * item.qty, 'EUR')}
                </span>
              </div>

              {/* Thumbnail + Attributes */}
              <div className="cd-item-body">
                <div className="cd-item-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cd-item-attrs">
                  <div className="cd-attr">{t('cart.colour')}: {item.name.toUpperCase()}</div>
                  <div className="cd-attr">{(item.size || t('cart.oneSize')).toUpperCase()}</div>
                  <div className="cd-qty-row">
                    <button
                      className="cd-qty-btn"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="cd-qty-val">{item.qty}</span>
                    <button
                      className="cd-qty-btn"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="cd-item-actions">
                <button
                  className="cd-action-btn"
                  onClick={() => removeItem(item.id, "wishlist")}
                >
                  {t('cart.moveToWishlist')}
                </button>
                <button
                  className="cd-action-btn"
                  onClick={() => removeItem(item.id, "remove")}
                >
                  {t('cart.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className="cd-footer">
          <div className="cd-shipping-row">
            <div className="cd-row-top">
              <span>{t('cart.shipping')}</span>
              <span>{t('cart.free')}</span>
            </div>
            <p className="cd-row-sub">
              {t('cart.shippingEstimate')}
            </p>
          </div>

          <div className="cd-total-row">
            <div className="cd-row-top">
              <span>{t('cart.total')}</span>
              <span>{totalFormatted}</span>
            </div>
            <p className="cd-row-sub">{t('cart.inclVat')}</p>
          </div>

          <button
            className="cd-checkout-btn"
            onClick={() => {
              if (cart.checkoutUrl) window.location.href = cart.checkoutUrl;
            }}
            disabled={items.length === 0}
          >
            {t('cart.checkout')}
          </button>

          <div className="cd-payment-icons">
            <span className="pi pi-visa">VISA</span>
            <svg width="26" height="16" viewBox="0 0 26 16" aria-label="Mastercard">
              <circle cx="8" cy="8" r="8" fill="#eb001b" />
              <circle cx="18" cy="8" r="8" fill="#f79e1b" />
            </svg>
            <span className="pi pi-amex">AMEX</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0077a6"
              strokeWidth="2.5"
              aria-label="Diners"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            <span className="pi pi-discover">DISCOVER</span>
            <span className="pi pi-sofort">Sofort.</span>
            <span className="pi pi-klarna">Klarna.</span>
            <span className="pi pi-paypal">Pay</span>
          </div>
        </div>
      </div>

      <style>{`
        /* ── BACKDROP ── */
        .cd-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1000;
          opacity: 0; pointer-events: none;
          transition: none;
        }
        .cd-backdrop.open { opacity: 1; pointer-events: auto; }

        /* ── DRAWER ── */
        .cd-drawer {
          position: fixed;
          top: 0; right: 0;
          /* Tonet Studios: ~400px on desktop, 100vw on mobile */
          width: min(100vw, 400px);
          height: 100dvh;
          background: #FAF8F5;
          border-left: 1px solid #d0d0d0;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: none;
          font-family: 'HK Grotesk', 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #000;
          overflow: hidden;
        }
        .cd-drawer.open { transform: translateX(0); }

        /* ── HEADER ── */
        .cd-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid #000;
          flex-shrink: 0;
        }
        .cd-bag-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.10em; }
        .cd-close {
          background: none; border: none;
          color: #0000cc; font-family: inherit;
          font-size: 11px; font-weight: 400; cursor: pointer;
          text-transform: uppercase; padding: 4px 0;
          letter-spacing: 0.08em;
          /* Larger tap target on mobile */
          min-width: 72px; text-align: right;
        }

        /* ── BODY ── */
        .cd-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Undo bar */
        .cd-undo-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f0f0f0;
          border-bottom: 1px solid #d0d0d0;
          font-size: 11px;
          text-transform: uppercase;
        }
        .cd-undo-btn {
          background: none; border: none;
          color: #0000cc; font-family: inherit;
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; cursor: pointer;
          padding: 8px 0; /* Larger tap target */
        }

        /* Empty state */
        .cd-empty {
          padding: 40px 16px;
          text-align: center;
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }

        /* ── ITEM ── */
        .cd-item { border-bottom: 1px solid #000; }

        .cd-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 14px 16px 10px;
          gap: 12px;
          border-bottom: 1px solid #ededed;
        }
        .cd-item-name {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          flex: 1;
          line-height: 1.3;
        }
        .cd-item-price { font-size: 12px; font-weight: 400; letter-spacing: 0.03em; white-space: nowrap; }

        /* Thumbnail + attrs row */
        .cd-item-body { display: flex; }

        .cd-item-img {
          width: 34%; flex-shrink: 0;
          background: #f5f5f5;
          display: flex; align-items: center; justify-content: center;
          border-right: 1px solid #ededed;
          min-height: 120px;
        }
        .cd-item-img img {
          width: 80%; height: auto;
          display: block; mix-blend-mode: multiply;
        }

        .cd-item-attrs {
          flex: 1; display: flex; flex-direction: column;
        }
        .cd-attr {
          padding: 10px 14px;
          font-size: 11px; text-transform: uppercase;
          border-bottom: 1px solid #ededed;
          display: flex; align-items: center; flex: 1;
        }

        /* Qty row */
        .cd-qty-row {
          display: flex; height: 44px;
        }
        .cd-qty-btn {
          flex: 1; background: #FAF8F5; border: none;
          font-size: 1.1rem; cursor: pointer; color: #000;
          /* Tap target */
          min-width: 44px;
          display: flex; align-items: center; justify-content: center;
        }
        .cd-qty-btn:active { background: #f0f0f0; }
        .cd-qty-val {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          font-size: 12px;
          border-left: 1px solid #ededed;
          border-right: 1px solid #ededed;
        }

        /* Actions */
        .cd-item-actions {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
        }
        .cd-action-btn {
          background: none; border: none;
          color: #0000cc; font-family: inherit;
          font-size: 11px; text-transform: uppercase;
          padding: 8px 0; /* mobile tap target */
          cursor: pointer;
        }
        .cd-action-btn:hover { text-decoration: underline; }

        /* ── FOOTER ── */
        .cd-footer { flex-shrink: 0; }

        .cd-shipping-row {
          padding: 12px 16px;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
        }
        .cd-total-row { padding: 12px 16px; }

        .cd-row-top {
          display: flex; justify-content: space-between;
          font-size: 12px; text-transform: uppercase;
          margin-bottom: 4px;
        }
        .cd-row-sub {
          font-size: 11px; color: #768194;
          margin: 0; line-height: 1.5;
        }

        /* Checkout button */
        .cd-checkout-btn {
          display: block;
          width: calc(100% - 32px);
          margin: 0 16px 14px;
          background: #111;
          color: #fff;
          border: none;
          /* Tall enough for easy tapping */
          padding: 17px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          cursor: pointer;
          border-radius: 0;
          transition: opacity 0.2s;
        }
        .cd-checkout-btn:hover { opacity: 0.85; }

        /* Payment icons */
        .cd-payment-icons {
          display: flex; align-items: center;
          justify-content: center; flex-wrap: wrap;
          gap: 10px;
          padding: 0 16px 20px;
        }
        .pi { font-size: 10px; color: #000; }
        .pi-visa { font-style: italic; font-weight: 900; color: #1a1f71; letter-spacing: -0.5px; }
        .pi-amex { font-weight: 700; color: #007bc1; font-size: 9px; }
        .pi-discover { font-weight: 600; color: #f76f20; }
        .pi-sofort { font-weight: 600; }
        .pi-klarna { font-weight: 600; color: #ff69a1; }
        .pi-paypal { font-style: italic; font-weight: 700; color: #003087; }

        /* ── MOBILE: full-width, bigger tap targets already handled above ── */
        @media (max-width: 480px) {
          .cd-drawer { width: 100vw; border-left: none; }
          /* Give the close button more space on mobile */
          .cd-header { padding: 16px; }
          .cd-close { font-size: 13px; }
          /* Slightly larger action btns on mobile */
          .cd-action-btn { font-size: 12px; }
        }
      `}</style>
    </>
  );
}
