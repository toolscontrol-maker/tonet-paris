"use client";

import { useUI } from "@/context/UIContext";
import { useCart, CartLine } from "@/context/CartContext";
import { useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { X, Plus, Minus } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/shopify";

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
  const { cart, updateQty, removeFromCart } = useCart();
  const { formatPrice } = useLocale();

  const items: CartItem[] = cart.lines.map(lineToItem);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  async function changeQty(id: string, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next = item.qty + delta;
    if (next <= 0) await removeFromCart(id);
    else await updateQty(id, next);
  }

  const totalFormatted = formatPrice(cart.totalAmount, cart.currencyCode ?? 'EUR');

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${isCartOpen ? "open" : ""}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`cd-drawer ${isCartOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="The Selection"
      >
        {/* ── HEADER ── */}
        <div className="cd-header">
          <div className="cd-header-spacer" />
          <span className="cd-title">SHOPPING BAG</span>
          <button className="cd-close" onClick={closeCart} aria-label="Close">
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="cd-body">
          {items.length === 0 ? (
            <div className="cd-empty-state">
              <p className="cd-empty-text">Your bag is empty</p>
              <button className="cd-continue-btn" onClick={closeCart}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cd-item">
                <div className="cd-item-img">
                  {item.image && <img src={getOptimizedImageUrl(item.image, 200)} alt={item.name} draggable={false} />}
                </div>
                <div className="cd-item-info">
                  <span className="cd-item-name">{item.name}</span>
                  <span className="cd-item-variant">
                    {[item.colour, item.size].filter(Boolean).join(' / ').toUpperCase() || 'ONE SIZE'}
                  </span>
                  <div className="cd-qty-row">
                    <button className="cd-qty-btn" onClick={() => changeQty(item.id, -1)} aria-label="Decrease"><Minus size={12} strokeWidth={1.5} /></button>
                    <span className="cd-qty-val">{item.qty}</span>
                    <button className="cd-qty-btn" onClick={() => changeQty(item.id, 1)} aria-label="Increase"><Plus size={12} strokeWidth={1.5} /></button>
                  </div>
                  <span className="cd-item-price">
                    {formatPrice(item.price * item.qty, 'EUR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-subtotal-row">
              <span className="cd-subtotal-label">Subtotal</span>
              <span className="cd-subtotal-price">{totalFormatted}</span>
            </div>
            <div className="cd-cta-group">
              <button
                className="cd-checkout-btn"
                onClick={() => {
                  if (cart.checkoutUrl) window.location.href = cart.checkoutUrl;
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .cd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1);
          z-index: 1000;
        }
        .cd-backdrop.open { opacity: 1; pointer-events: auto; }

        /* ══ DRAWER ══ */
        .cd-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(100vw, 480px); /* 10% wider (440px -> 480px) */
          background: #ffffff;
          border-left: 1px solid #eaeaea;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          font-family: var(--font-primary), sans-serif;
          color: #000000;
          overflow: hidden;
        }
        .cd-drawer.open { transform: translateX(0); }

        /* ══ HEADER ══ */
        .cd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px;
          border-bottom: none; /* No separator line */
          flex-shrink: 0;
        }
        .cd-header-spacer { width: 28px; }
        .cd-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #000000; /* Darker/black text */
        }
        .cd-close {
          background: none; border: none;
          cursor: pointer;
          color: #000000;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          transition: opacity 0.3s;
        }
        .cd-close:hover { opacity: 0.6; }
        .cd-close svg { stroke: currentColor; }

        /* ══ BODY ══ */
        .cd-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .cd-body::-webkit-scrollbar { display: none; }

        /* ══ EMPTY STATE ══ */
        .cd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 24px 48px;
          gap: 24px;
        }
        .cd-empty-text {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.4);
          margin: 0;
        }
        .cd-continue-btn {
          width: 100%;
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 16px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0;
          transition: opacity 0.3s;
        }
        .cd-continue-btn:hover {
          opacity: 0.85;
        }

        /* ══ ITEM ══ */
        .cd-item {
          display: flex;
          flex-direction: row;
          padding: 11px 24px;
          gap: 16px;
          border-bottom: none; /* No separator lines between products */
        }
        .cd-item-img {
          width: 60%; /* 60% of the cart width */
          flex-shrink: 0;
          background: #f7f8fa; /* Warm sand/bone background */
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 12px; /* Less zoomed in */
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); /* Subtle shadow effect */
        }
        .cd-item-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          mix-blend-mode: multiply;
        }
        .cd-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 4px 0;
          gap: 8px;
        }
        .cd-item-name {
          font-size: 9px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 1.5;
          color: #000000;
        }
        .cd-item-variant {
          font-size: 9px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cd-qty-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .cd-qty-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.45);
          line-height: 1;
          padding: 0;
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.3s;
        }
        .cd-qty-btn:hover { color: #000000; }
        .cd-qty-btn svg { stroke: currentColor; }
        .cd-qty-val {
          font-size: 10px;
          font-weight: 300;
          min-width: 16px;
          text-align: center;
          color: #000000;
          letter-spacing: 0.05em;
        }
        .cd-item-price {
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: rgba(0, 0, 0, 0.55);
          margin-top: auto;
        }

        /* ══ FOOTER ══ */
        .cd-footer {
          flex-shrink: 0;
          border-top: none; /* No top border line */
          padding: 20px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cd-subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cd-subtotal-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000; /* Darker subtotal label */
        }
        .cd-subtotal-price {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #000000;
        }
        .cd-cta-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .cd-checkout-btn {
          width: 100%;
          border: none;
          padding: 16px 8px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          border-radius: 0;
          background: #000000;
          color: #ffffff;
          transition: opacity 0.3s;
        }
        .cd-checkout-btn:hover { opacity: 0.85; }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .cd-drawer { width: 100vw; border-left: none; }
          .cd-header { padding: 16px 20px; }
          .cd-item { padding: 16px 20px; }
          .cd-footer { padding: 16px 20px 24px; }
          .cd-empty-state { padding: 0 20px 48px; }
          
          /* Active touch feedbacks */
          .cd-qty-btn:active,
          .cd-checkout-btn:active {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
