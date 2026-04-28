"use client";

interface Props {
  title: string;
  badge?: string;
  subtitle: string;
  onClick: () => void;
  borderBottom?: boolean;
}

export default function ProductInfoBlock({ title, badge, subtitle, onClick, borderBottom = false }: Props) {
  return (
    <div className={`pib-block${borderBottom ? " pib-border-bottom" : ""}`} onClick={onClick}>
      <div className="pib-main">
        <div className="pib-title-row">
          <span className="pib-title">{title}</span>
          {badge && <span className="pib-badge">{badge}</span>}
        </div>
        <p className="pib-sub">{subtitle}</p>
      </div>
      <span className="pib-arrow">›</span>

      <style>{`
        .pib-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid #ededed;
          cursor: pointer;
          color: #000;
          background: transparent;
          user-select: none;
          transition: background 0.12s ease, color 0.12s ease, padding 0.12s ease;
          margin: 0 -12px;
          padding-left: 12px;
          padding-right: 12px;
        }
        .pib-border-bottom { border-bottom: 1px solid #ededed; }
        .pib-block:hover {
          background: #000;
          color: #fff;
        }
        .pib-main { flex: 1; min-width: 0; }
        .pib-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .pib-title {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          line-height: 1.2;
          color: #0000cc;
          transition: color 0.12s ease;
        }
        .pib-block:hover .pib-title { color: #fff; }
        .pib-badge {
          font-size: 10px;
          font-weight: 400;
          color: #768194;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: color 0.12s ease;
        }
        .pib-block:hover .pib-badge { color: rgba(255,255,255,0.6); }
        .pib-sub {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #555;
          margin: 0;
          transition: color 0.12s ease;
        }
        .pib-block:hover .pib-sub { color: rgba(255,255,255,0.75); }
        .pib-arrow {
          font-size: 18px;
          color: #0000cc;
          flex-shrink: 0;
          margin-left: 12px;
          transition: color 0.12s ease;
        }
        .pib-block:hover .pib-arrow { color: #fff; }
      `}</style>
    </div>
  );
}
