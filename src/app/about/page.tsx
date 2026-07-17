"use client";

import { useEffect } from "react";

export default function HousePage() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".house-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("house-visible");
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* ════════════════════════════════════════
           THE HOUSE PAGE — TONET TORRENTINNI
        ════════════════════════════════════════ */

        /* Reveal */
        .house-reveal {
          opacity: 0;
          transform: translateY(26px);
          transition: opacity 1.5s cubic-bezier(0.16,1,0.3,1),
                      transform 1.5s cubic-bezier(0.16,1,0.3,1);
        }
        .house-reveal.house-visible { opacity: 1; transform: translateY(0); }
        .h-d1 { transition-delay: 0.12s; }
        .h-d2 { transition-delay: 0.26s; }
        .h-d3 { transition-delay: 0.4s; }
        .h-d4 { transition-delay: 0.54s; }
        .h-d5 { transition-delay: 0.68s; }
        .h-d6 { transition-delay: 0.82s; }

        /* Section eyebrow */
        .h-eyebrow {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.52em;
          text-transform: uppercase;
          font-family: var(--font-primary);
          padding-right: 0.52em;
        }
        .h-eyebrow-light { color: rgba(255,255,255,0.2); margin-bottom: 52px; }
        .h-eyebrow-dark  { color: rgba(0,0,0,0.28);       margin-bottom: 52px; }

        /* ── 1. HERO ──────────────────────────────── */
        .h-hero {
          position: relative;
          height: 100vh;
          min-height: 560px;
          background: #0d0d0d;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }
        .h-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
        }
        .h-hero-grad {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.94) 0%,
            rgba(0,0,0,0.38) 45%,
            rgba(0,0,0,0.06) 100%
          );
        }
        .h-hero-body {
          position: relative;
          z-index: 2;
          padding: 0 64px 84px 64px;
        }
        .h-hero-tag {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.6em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          font-family: var(--font-primary);
          margin-bottom: 26px;
        }
        .h-hero-title {
          font-size: clamp(54px, 8.5vw, 112px);
          font-weight: 300;
          line-height: 0.93;
          letter-spacing: 0.008em;
          color: rgba(255,255,255,0.88);
          font-family: var(--font-brand);
          margin: 0 0 30px 0;
        }
        .h-hero-sub {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          padding-right: 0.46em;
          color: rgba(255,255,255,0.24);
          font-family: var(--font-primary);
          margin: 0;
        }
        .h-hero-scroll {
          position: absolute;
          bottom: 44px;
          right: 64px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .h-hero-scroll-lbl {
          font-size: 7px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.16);
          font-family: var(--font-primary);
          writing-mode: vertical-rl;
        }
        .h-hero-scroll-line {
          width: 1px;
          height: 52px;
          background: rgba(255,255,255,0.16);
          animation: h-pulse 2.6s ease-in-out infinite;
        }
        @keyframes h-pulse {
          0%, 100% { opacity: 0.16; }
          50%       { opacity: 0.6; }
        }

        /* ── 2. MANIFESTO ──────────────────────────── */
        .h-manifesto {
          background: #EEEDED;
          padding: 148px 40px;
          display: flex;
          justify-content: center;
        }
        .h-manifesto-inner {
          max-width: 680px;
          width: 100%;
          text-align: center;
        }
        .h-manifesto-p {
          font-size: 14px;
          font-weight: 300;
          line-height: 2.05;
          letter-spacing: 0.03em;
          color: rgba(0,0,0,0.52);
          font-family: var(--font-primary);
          margin: 0 0 36px 0;
        }
        .h-manifesto-p:last-child { margin-bottom: 0; }
        .h-manifesto-line {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: rgba(0,0,0,0.28);
          font-family: var(--font-primary);
          font-style: italic;
          display: block;
          margin-top: 52px;
        }

        /* ── 3. ATMOSPHERE 1 ───────────────────────── */
        .h-atm1 {
          background: #0d0d0d;
          min-height: 78vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 48px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .h-atm1-quote {
          font-size: clamp(24px, 3.8vw, 46px);
          font-weight: 300;
          line-height: 1.28;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.48);
          font-family: var(--font-brand);
          max-width: 740px;
          margin: 0 auto 36px;
        }
        .h-atm1-attr {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          padding-right: 0.46em;
          color: rgba(255,255,255,0.14);
          font-family: var(--font-primary);
          display: block;
        }

        /* ── 4. PHILOSOPHY ─────────────────────────── */
        .h-philosophy {
          background: #0d0d0d;
          padding: 0 64px 140px 64px;
          border-top: 1px solid rgba(255,255,255,0.03);
        }
        .h-philosophy-inner { max-width: 1100px; margin: 0 auto; }
        .h-principles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .h-principle {
          padding: 52px 52px 52px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .h-principle:nth-child(3n)   { border-right: none; padding-right: 0; }
        .h-principle:nth-last-child(-n+3) { border-bottom: none; }
        .h-p-title {
          display: block;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.68);
          font-family: var(--font-primary);
          margin-bottom: 14px;
        }
        .h-p-body {
          display: block;
          font-size: 10px;
          font-weight: 300;
          line-height: 1.85;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.26);
          font-family: var(--font-primary);
        }

        /* ── 5. THE UNIFORM ────────────────────────── */
        .h-uniform {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 82vh;
        }
        .h-uniform-text {
          background: #EEEDED;
          padding: 120px 88px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .h-uniform-title {
          font-size: clamp(34px, 4.2vw, 60px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: 0.02em;
          color: rgba(0,0,0,0.8);
          font-family: var(--font-brand);
          margin: 0 0 48px 0;
        }
        .h-uniform-p {
          font-size: 12px;
          font-weight: 300;
          line-height: 2.05;
          letter-spacing: 0.03em;
          color: rgba(0,0,0,0.4);
          font-family: var(--font-primary);
          margin: 0 0 22px 0;
          max-width: 440px;
        }
        .h-uniform-p:last-child { margin-bottom: 0; }
        .h-uniform-visual {
          background: linear-gradient(170deg, #181818 0%, #0d0d0d 60%, #111 100%);
        }

        /* ── 6. PULL QUOTE ─────────────────────────── */
        .h-pullquote {
          background: #111;
          padding: 140px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .h-pullquote-inner { max-width: 700px; }
        .h-pq-text {
          font-size: clamp(18px, 2.8vw, 38px);
          font-weight: 300;
          line-height: 1.45;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.4);
          font-family: var(--font-brand);
          margin: 0 0 36px 0;
        }
        .h-pq-attr {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          padding-right: 0.46em;
          color: rgba(255,255,255,0.13);
          font-family: var(--font-primary);
        }

        /* ── 7. THE RESIDENCE ──────────────────────── */
        .h-residence {
          background: #E8E5E1;
          padding: 148px 40px;
          display: flex;
          justify-content: center;
        }
        .h-residence-inner {
          max-width: 720px;
          width: 100%;
        }
        .h-residence-title {
          font-size: clamp(34px, 4.2vw, 56px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: 0.02em;
          color: rgba(0,0,0,0.78);
          font-family: var(--font-brand);
          margin: 0 0 56px 0;
        }
        .h-residence-p {
          font-size: 12px;
          font-weight: 300;
          line-height: 2.05;
          letter-spacing: 0.03em;
          color: rgba(0,0,0,0.38);
          font-family: var(--font-primary);
          margin: 0 0 24px 0;
        }
        .h-residence-p:last-child { margin-bottom: 0; }

        /* ── 8. CLOSING ─────────────────────────────── */
        .h-closing {
          background: #0d0d0d;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 40px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .h-closing-tag {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          padding-right: 0.5em;
          color: rgba(255,255,255,0.14);
          font-family: var(--font-primary);
          margin-bottom: 36px;
        }
        .h-closing-title {
          font-size: clamp(52px, 9vw, 118px);
          font-weight: 300;
          line-height: 0.93;
          letter-spacing: 0.008em;
          color: rgba(255,255,255,0.72);
          font-family: var(--font-brand);
          margin: 0;
        }
        .h-closing-note {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          padding-right: 0.5em;
          color: rgba(255,255,255,0.1);
          font-family: var(--font-primary);
          margin-top: 52px;
        }

        /* ── RESPONSIVE ─────────────────────────────── */
        @media (max-width: 900px) {
          .h-hero-body    { padding: 0 28px 68px 28px; }
          .h-hero-scroll  { display: none; }
          .h-manifesto    { padding: 100px 28px; }
          .h-manifesto-inner { text-align: left; }
          .h-atm1         { min-height: 56vh; padding: 80px 28px; }
          .h-philosophy   { padding: 0 28px 100px 28px; }
          .h-principles   { grid-template-columns: 1fr; }
          .h-principle    {
            padding: 36px 0 !important;
            border-right: none !important;
          }
          .h-principle:nth-last-child(-n+3) { border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
          .h-principle:last-child            { border-bottom: none !important; }
          .h-uniform      { grid-template-columns: 1fr; }
          .h-uniform-text { padding: 80px 28px; }
          .h-uniform-p    { max-width: 100%; }
          .h-uniform-visual { min-height: 50vh; order: -1; }
          .h-pullquote    { padding: 100px 28px; }
          .h-residence    { padding: 100px 28px; }
          .h-residence-inner { max-width: 100%; }
          .h-closing      { min-height: 60vh; padding: 96px 28px; }
        }
      `}</style>

      {/* ── 1. HERO ── */}
      <section className="h-hero">
        <video
          className="h-hero-video"
          src="/hero-video.mp4"
          autoPlay muted loop playsInline
        />
        <div className="h-hero-grad" />
        <div className="h-hero-body">
          <span className="h-hero-tag">The House of Tonet Torrentinni</span>
          <h1 className="h-hero-title">
            Contemporary<br />Nobility.
          </h1>
          <p className="h-hero-sub">Established in silence.</p>
        </div>
        <div className="h-hero-scroll">
          <span className="h-hero-scroll-lbl">Scroll</span>
          <div className="h-hero-scroll-line" />
        </div>
      </section>

      {/* ── 2. MANIFESTO ── */}
      <section className="h-manifesto">
        <div className="h-manifesto-inner house-reveal">
          <span className="h-eyebrow h-eyebrow-dark">The Manifesto</span>
          <p className="h-manifesto-p">
            TONET TORRENTINNI was not built for the moment. It was constructed for permanence —
            deeply integrated with the silent geometry of natural landscapes —
            for those who understand that true elegance is never loud, and that
            refinement requires no explanation.
          </p>
          <p className="h-manifesto-p">
            We do not follow seasons. We do not follow culture. We build a system
            of dress for those who have already arrived — for those who
            need no introduction.
          </p>
          <p className="h-manifesto-p">
            The garment is not a statement. It is a condition.
          </p>
          <span className="h-manifesto-line">The House of Tonet Torrentinni — 2026</span>
        </div>
      </section>

      {/* ── 3. ATMOSPHERE I ── */}
      <section className="h-atm1">
        <div className="house-reveal">
          <p className="h-atm1-quote">
            Silence as architecture.<br />Restraint as identity.
          </p>
          <span className="h-atm1-attr">House of Tonet Torrentinni</span>
        </div>
      </section>

      {/* ── 4. PHILOSOPHY ── */}
      <section className="h-philosophy">
        <div className="h-philosophy-inner">
          <span className="h-eyebrow h-eyebrow-light house-reveal">The Philosophy</span>
          <div className="h-principles">
            {([
              ["Silence over noise.",        "The House does not perform. It simply exists, like nature in its purest form."],
              ["Structure over excess.",     "Discipline is the foundation of every garment."],
              ["Permanence over trends.",    "We do not chase. We endure, rooted like ancient landscapes."],
              ["Elegance without performance.", "Status requires no announcement."],
              ["Contemporary nobility.",    "A modern inheritance, built for the present."],
              ["Emotional restraint.",      "The most powerful language is silence."],
            ] as [string, string][]).map(([title, body], i) => (
              <div
                key={title}
                className={`h-principle house-reveal h-d${(i % 3) + 1}`}
              >
                <span className="h-p-title">{title}</span>
                <span className="h-p-body">{body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. THE UNIFORM ── */}
      <section className="h-uniform">
        <div className="h-uniform-text house-reveal">
          <span className="h-eyebrow h-eyebrow-dark">The Uniform</span>
          <h2 className="h-uniform-title">A System<br />of Dress.</h2>
          <p className="h-uniform-p">
            The TONET TORRENTINNI garment is not a fashion object. It is a disciplined system
            of dress designed for those who move through the world with
            inherited certainty.
          </p>
          <p className="h-uniform-p">
            Dark palettes. Precise cuts. Restrained silhouettes. Each piece is
            constructed to function as part of a singular aristocratic uniform —
            worn across decades, not seasons.
          </p>
          <p className="h-uniform-p">
            The clothing does not speak.<br />
            The wearer does.
          </p>
        </div>
        <div className="h-uniform-visual" />
      </section>

      {/* ── 6. PULL QUOTE ── */}
      <section className="h-pullquote">
        <div className="h-pullquote-inner house-reveal">
          <p className="h-pq-text">
            "The most elegant gesture is one<br />
            that requires no audience."
          </p>
          <span className="h-pq-attr">— House of Tonet Torrentinni</span>
        </div>
      </section>

      {/* ── 7. THE RESIDENCE ── */}
      <section className="h-residence">
        <div className="h-residence-inner house-reveal">
          <span className="h-eyebrow h-eyebrow-dark">The Residence</span>
          <h2 className="h-residence-title">
            The House<br />Exists in Space.
          </h2>
          <p className="h-residence-p">
            TONET TORRENTINNI is not a virtual identity. It exists inside real architecture —
            in European apartments, private libraries, stone corridors, and silent
            rooms where light enters slowly and deliberately.
          </p>
          <p className="h-residence-p">
            These are the spaces that shaped the TONET TORRENTINNI aesthetic: marble, shadow,
            natural light, wood aged by centuries. The garments were designed
            inside these rooms. They belong here.
          </p>
        </div>
      </section>

      {/* ── 8. CLOSING ── */}
      <section className="h-closing">
        <div className="house-reveal">
          <span className="h-closing-tag">Since the beginning</span>
          <h2 className="h-closing-title">
            The House<br />Remains.
          </h2>
          <span className="h-closing-note">Contemporary Nobility</span>
        </div>
      </section>
    </>
  );
}
