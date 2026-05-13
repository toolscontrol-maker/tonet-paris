"use client";

import { useUI } from "@/context/UIContext";
import { useCart, CartLine } from "@/context/CartContext";
import { useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { X, Plus, Minus } from "lucide-react";

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
    document.body.style.overflow = isCartOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
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
        aria-label="Shopping bag"
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
                  {item.image && <img src={item.image} alt={item.name} draggable={false} />}
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
              <span className="cd-subtotal-label">SUBTOTAL</span>
              <span className="cd-subtotal-price">{totalFormatted}</span>
            </div>
            <button
              className="cd-checkout-btn"
              onClick={() => {
                if (cart.checkoutUrl) window.location.href = cart.checkoutUrl;
              }}
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ── BACKDROP ── */
        .cd-backdrop { display: none; }

        /* ── DRAWER ── */
        .cd-drawer {
          position: fixed;
          top: 0; right: 0;
          width: min(100vw, 460px);
          height: 100dvh;
          background: #ffffff;
          border-left: 1px solid #e0e0e0;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-primary, 'Creato Display', sans-serif);
          color: #000;
          overflow: hidden;
        }
        .cd-drawer.open { transform: translateX(0); }

        /* ── HEADER ── */
        .cd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e8e8e8;
          flex-shrink: 0;
        }
        .cd-header-spacer { width: 20px; }
        .cd-title {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .cd-close {
          background: none; border: none;
          cursor: pointer; color: #000;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
        }

        /* ── BODY ── */
        .cd-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .cd-body::-webkit-scrollbar { display: none; }

        /* ── EMPTY STATE ── */
        .cd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          padding: 0 20px 40px;
          gap: 16px;
        }
        .cd-empty-text {
          font-size: 11px;
          color: #888;
          letter-spacing: 0.04em;
          margin: 0;
        }
        .cd-continue-btn {
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          padding: 15px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        /* ── ITEM ── */
        .cd-item {
          display: flex;
          flex-direction: row;
          padding: 14px 16px 14px 16px;
          gap: 14px;
          border-bottom: 1px solid #ebebeb;
        }
        .cd-item-img {
          width: 42%;
          flex-shrink: 0;
          background: #ffffff;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .cd-item-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .cd-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 14px 14px 12px;
          gap: 6px;
        }
        .cd-item-name {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.4;
        }
        .cd-item-variant {
          font-size: 9px;
          color: #888;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .cd-qty-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }
        .cd-qty-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #000;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cd-qty-val {
          font-size: 11px;
          min-width: 16px;
          text-align: center;
        }
        .cd-item-price {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #b8920a;
          margin-top: auto;
        }

        /* ── FOOTER ── */
        .cd-footer {
          flex-shrink: 0;
          border-top: 1px solid #e8e8e8;
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cd-subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cd-subtotal-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }
        .cd-subtotal-price {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #b8920a;
        }
        .cd-checkout-btn {
          display: block;
          width: calc(100% - 48px);
          margin: 0 auto;
          background: #111;
          color: #fff;
          border: none;
          padding: 15px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cd-checkout-btn:hover { background: #333; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .cd-drawer { width: 100vw; border-left: none; }
          .cd-item { padding: 12px 12px 12px 12px; }
          .cd-item-img { width: 36%; }
        }
      `}</style>
    </>
  );
}
