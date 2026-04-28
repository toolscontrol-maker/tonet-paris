'use client';

import { useMemo } from 'react';
import Link from 'next/link';

const HERO_IMAGES = [
  '/hero/ComfyUI-main_reference_00012_.png',
  '/hero/ComfyUI-main_reference_00016_.png',
  '/hero/ComfyUI-main_reference_00017_.png',
  '/hero/ComfyUI-main_reference_00018_.png',
  '/hero/ComfyUI-main_reference_00019_.png',
  '/hero/ComfyUI-main_reference_00020_.png',
  '/hero/ComfyUI-main_reference_00021_.png',
  '/hero/ComfyUI-main_reference_00022_.png',
  '/hero/ComfyUI-main_reference_00023_.png',
  '/hero/ComfyUI-main_reference_00028_.png',
  '/hero/ComfyUI-main_reference_00032_.png',
];

const LABELS = [
  'SHOP NEW COLLECTION',
  'SHOP LAST COLLECTIONS',
  'NEW ARRIVALS',
  'CURATED SELECTION',
  'SHOP THE LOOK',
  'EXPLORE MORE',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HeroSection() {
  const images = useMemo(() => shuffle(HERO_IMAGES).slice(0, 6), []);

  return (
    <div className="hero-wrapper">
      <div className="hero-brand-anchor" aria-hidden="true">
        <div className="hero-brand-text">Tonet Studios</div>
      </div>

      {/* Block 1: Split 2 images */}
      <div className="hero-block hero-block--split">
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[0]}')` }}>
          <span className="shop-label">{LABELS[0]}</span>
        </Link>
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[1]}')` }}>
          <span className="shop-label">{LABELS[1]}</span>
        </Link>
      </div>

      {/* Block 2: Split 2 images */}
      <div className="hero-block hero-block--split">
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[2]}')` }}>
          <span className="shop-label">{LABELS[2]}</span>
        </Link>
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[3]}')` }}>
          <span className="shop-label">{LABELS[3]}</span>
        </Link>
      </div>

      {/* Block 3: Full width */}
      <div className="hero-block hero-block--full">
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[4]}')` }}>
          <span className="shop-label">{LABELS[4]}</span>
        </Link>
      </div>

      {/* Block 4: Full width */}
      <div className="hero-block hero-block--full">
        <Link href="#" className="hero-panel" style={{ backgroundImage: `url('${images[5]}')` }}>
          <span className="shop-label">{LABELS[5]}</span>
        </Link>
      </div>
    </div>
  );
}
