"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct, getOptimizedImageUrl } from '@/lib/shopify';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
  relatedProductsByTag?: Product[];
}

function parseMetadata(desc?: string | null): Record<string, string> {
  if (!desc) return {};
  const regex = /(Item Number|Gender|Fabric Weight|Fabric Thickness|Fabric Stretch|Fabric|Care Instructions|Features|Print Size|Notes):\s*/gi;
  const matches: { key: string; index: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(desc)) !== null) {
    matches.push({
      key: match[1],
      index: match.index,
      length: match[0].length
    });
  }
  
  const result: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index + current.length;
    const end = next ? next.index : desc.length;
    let keyName = current.key.trim();
    if (keyName.toLowerCase() === 'fabric strench') {
      keyName = 'Fabric Stretch';
    }
    result[keyName] = desc.substring(start, end).trim();
  }
  return result;
}

function colorNameToCSS(name: string): string {
  const n = name.toLowerCase().trim();
  const map: Record<string, string> = {
    black: '#111111', white: '#ffffff', grey: '#888888', gray: '#888888',
    'light gray': '#c8c8c8', 'dark gray': '#444444', 'dark grey': '#444444',
    navy: '#1a2744', blue: '#2a5caa', 'light blue': '#7ab3e0', 'sky blue': '#87ceeb',
    red: '#cc2222', burgundy: '#6e1520', wine: '#722f37', maroon: '#7b0020',
    green: '#2d6a2d', 'olive green': '#6b7c3b', olive: '#6b7c3b', khaki: '#c3b091',
    brown: '#6b3a2a', camel: '#c19a6b', tan: '#d2b48c', beige: '#f5f0e8',
    yellow: '#e8c832', gold: '#cfaa3c', orange: '#e07020', pink: '#e87090',
    purple: '#6a3090', lavender: '#b090d0', cream: '#fffdd0', ivory: '#fffff0',
    sand: '#c2b280', stone: '#928e85', ecru: '#c2b280', off_white: '#f5f0e8',
    'off white': '#f5f0e8', charcoal: '#3c3c3c', slate: '#708090',
    mint: '#98d8c8', teal: '#2a9090', cobalt: '#0047ab',
    'dark brown': '#3b1a0a', 'light brown': '#a0704a',
  };
  if (map[n]) return map[n];
  for (const key of Object.keys(map)) {
    if (n.includes(key) || key.includes(n)) return map[key];
  }
  return '#888888';
}

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const RECENTLY_VIEWED_KEY = 'rv_products';
const MAX_RECENTLY_VIEWED = 10;

type RecentProduct = Pick<RecommendedProduct, 'handle' | 'title' | 'imageUrl' | 'price' | 'currencyCode'>;

const getProductType = (p: RecommendedProduct): 'footwear' | 'top' | 'pants' | 'accessory' => {
  const title = p.title.toLowerCase();
  if (title.includes('shoe') || title.includes('sneaker') || title.includes('slide') || title.includes('boot') || title.includes('loafer')) {
    return 'footwear';
  }
  if (title.includes('short') || title.includes('pant') || title.includes('trouser') || title.includes('jeans') || title.includes('denim')) {
    return 'pants';
  }
  if (title.includes('sunglasses') || title.includes('eyewear') || title.includes('glasses') || title.includes('hat') || title.includes('cap') || title.includes('bag') || title.includes('wallet')) {
    return 'accessory';
  }
  return 'top';
};

const getProductColor = (p: RecommendedProduct): string => {
  const title = p.title.toLowerCase();
  const colors = [
    'white', 'black', 'grey', 'gray', 'navy', 'blue', 'beige', 'cream', 
    'brown', 'camel', 'olive', 'green', 'red', 'orange', 'yellow', 'pink', 
    'purple', 'blanco', 'negro', 'gris', 'azul', 'verde', 'rojo', 'rosa', 'amarillo'
  ];
  for (const color of colors) {
    if (title.includes(color)) {
      return color === 'gray' ? 'grey' : color;
    }
  }
  const hash = p.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallbackColors = ['black', 'white', 'grey', 'beige', 'navy'];
  return fallbackColors[hash % fallbackColors.length];
};

const arrangeRecommendations = (pool: RecommendedProduct[]): RecommendedProduct[] => {
  if (pool.length < 4) return pool;

  const annotated = pool.map(p => ({
    product: p,
    type: getProductType(p),
    color: getProductColor(p)
  }));

  const result: RecommendedProduct[] = [];

  // --- VIEWPORT 1 (Indices 0, 1, 2, 3) ---
  // Try to find a combination of 4 products with 4 different types and 4 different colors.
  let v1Combo: typeof annotated = [];
  
  for (let i = 0; i < annotated.length; i++) {
    for (let j = i + 1; j < annotated.length; j++) {
      for (let k = j + 1; k < annotated.length; k++) {
        for (let l = k + 1; l < annotated.length; l++) {
          const combo = [annotated[i], annotated[j], annotated[k], annotated[l]];
          const types = new Set(combo.map(c => c.type));
          const colors = new Set(combo.map(c => c.color));
          
          if (types.size === 4 && colors.size === 4) {
            v1Combo = combo;
            break;
          }
        }
        if (v1Combo.length > 0) break;
      }
      if (v1Combo.length > 0) break;
    }
    if (v1Combo.length > 0) break;
  }

  // Fallback 1: Try 4 unique types
  if (v1Combo.length === 0) {
    for (let i = 0; i < annotated.length; i++) {
      for (let j = i + 1; j < annotated.length; j++) {
        for (let k = j + 1; k < annotated.length; k++) {
          for (let l = k + 1; l < annotated.length; l++) {
            const combo = [annotated[i], annotated[j], annotated[k], annotated[l]];
            const types = new Set(combo.map(c => c.type));
            if (types.size === 4) {
              v1Combo = combo;
              break;
            }
          }
          if (v1Combo.length > 0) break;
        }
        if (v1Combo.length > 0) break;
      }
      if (v1Combo.length > 0) break;
    }
  }

  // Fallback 2: Take the first 4 products
  if (v1Combo.length === 0) {
    v1Combo = annotated.slice(0, 4);
  }

  // Add Viewport 1
  v1Combo.forEach(c => result.push(c.product));

  // Remaining pool for Viewport 2
  const v1Handles = new Set(v1Combo.map(c => c.product.handle));
  const remaining = annotated.filter(c => !v1Handles.has(c.product.handle));

  if (remaining.length < 4) {
    remaining.forEach(c => result.push(c.product));
    return result;
  }

  // --- VIEWPORT 2 (Indices 4, 5, 6, 7) ---
  // Try to find a combination of 4 products that has:
  // - 2 of one type and 2 of another type (e.g. 2 tops, 2 pants)
  // - AND 2 of one color and 2 of another color (e.g. 2 black, 2 white)
  let v2Combo: typeof annotated = [];

  for (let i = 0; i < remaining.length; i++) {
    for (let j = i + 1; j < remaining.length; j++) {
      for (let k = j + 1; k < remaining.length; k++) {
        for (let l = k + 1; l < remaining.length; l++) {
          const combo = [remaining[i], remaining[j], remaining[k], remaining[l]];
          
          const typeCounts: Record<string, number> = {};
          combo.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
          const typeVals = Object.values(typeCounts).sort();
          
          const colorCounts: Record<string, number> = {};
          combo.forEach(c => { colorCounts[c.color] = (colorCounts[c.color] || 0) + 1; });
          const colorVals = Object.values(colorCounts).sort();

          const matchesTypePattern = typeVals.length === 2 && typeVals[0] === 2 && typeVals[1] === 2;
          const matchesColorPattern = colorVals.length === 2 && colorVals[0] === 2 && colorVals[1] === 2;

          if (matchesTypePattern && matchesColorPattern) {
            v2Combo = combo;
            break;
          }
        }
        if (v2Combo.length > 0) break;
      }
      if (v2Combo.length > 0) break;
    }
    if (v2Combo.length > 0) break;
  }

  // Phase 2: Try 2/2 types OR 2/2 colors
  if (v2Combo.length === 0) {
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        for (let k = j + 1; k < remaining.length; k++) {
          for (let l = k + 1; l < remaining.length; l++) {
            const combo = [remaining[i], remaining[j], remaining[k], remaining[l]];
            
            const typeCounts: Record<string, number> = {};
            combo.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
            const typeVals = Object.values(typeCounts).sort();
            
            const colorCounts: Record<string, number> = {};
            combo.forEach(c => { colorCounts[c.color] = (colorCounts[c.color] || 0) + 1; });
            const colorVals = Object.values(colorCounts).sort();

            const matchesTypePattern = typeVals.length === 2 && typeVals[0] === 2 && typeVals[1] === 2;
            const matchesColorPattern = colorVals.length === 2 && colorVals[0] === 2 && colorVals[1] === 2;

            if (matchesTypePattern || matchesColorPattern) {
              v2Combo = combo;
              break;
            }
          }
          if (v2Combo.length > 0) break;
        }
        if (v2Combo.length > 0) break;
      }
      if (v2Combo.length > 0) break;
    }
  }

  // Fallback: Take the first 4 remaining items
  if (v2Combo.length === 0) {
    v2Combo = remaining.slice(0, 4);
  }

  // Add Viewport 2
  v2Combo.forEach(c => result.push(c.product));

  return result;
};

export default function ProductClient({ product, relatedProductsByTag }: Props) {
  const router = useRouter();
  const { language } = useLocale();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([]);
  const [completeOutfit, setCompleteOutfit] = useState<RecommendedProduct[]>([]);

  const arrangedRecommended = useMemo(() => {
    return arrangeRecommendations(recommended);
  }, [recommended]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 16)
        .then(setRecommended)
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getProducts }) => {
      getProducts()
        .then(allProds => {
          // Filter out the current product
          const filtered = allProds.filter(p => p.handle !== product.handle);
          if (filtered.length === 0) return;
          
          // First 5 (newest)
          const newest = filtered.slice(0, 5);
          
          // Last 1 (oldest)
          const oldest = filtered[filtered.length - 1];
          
          // Combine them
          const combined = [...newest];
          if (oldest && !newest.some(p => p.handle === oldest.handle)) {
            combined.push(oldest);
          } else if (filtered.length > 5) {
            combined.push(filtered[filtered.length - 1]);
          }

          // Map to RecommendedProduct structure
          const mapped = combined.map(p => ({
            handle: p.handle,
            title: p.title,
            imageUrl: p.imageUrl,
            price: p.price,
            currencyCode: p.currencyCode,
            collectionTitle: '',
            collectionHandle: '',
            siblings: []
          }));

          setCompleteOutfit(mapped);
        })
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
      const current: RecentProduct = {
        handle: product.handle,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        currencyCode: product.currencyCode,
      };
      const filtered = stored.filter(p => p.handle !== product.handle);
      const updated = [current, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      setRecentlyViewed(filtered.slice(0, 8));
    } catch {}
  }, [product.handle]);

  useEffect(() => {
    const el = ctlCarouselRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY,
          behavior: 'smooth'
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [completeOutfit]);

  useEffect(() => {
    const el = recCarouselRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY,
          behavior: 'smooth'
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [arrangedRecommended]);

  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants[0] ?? { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] }
  );

  const searchParams = useSearchParams();
  const initialColor = searchParams.get('color');

  useEffect(() => {
    if (initialColor) {
      const match = product.variants.find(v =>
        v.selectedOptions.some(opt =>
          (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') &&
          opt.value.toLowerCase() === initialColor.toLowerCase()
        )
      );
      if (match) {
        setSelectedVariant(match);
        // Also sync selectedColor and selectedOptionsState so images/UI reflect the URL color
        const colorOpt = match.selectedOptions.find(o => {
          const n = o.name.toLowerCase();
          return n === 'color' || n === 'colour';
        });
        if (colorOpt) {
          setSelectedColor(colorOpt.value);
        }
        setSelectedSize('');
        const opts: Record<string, string> = {};
        for (const o of match.selectedOptions) {
          opts[o.name] = o.value;
        }
        setSelectedOptionsState(opts);
      }
    }
  }, [initialColor, product.variants]);

  // images calculated below based on color index
  const [adding, setAdding] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [availModal, setAvailModal] = useState(false);
  const [availSizes, setAvailSizes] = useState<string[]>([]);
  const [availEmail, setAvailEmail] = useState('');
  const [availPhone, setAvailPhone] = useState('');
  const [availSubmitted, setAvailSubmitted] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [stickyDropdownOpen, setStickyDropdownOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const [stickySizesOpen, setStickySizesOpen] = useState(false);
  const mainButtonWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mainButtonWrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      const isAbove = entry.boundingClientRect.top < 0;
      setStickyBarVisible(!entry.isIntersecting && isAbove);
    }, {
      root: null,
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  const [ctlScrollProgress, setCtlScrollProgress] = useState(0);
  const ctlCarouselRef = useRef<HTMLDivElement>(null);

  const [outfitImgHeight, setOutfitImgHeight] = useState(0);
  const outfitImgRef = useRef<HTMLDivElement>(null);

  const [recImgHeight, setRecImgHeight] = useState(0);
  const recImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeights = () => {
      if (outfitImgRef.current) {
        setOutfitImgHeight(outfitImgRef.current.offsetHeight);
      }
      if (recImgRef.current) {
        setRecImgHeight(recImgRef.current.offsetHeight);
      }
    };

    updateHeights();
    window.addEventListener('resize', updateHeights);
    const timer1 = setTimeout(updateHeights, 200);
    const timer2 = setTimeout(updateHeights, 800);

    return () => {
      window.removeEventListener('resize', updateHeights);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [completeOutfit, arrangedRecommended]);

  const handleCtlScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setCtlScrollProgress(el.scrollLeft / maxScroll);
    }
  };

  const [recScrollProgress, setRecScrollProgress] = useState(0);
  const recCarouselRef = useRef<HTMLDivElement>(null);

  const handleRecScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setRecScrollProgress(el.scrollLeft / maxScroll);
    }
  };


  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      setCurrentSlide(Math.round(scrollLeft / width));
    }
  };

  const { t } = useTranslation();
  const { toggle, has, items } = useWishlist();
  const inWishlist = has(product.handle);

  const getHouseState = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (hash % 3 === 0) return 'HOUSE_01 — PERMANENCE';
    if (hash % 3 === 1) return 'HOUSE_02 — REPLICA';
    return 'HOUSE_03 — INHERITANCE';
  };

  const getArchiveRef = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const num = String((hash % 9000) + 1000).padStart(4, '0');
    return `ARC-26-${num}`;
  };

  const metadata = useMemo(() => parseMetadata(product.description), [product.description]);

  const detailsRows = useMemo(() => {
    const features = (metadata['Features'] || '').split(',').map(f => f.trim());
    const fitKeywords = ['loose', 'regular', 'oversized', 'slim', 'boxy', 'cropped', 'structured', 'relaxed', 'fit'];
    const foundFit = features
      .filter(f => fitKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const fitValue = foundFit.length > 0 ? foundFit.join(' / ') : 'Structured / relaxed';

    const finishKeywords = ['washed', 'ripped', 'pleated', 'drawstring', 'pocket', 'raw edge', 'hooded', 'button', 'zipper', 'embroidered'];
    const foundFinish = features
      .filter(f => finishKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const finishValue = foundFinish.length > 0 ? foundFinish.join(' / ') : 'Soft wash';

    const rawFabric = metadata['Fabric'] || '';
    const formattedFabric = rawFabric ? rawFabric.replace(/,\s*/g, ' / ') : '';

    return [
      { label: 'Fabric', value: formattedFabric },
      { label: 'Weight', value: metadata['Fabric Weight'] || '240 GSM' },
      { label: 'Fit', value: fitValue },
      { label: 'Finish', value: finishValue },
      { label: 'Production', value: 'Limited production' }
    ].filter(r => r.value);
  }, [metadata]);

  const wishlistItem = {
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    price: product.price,
    currencyCode: product.currencyCode,
    collectionTitle: '',
  };

  const [selectedColor, setSelectedColor] = useState<string>(
    () => product.variants[0]?.selectedOptions.find(o => {
      const n = o.name.toLowerCase(); return n === 'color' || n === 'colour';
    })?.value ?? ''
  );
  const [selectedSize, setSelectedSize] = useState<string>('');

  const [selectedOptionsState, setSelectedOptionsState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants[0]) {
      for (const o of product.variants[0].selectedOptions) {
        initial[o.name] = o.value;
      }
    }
    return initial;
  });

  const { openCart } = useUI();
  const { addToCart } = useCart();

  const colorOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n === 'color' || n === 'colour') return o.name;
      }
    return null;
  }, []);

  const sizeOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions)
        if (o.name.toLowerCase() === 'size') return o.name;
    // Fallback: match any variant option that is NOT 'color' or 'colour'
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n !== 'color' && n !== 'colour') return o.name;
      }
    if (product.handle === 'e-gift-card') {
      const first = product.variants[0]?.selectedOptions[0];
      return first?.name ?? null;
    }
    return null;
  }, []);

  const colorOptions = useMemo(() => {
    if (!colorOptionName) return [];
    const seen = new Set<string>();
    const result: { value: string; imageUrl: string }[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === colorOptionName);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        result.push({ value: opt.value, imageUrl: v.image?.url ?? '' });
      }
    }
    return result;
  }, [colorOptionName]);

  const sizeOptions = useMemo(() => {
    if (!sizeOptionName) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) { seen.add(opt.value); result.push(opt.value); }
    }
    return result;
  }, [sizeOptionName]);

  const allImages = product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean);

  const images = useMemo(() => {
    if (!selectedColor || !colorOptionName) {
      return allImages.slice(0, 2);
    }

    // Find all variants for the selected color
    const colorVariants = product.variants.filter(v =>
      v.selectedOptions.some(
        o => o.name === colorOptionName && o.value === selectedColor
      )
    );

    const variantImages = colorVariants
      .map(v => v.image?.url)
      .filter((url): url is string => !!url);
    const uniqueVariantImages = Array.from(new Set(variantImages));

    // Gather images of variants for other colors to prevent displaying them
    const otherColorsVariants = product.variants.filter(v =>
      v.selectedOptions.some(
        o => o.name === colorOptionName && o.value !== selectedColor
      )
    );
    const otherColorsImages = new Set(
      otherColorsVariants.map(v => v.image?.url).filter((url): url is string => !!url)
    );

    if (uniqueVariantImages.length > 0) {
      // Find the first index of our selected color's variant images in allImages
      const firstIndex = allImages.findIndex(img => uniqueVariantImages.includes(img));
      if (firstIndex !== -1) {
        // Collect all images starting from firstIndex until we hit an image of another color's variant
        const result: string[] = [];
        for (let i = firstIndex; i < allImages.length; i++) {
          const img = allImages[i];
          if (otherColorsImages.has(img)) {
            break;
          }
          result.push(img);
        }
        if (result.length > 0) return result;
      }
      return uniqueVariantImages;
    }

    // Fallback to activeIndex * 2 if no variant images are found
    const activeColorIndex = colorOptions.findIndex(c => c.value === selectedColor);
    const activeIndex = activeColorIndex >= 0 ? activeColorIndex : 0;
    const startIndex = activeIndex * 2;
    return allImages.length >= (startIndex + 2)
      ? allImages.slice(startIndex, startIndex + 2)
      : (allImages.length >= (startIndex + 1) ? allImages.slice(startIndex, startIndex + 1) : allImages.slice(0, 2));
  }, [allImages, selectedColor, colorOptionName, product.variants, colorOptions]);

  const priceNum = parseFloat(selectedVariant.price.amount);
  const currencyCode = selectedVariant.price.currencyCode || 'EUR';
  const currencySymbol = currencyCode === 'USD' ? '$' : '€';
  const priceFormatted = Number.isInteger(priceNum)
    ? `${currencySymbol} ${priceNum} ${currencyCode}`
    : `${currencySymbol} ${priceNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;

  const allSizes = sizeOptions;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  function findVariantByOptions(optionsMap: Record<string, string>): ShopifyVariant | undefined {
    return product.variants.find(v => 
      v.selectedOptions.every(o => {
        const val = optionsMap[o.name];
        return !val || val === o.value;
      })
    );
  }

  async function handleSizeSelectInDrawer(sizeValue: string) {
    setSelectedSize(sizeValue);
    let targetVariant = selectedVariant;
    if (sizeOptionName) {
      const updated = { ...selectedOptionsState, [sizeOptionName]: sizeValue };
      setSelectedOptionsState(updated);
      const next = findVariantByOptions(updated);
      if (next) {
        setSelectedVariant(next);
        targetVariant = next;
      }
    }

    setSizeDropdownOpen(false);
    setStickyDropdownOpen(false);

    if (targetVariant?.id && !adding) {
      setAdding(true);
      try {
        await addToCart(targetVariant.id, 1);
        openCart();
      } catch (err) {
        console.error("Error adding to cart:", err);
      } finally {
        setAdding(false);
      }
    }
  }

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) {
      setSizeDropdownOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  function findVariant(color: string, size: string): ShopifyVariant | undefined {
    const opts: Record<string, string> = {};
    if (colorOptionName) opts[colorOptionName] = color;
    if (sizeOptionName) opts[sizeOptionName] = size;
    return findVariantByOptions(opts);
  }

  function isSizeAvailable(size: string): boolean {
    if (!sizeOptionName) return false;
    const targetOptions = { ...selectedOptionsState, [sizeOptionName]: size };
    const v = findVariantByOptions(targetOptions);
    return v?.availableForSale ?? false;
  }

  function openAvailModal(preSize?: string) {
    const soldOut = allSizes.filter(s => !isSizeAvailable(s));
    setAvailSizes(preSize ? [preSize] : soldOut.length === 1 ? soldOut : []);
    setAvailEmail('');
    setAvailPhone('');
    setAvailSubmitted(false);
    setAvailSubmitting(false);
    setAvailModal(true);
  }

  function toggleAvailSize(size: string) {
    setAvailSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }

  async function handleAvailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!availEmail || availSizes.length === 0) return;
    setAvailSubmitting(true);
    try {
      const stored = JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]');
      stored.push({
        id: `${product.handle}-${Date.now()}`,
        product: product.handle,
        title: product.title,
        sizes: availSizes,
        email: availEmail,
        submittedAt: Date.now(),
      });
      localStorage.setItem('tonet-avail-requests', JSON.stringify(stored));
    } finally {
      setAvailSubmitted(true);
      setAvailSubmitting(false);
    }
  }

  function handleColorChange(colorValue: string) {
    setSelectedColor(colorValue);
    if (colorOptionName) {
      const updated = { ...selectedOptionsState, [colorOptionName]: colorValue };
      setSelectedOptionsState(updated);
      
      // Try to find a variant with the new color and the current size
      let next = findVariantByOptions(updated);
      
      if (!next) {
        // If not found, reset the size selection and find the first variant of this color
        setSelectedSize('');
        const updatedNoSize = { ...updated };
        if (sizeOptionName) {
          delete updatedNoSize[sizeOptionName];
        }
        setSelectedOptionsState(updatedNoSize);
        next = findVariantByOptions(updatedNoSize);
      }
      
      if (next) {
        setSelectedVariant(next);
      }
      
      // Update URL query parameter
      const params = new URLSearchParams(window.location.search);
      params.set('color', colorValue);
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }
  }

  function toggleAccordion(key: string) {
    setExpandedAccordion(prev => prev === key ? null : key);
  }

  return (
    <>
      <div className="tonet-pdp-page">


        <div className="tonet-pdp-layout">
          
          {/* GALLERY COLUMN (Left side ~65% on desktop) */}
          <div className="tonet-gallery-column">
            {/* Mobile Carousel (horizontal scroll snapping) */}
            <div className="tonet-mobile-gallery">
              <div className="tonet-mobile-carousel" ref={mobileCarouselRef} onScroll={handleMobileScroll}>
                {images.map((img, i) => (
                  <div key={i} className="tonet-mobile-slide">
                    <img 
                      src={getOptimizedImageUrl(img, 1000)} 
                      alt={`${product.title} - ${i}`} 
                      className="tonet-pdp-img amiri-fade-in" 
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(e) => e.currentTarget.classList.add('loaded')}
                      ref={(el) => {
                        if (el && el.complete) el.classList.add('loaded');
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Carousel Dots */}
              {images.length > 1 && (
                <div className="tonet-mobile-dots">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`tonet-mobile-dot ${currentSlide === i ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Gallery (Minimal vertical stack of images, no controls/arrows/sliders) */}
            <div className="tonet-desktop-gallery">
              {images.map((img, i) => (
                <div key={i} className="tonet-desktop-img-wrapper">
                  <img 
                    src={getOptimizedImageUrl(img, 1600)} 
                    alt={`${product.title} - ${i}`} 
                    className="tonet-pdp-img amiri-fade-in" 
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={(e) => e.currentTarget.classList.add('loaded')}
                    ref={(el) => {
                      if (el && el.complete) el.classList.add('loaded');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* INFO COLUMN (Right side buy box ~25% on desktop, sticky) */}
          <div className="tonet-info-column">
            <div className="tonet-info-sticky">
              
              {/* Product Title (uppercase, clean sans-serif) */}
              <h1 className="tonet-product-title">{toTitleCase(product.title)}</h1>
              
              {/* Price and Color Swatch row */}
              <div className="tonet-product-meta-row">
                <span className="tonet-product-price">{priceFormatted}</span>
                
                {/* Color swatch indicator and name */}
                <div className="tonet-color-selector">
                  <span className="tonet-color-swatch" style={{ background: colorNameToCSS(selectedColor) }} />
                  <span className="tonet-color-name">{selectedColor.toUpperCase()}</span>
                  
                  {colorOptions.length > 1 && (
                    <div className="tonet-color-options-inline">
                      {colorOptions.map((co) => {
                        const isSelected = selectedColor === co.value;
                        return (
                          <button
                            key={co.value}
                            type="button"
                            className={`tonet-color-dot-opt ${isSelected ? 'active' : ''}`}
                            onClick={() => handleColorChange(co.value)}
                            aria-label={`Select color ${co.value}`}
                            style={{ background: colorNameToCSS(co.value) }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SELECT SIZE / ADD TO BAG Button */}
              <div className="tonet-size-selector-wrap" ref={mainButtonWrapRef}>
                {hasSizes ? (
                  <button 
                    type="button"
                    className="tonet-select-size-btn"
                    onClick={() => setSizeDropdownOpen(true)}
                  >
                    <span>{selectedSize ? `SIZE: ${selectedSize.toUpperCase()}` : 'SELECT SIZE'} ▾</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="tonet-select-size-btn"
                    onClick={handleAddToBag}
                    disabled={adding}
                  >
                    <span>{adding ? 'ADDING...' : 'ADD TO BAG'}</span>
                  </button>
                )}
              </div>

              {/* Short Description (uppercase, compact) */}
              <div className="tonet-product-description">
                <p>{(product.description || "").split('Item Number:')[0]?.trim().toUpperCase()}</p>
              </div>

              {/* Accordions */}
              <div className="tonet-accordions">
                
                {/* DESCRIPTION */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('desc')}>
                    <span>DESCRIPTION</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'desc' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'desc' && (
                    <div className="tonet-accordion-content">
                      <p>{product.description?.split('Item Number:')[0]?.trim().toUpperCase()}</p>
                      <ul className="tonet-specs-list">
                        {detailsRows.map((row, i) => (
                          <li key={i}>— {row.label.toUpperCase()}: {row.value.toUpperCase()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* SIZE AND FIT */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('fit')}>
                    <span>SIZE & FIT</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'fit' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'fit' && (
                    <div className="tonet-accordion-content">
                      <p>FITS TRUE TO SIZE. WE RECOMMEND TAKING YOUR NORMAL SIZE. FITS VARY DEPENDING ON CONSTRUCTION AND MATERIAL.</p>
                      <button type="button" className="tonet-size-guide-link" onClick={() => setSizeGuideOpen(true)}>
                        VIEW SIZE GUIDE
                      </button>
                    </div>
                  )}
                </div>

                {/* CARE AND MAINTENANCE */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('care')}>
                    <span>CARE & MAINTENANCE</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'care' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'care' && (
                    <div className="tonet-accordion-content">
                      <p>{metadata['Care Instructions'] ? metadata['Care Instructions'].toUpperCase() : 'DRY CLEAN ONLY. HANDLE WITH CARE.'}</p>
                    </div>
                  )}
                </div>

                {/* SHIPPING / RETURNS */}
                <div className="tonet-accordion-item">
                  <button className="tonet-accordion-header" onClick={() => toggleAccordion('shipping')}>
                    <span>SHIPPING / RETURNS</span>
                    <span className="tonet-accordion-icon">{expandedAccordion === 'shipping' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'shipping' && (
                    <div className="tonet-accordion-content">
                      <p>COMPLIMENTARY STANDARD SHIPPING ON ALL ORDERS. DELIVERY TIME TAKES BETWEEN 2 TO 4 BUSINESS DAYS. EASY RETURN WITHIN 14 DAYS FROM RECEIPT OF SHIPMENT.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Mobile-only grid below accordions */}
              <div className="tonet-mobile-extra-grid">
                <div className={images.length === 1 ? "tonet-mobile-single" : "tonet-mobile-grid"}>
                  {images.map((img, i) => (
                    <div key={i} className="tonet-mobile-grid-item">
                      <img 
                        src={img} 
                        alt={`${product.title} - ${i}`} 
                        className="tonet-pdp-img amiri-fade-in" 
                        onLoad={(e) => e.currentTarget.classList.add('loaded')}
                        ref={(el) => {
                          if (el && el.complete) el.classList.add('loaded');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* COMPLETE THE LOOK SECTION */}
        {completeOutfit.length > 0 && (
          <section className="amiri-ctl-section">
            <div className="amiri-ctl-header">
              <span className="amiri-ctl-logo">TONET</span>
              <h2 className="amiri-ctl-title">COMPLETE THE LOOK</h2>
            </div>
            
            <div className="amiri-ctl-carousel-wrapper">
              <div 
                className="amiri-ctl-carousel" 
                ref={ctlCarouselRef}
                onScroll={handleCtlScroll}
              >
                {completeOutfit.map((p, idx) => {
                  const pType = getProductType(p);
                  const symbol = p.currencyCode === 'USD' ? '$' : '€';
                  const formattedPrice = Number.isInteger(p.price)
                    ? `${symbol} ${p.price} ${p.currencyCode}`
                    : `${symbol} ${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${p.currencyCode}`;
                  
                  return (
                    <div className="amiri-ctl-item" key={p.handle}>
                      <Link href={`/product/${p.handle}`} className="amiri-ctl-card">
                        <div 
                          className="amiri-ctl-image-panel"
                          ref={idx === 0 ? outfitImgRef : null}
                        >
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className={`amiri-ctl-image amiri-ctl-image--${pType} amiri-fade-in`}
                              loading="lazy"
                              decoding="async"
                              onLoad={(e) => e.currentTarget.classList.add('loaded')}
                              ref={(el) => {
                                if (el && el.complete) el.classList.add('loaded');
                              }}
                            />
                          )}
                        </div>
                        <div className="amiri-ctl-meta">
                          <span className="amiri-ctl-name">{toTitleCase(p.title)}</span>
                          <span className="amiri-ctl-price">{formattedPrice}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Discreet pill indicator */}
              {completeOutfit.length > 1 && (
                <div className="amiri-ctl-indicator-track">
                  <div 
                    className="amiri-ctl-indicator-pill" 
                    style={{
                      width: `${100 / completeOutfit.length}%`,
                      transform: `translateX(${ctlScrollProgress * (completeOutfit.length - 1) * 100}%)`
                    }}
                  />
                </div>
              )}


            </div>
          </section>
        )}

        {/* RELATED CAROUSEL (YOU MIGHT ALSO LIKE) */}
        {arrangedRecommended.length > 0 && (
          <section className="amiri-ctl-section">
            <div className="amiri-ctl-header">
              <span className="amiri-ctl-logo">TONET</span>
              <h2 className="amiri-ctl-title">THIS WILL FIT PERFECT WITH YOU</h2>
            </div>
            
            <div className="amiri-ctl-carousel-wrapper">
              <div 
                className="amiri-ctl-carousel"
                ref={recCarouselRef}
                onScroll={handleRecScroll}
              >
                {arrangedRecommended.map((p, idx) => {
                  const pType = getProductType(p);
                  const symbol = p.currencyCode === 'USD' ? '$' : '€';
                  const formattedPrice = Number.isInteger(p.price)
                    ? `${symbol} ${p.price} ${p.currencyCode}`
                    : `${symbol} ${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${p.currencyCode}`;
                  
                  return (
                    <div className="amiri-ctl-item" key={p.handle}>
                      <Link href={`/product/${p.handle}`} className="amiri-ctl-card">
                        <div 
                          className="amiri-ctl-image-panel"
                          ref={idx === 0 ? recImgRef : null}
                        >
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className={`amiri-ctl-image amiri-ctl-image--${pType} amiri-fade-in`}
                              loading="lazy"
                              decoding="async"
                              onLoad={(e) => e.currentTarget.classList.add('loaded')}
                              ref={(el) => {
                                if (el && el.complete) el.classList.add('loaded');
                              }}
                            />
                          )}
                        </div>
                        <div className="amiri-ctl-meta">
                          <span className="amiri-ctl-name">{toTitleCase(p.title)}</span>
                          <span className="amiri-ctl-price">{formattedPrice}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Discreet pill indicator */}
              {arrangedRecommended.length > 1 && (
                <div className="amiri-ctl-indicator-track">
                  <div 
                    className="amiri-ctl-indicator-pill" 
                    style={{
                      width: `${100 / arrangedRecommended.length}%`,
                      transform: `translateX(${recScrollProgress * (arrangedRecommended.length - 1) * 100}%)`
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </div>



      {/* ══ SIZE SELECTOR OVERLAY MODAL ══ */}
      {sizeDropdownOpen && (
        <div className="tonet-size-selector-overlay" onClick={() => setSizeDropdownOpen(false)}>
          <div className="tonet-size-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-size-modal-header">
              <div className="tonet-size-header-left">
                <button type="button" className="tonet-size-close-btn" onClick={() => setSizeDropdownOpen(false)}>✕</button>
                <button type="button" className="tonet-size-guide-btn" onClick={() => { setSizeDropdownOpen(false); setSizeGuideOpen(true); }}>SIZE GUIDE</button>
              </div>
            </div>
            
            <div className="tonet-size-modal-body">
              <span className="tonet-size-modal-title">SELECT SIZE</span>
              
              <div className="tonet-size-modal-grid">
                {sizeOptions.map(size => {
                  const isAvailable = isSizeAvailable(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`tonet-size-box-btn ${!isAvailable ? 'sold-out' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isAvailable) {
                          handleSizeSelectInDrawer(size);
                        } else {
                          openAvailModal(size);
                        }
                      }}
                    >
                      {size.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              
              {selectedSize && isSizeAvailable(selectedSize) && (
                <div className="tonet-stock-warning">LOW STOCK</div>
              )}
            </div>

            <button 
              type="button"
              className="tonet-size-modal-cta"
              onClick={() => {
                if (selectedSize) {
                  handleAddToBag();
                  setSizeDropdownOpen(false);
                }
              }}
              disabled={adding || !selectedSize}
            >
              {adding ? 'ADDING...' : 'ADD TO BAG'}
            </button>
          </div>
        </div>
      )}

      {/* ══ AVAILABILITY REQUEST MODAL ══ */}
      {availModal && (
        <div className="tonet-modal-overlay" onClick={() => setAvailModal(false)}>
          <div className="tonet-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-modal-header">
              <span className="tonet-modal-title">NOTIFY AVAILABILITY</span>
              <button className="tonet-modal-close" onClick={() => setAvailModal(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {availSubmitted ? (
              <div className="tonet-modal-success">
                <span className="tonet-modal-success-title">REQUEST REGISTERED.</span>
                <p className="tonet-modal-success-sub">WE WILL NOTIFY YOU IF STOCK BECOMES AVAILABLE.</p>
              </div>
            ) : (
              <form className="tonet-modal-body" onSubmit={handleAvailSubmit}>
                <p className="tonet-modal-desc">
                  LEAVE YOUR EMAIL ADDRESS TO RECEIVE AN ALERT AS SOON AS THIS SIZE BECOMES AVAILABLE.
                </p>

                <div className="tonet-modal-field">
                  <label className="tonet-modal-field-label">SELECTED SIZE</label>
                  <div className="tonet-modal-sizes-list">
                    {availSizes.map(s => <span key={s} className="tonet-modal-size-tag">{s.toUpperCase()}</span>)}
                  </div>
                </div>

                <div className="tonet-modal-field">
                  <label className="tonet-modal-field-label" htmlFor="tonet-email">EMAIL ADDRESS</label>
                  <input
                    id="tonet-email"
                    className="tonet-modal-input"
                    type="email"
                    required
                    placeholder="EMAIL@DOMAIN.COM"
                    value={availEmail}
                    onChange={e => setAvailEmail(e.target.value)}
                  />
                </div>

                <button
                  className="tonet-modal-cta"
                  type="submit"
                  disabled={availSubmitting || !availEmail}
                >
                  {availSubmitting ? 'SENDING…' : 'NOTIFY ME'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ SIZE GUIDE MODAL ══ */}
      {sizeGuideOpen && (
        <div className="tonet-modal-overlay" onClick={() => setSizeGuideOpen(false)}>
          <div className="tonet-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-modal-header">
              <span className="tonet-modal-title">SIZE GUIDE</span>
              <button className="tonet-modal-close" onClick={() => setSizeGuideOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="tonet-modal-body">
              <p className="tonet-modal-desc" style={{ marginBottom: '16px' }}>
                MEASUREMENTS ARE APPROXIMATE AND TAKEN FLAT.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', letterSpacing: '0.05em' }}>
                {([
                  { size: 'XS', chest: '54 CM', length: '66 CM' },
                  { size: 'S',  chest: '56 CM', length: '68 CM' },
                  { size: 'M',  chest: '58 CM', length: '70 CM' },
                  { size: 'L',  chest: '60 CM', length: '72 CM' },
                  { size: 'XL', chest: '62 CM', length: '74 CM' },
                ] as const).map((row) => (
                  <div key={row.size} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f2f2f2', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 400 }}>{row.size}</span>
                    <span>CHEST {row.chest}</span>
                    <span>LENGTH {row.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CINEMATIC ARCHIVAL CEREMONY MODAL ══ */}
      {ceremonyOpen && (
        <div className="tonet-ceremony-overlay" onClick={() => setCeremonyOpen(false)}>
          <div className="tonet-ceremony-modal" onClick={e => e.stopPropagation()}>
            <button className="tonet-ceremony-close" onClick={() => setCeremonyOpen(false)} aria-label="Close">
              ✕
            </button>

            <div className="tonet-ceremony-header">
              <span className="tonet-ceremony-supra">ARCHIVE REGISTRY</span>
              <h2 className="tonet-ceremony-title">GARMENT ARCHIVED</h2>
              <p className="tonet-ceremony-desc">
                THIS PIECE HAS BEEN TEMPORARILY RECORDED IN YOUR DIGITAL ARCHIVE.
              </p>
            </div>

            <div className="tonet-ceremony-split">
              <div className="tonet-ceremony-image">
                {product.imageUrl && (
                  <img src={getOptimizedImageUrl(product.imageUrl, 800)} alt={product.title} className="ac-tonet-img" />
                )}
              </div>

              <div className="tonet-ceremony-details">
                <div className="tonet-ceremony-grid">
                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">NAME</span>
                    <span className="tonet-ceremony-value">{product.title.toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">COLLECTION</span>
                    <span className="tonet-ceremony-value">{getHouseState(product.handle).toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">REF</span>
                    <span className="tonet-ceremony-value">{getArchiveRef(product.handle).toUpperCase()}</span>
                  </div>

                  <div className="tonet-ceremony-item">
                    <span className="tonet-ceremony-label">STATUS</span>
                    <span className="tonet-ceremony-value">
                      {selectedVariant.availableForSale ? 'AVAILABLE' : 'TEMPORARILY ARCHIVED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tonet-ceremony-actions">
              <Link href="/archive" className="tonet-ceremony-btn-primary">
                VIEW ARCHIVE
              </Link>
              <button className="tonet-ceremony-btn-secondary" onClick={() => setCeremonyOpen(false)}>
                RETURN TO STORE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Buy Bar */}
      <div className={`tonet-sticky-buy-bar ${stickyBarVisible ? 'visible' : ''} ${stickySizesOpen ? 'sizes-open' : ''}`}>
        <div className="tonet-sticky-buy-card">
          <div className="tonet-sticky-buy-info">
            <h3 className="tonet-sticky-buy-title">{toTitleCase(product.title)}</h3>
            <div className="tonet-sticky-buy-price-row">
              <span className="tonet-sticky-buy-price">{priceFormatted}</span>
            </div>
          </div>
          
          {/* SIZES PANEL */}
          {hasSizes && (
            <div className={`tonet-sticky-sizes-wrapper ${stickySizesOpen ? 'open' : ''}`}>
              <div className="tonet-sticky-sizes-panel">
                <div className="tonet-sticky-separator" />
                <div className="tonet-sticky-sizes-grid">
                  {sizeOptions.map(size => {
                    const isAvailable = isSizeAvailable(size);
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        className={`tonet-sticky-size-box ${!isAvailable ? 'sold-out' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (isAvailable) {
                            handleSizeSelectInDrawer(size);
                            setStickySizesOpen(false);
                          } else {
                            openAvailModal(size);
                          }
                        }}
                      >
                        {size.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <button 
            type="button" 
            className="tonet-sticky-buy-btn"
            onClick={needsSizeSelection ? () => setStickySizesOpen(prev => !prev) : handleAddToBag}
            disabled={adding}
          >
            <span>
              {needsSizeSelection 
                ? (language === 'es' ? 'Confirme un talle' : 'Confirm size') 
                : (adding 
                    ? (language === 'es' ? 'Añadiendo...' : 'Adding...') 
                    : (language === 'es' ? 'Añadir a la bolsa' : 'Add to bag')
                  )
              }
            </span>
          </button>
        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           TONET PDP HIGH-FIDELITY STYLES
        ══════════════════════════════════════ */

        .tonet-pdp-page {
          background-color: #ffffff;
          color: #000000;
          min-height: 100vh;
          font-family: var(--font-primary), sans-serif;
          font-variant-numeric: lining-nums tabular-nums;
          padding-top: 0px;
          position: relative;
        }

        @media (min-width: 1024px) {
          .tonet-pdp-page {
            padding-top: 0;
          }
        }

        /* Small collection label top-left */
        .tonet-pdp-season {
          position: absolute;
          top: 72px;
          left: 40px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          z-index: 10;
        }
        @media (min-width: 1024px) {
          .tonet-pdp-season {
            left: 64px;
          }
        }

        .tonet-pdp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .tonet-pdp-layout {
            grid-template-columns: 50% 50%;
            column-gap: 0;
            padding: 0;
            max-width: none;
            margin: 0;
            box-sizing: border-box;
          }
        }

        /* ── GALLERY COLUMN (Left side ~50% width) ── */
        .tonet-gallery-column {
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-gallery-column {
            background-color: #f4f3f1;
            padding-top: 100px;
          }
        }

        /* Mobile Swipe Gallery */
        .tonet-mobile-gallery {
          display: block;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .tonet-mobile-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tonet-mobile-carousel::-webkit-scrollbar {
          display: none;
        }
        .tonet-mobile-slide {
          flex: 0 0 100%;
          width: 100%;
          scroll-snap-align: start;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f4f3f1;
          padding: 2px;
          box-sizing: border-box;
          aspect-ratio: 3 / 4;
        }
        .tonet-mobile-slide img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .tonet-mobile-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          margin: 0;
        }
        .tonet-mobile-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #e0e0e0;
          transition: background-color 0.3s;
        }
        .tonet-mobile-dot.active {
          background-color: #000000;
        }

        /* Mobile Extra Grid (below accordions) */
        .tonet-mobile-extra-grid {
          display: block;
          width: 100%;
          margin-top: 32px;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .tonet-mobile-extra-grid {
            display: none !important;
          }
        }
        .tonet-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          background-color: #ffffff;
        }
        .tonet-mobile-single {
          display: block;
          width: 100%;
        }
        .tonet-mobile-grid-item {
          aspect-ratio: 3 / 4;
          background-color: #f4f3f1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 8px;
          box-sizing: border-box;
        }
        .tonet-mobile-grid-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .tonet-mobile-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 2px;
        }
        .tonet-mobile-stack-item {
          aspect-ratio: 3 / 4;
          background-color: #f4f3f1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 16px;
          box-sizing: border-box;
        }
        .tonet-mobile-stack-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* Desktop Stacked Gallery (with extreme whitespace, no controls) */
        .tonet-desktop-gallery {
          display: none;
          flex-direction: column;
          gap: 40px;
          padding-bottom: 120px;
        }
        @media (min-width: 1024px) {
          .tonet-mobile-gallery { display: none; }
          .tonet-desktop-gallery { display: flex; }
        }
        .tonet-desktop-img-wrapper {
          width: 100%;
          background: #f4f3f1;
          display: flex;
          justify-content: center;
          align-items: center;
          aspect-ratio: 3 / 4;
        }
        .tonet-desktop-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* ── INFO COLUMN (Right side buy box ~27%) ── */
        .tonet-info-column {
          display: block;
          padding: 12px 20px 80px;
          box-sizing: border-box;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-info-column {
            padding: 100px 64px 120px 64px;
          }
        }
        .tonet-info-sticky {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-info-sticky {
            position: sticky;
            top: 50vh;
            transform: translateY(-50%);
            align-items: center;
            text-align: center;
            max-width: 460px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* Title */
        .tonet-product-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.1em;
          line-height: 1.4;
          margin: 0 0 12px;
          text-transform: none;
          color: #000000;
          text-align: center;
        }
        @media (min-width: 1024px) {
          .tonet-product-title {
            font-size: 22px;
            margin-bottom: 16px;
            text-align: center;
          }
        }

        /* Meta Row (price + color inline) */
        .tonet-product-meta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #000000;
        }
        @media (min-width: 1024px) {
          .tonet-product-meta-row {
            justify-content: center;
            margin-bottom: 32px;
          }
        }
        .tonet-product-price {
          font-weight: 300;
          text-transform: uppercase;
        }
        
        .tonet-color-selector {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tonet-color-swatch {
          width: 8px;
          height: 8px;
          display: block;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }
        .tonet-color-name {
          font-weight: 400;
        }
        .tonet-color-options-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 8px;
        }
        .tonet-color-dot-opt {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid transparent;
          cursor: pointer;
          padding: 0;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .tonet-color-dot-opt.active {
          border-color: #000000;
        }

        /* SELECT SIZE CTA Button */
        .tonet-size-selector-wrap {
          margin-bottom: 32px;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .tonet-size-selector-wrap {
            margin-bottom: 40px;
            justify-content: center;
          }
        }
        .tonet-select-size-btn {
          background-color: #555555;
          color: #ffffff;
          border: none;
          padding: 14px 24px;
          font-size: 11px;
          font-family: var(--font-primary), sans-serif;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80%;
          min-width: 240px;
          border-radius: 0;
          transition: opacity 0.3s;
        }
        @media (min-width: 1024px) {
          .tonet-select-size-btn {
            width: 100%;
            max-width: 100%;
            min-width: auto;
          }
        }
        .tonet-select-size-btn:hover {
          opacity: 0.85;
        }

        /* Description block */
        .tonet-product-description {
          font-size: 10px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.08em;
          color: #000000;
          margin-bottom: 32px;
          text-transform: uppercase;
          text-align: center;
          width: 80%;
        }
        @media (min-width: 1024px) {
          .tonet-product-description {
            font-size: 10.5px;
            margin-bottom: 40px;
            text-align: center;
            width: 100%;
          }
        }
        .tonet-product-description p {
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Minimal Accordions */
        .tonet-accordions {
          width: 100%;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        .tonet-accordion-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          width: 100%;
        }
        .tonet-accordion-header {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          font-size: 11px;
          font-family: var(--font-primary), sans-serif;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #000000;
          text-transform: uppercase;
          cursor: pointer;
        }
        .tonet-accordion-icon {
          font-size: 11px;
          font-weight: 300;
          color: #888888;
        }
        .tonet-accordion-content {
          padding: 0 0 20px;
          text-align: left;
          font-size: 10.5px;
          line-height: 1.6;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #555555;
          text-transform: uppercase;
        }
        .tonet-accordion-content p {
          margin: 0 0 10px;
        }
        .tonet-specs-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tonet-size-guide-link {
          background: none;
          border: none;
          padding: 0;
          margin-top: 8px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          display: block;
        }

        /* ── RELATED CAROUSEL ── */
        .tonet-related-carousel {
          padding: 60px 20px;
          background-color: #ffffff;
          text-align: center;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 1024px) {
          .tonet-related-carousel {
            padding: 100px 64px;
          }
        }
        .tonet-carousel-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0 auto 32px;
          text-transform: uppercase;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .tonet-carousel-title {
            font-size: 11px;
          }
        }
        .tonet-carousel-wrap {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tonet-carousel-wrap::-webkit-scrollbar {
          display: none;
        }
        .tonet-carousel-track {
          display: flex;
          gap: 20px;
          width: max-content;
          margin: 0 auto;
        }
        .tonet-carousel-item {
          width: 220px;
        }

        /* ── FLOATING CONCIERGE CHAT BADGE ── */
        .tonet-concierge-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          z-index: 999;
          transition: transform 0.2s ease;
        }
        .tonet-concierge-badge:hover {
          transform: scale(1.05);
        }
        .tonet-concierge-badge:active {
          transform: scale(0.95);
        }

        /* ── SIZE SELECTOR OVERLAY MODAL ── */
        .tonet-size-selector-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tonet-size-selector-modal {
          background: #ffffff;
          border: none;
          width: 90%;
          max-width: 360px;
          padding: 32px;
          box-shadow: 0 20px 45px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          position: relative;
        }
        .tonet-size-modal-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }
        .tonet-size-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tonet-size-close-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          cursor: pointer;
          color: #000000;
          padding: 0;
        }
        .tonet-size-guide-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #888888;
          cursor: pointer;
          text-transform: uppercase;
          padding: 0;
        }
        .tonet-size-guide-btn:hover {
          color: #000000;
        }
        .tonet-size-modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .tonet-size-modal-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
        }
        .tonet-size-modal-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 8px 0;
          width: 100%;
        }
        .tonet-size-box-btn {
          border: none;
          background: transparent;
          color: #000000;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
          box-sizing: border-box;
        }
        .tonet-size-box-btn:hover {
          color: #888888;
        }
        .tonet-size-box-btn.selected {
          border: none;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 700;
        }
        .tonet-size-box-btn.sold-out {
          color: #cccccc;
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .tonet-stock-warning {
          color: #ff0000;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tonet-size-modal-cta {
          width: 100%;
          background: #555555;
          color: #ffffff;
          border: none;
          padding: 14px 0;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: opacity 0.3s;
          text-align: center;
          text-transform: uppercase;
        }
        .tonet-size-modal-cta:hover {
          opacity: 0.85;
        }
        .tonet-size-modal-cta:disabled {
          background-color: #cccccc;
          color: #ffffff;
          cursor: not-allowed;
        }

        /* ── MODALS ── */
        .tonet-modal-overlay, .tonet-ceremony-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .tonet-modal, .tonet-ceremony-modal {
          background: #ffffff;
          border: 1px solid #000000;
          width: 90%;
          max-width: 440px;
          padding: 32px;
          position: relative;
          color: #000000;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tonet-modal-close, .tonet-ceremony-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #000000;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }
        .tonet-modal-title, .tonet-ceremony-title {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .tonet-modal-desc, .tonet-ceremony-desc {
          font-size: 11px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.05em;
          color: #666666;
          margin: 0;
          text-transform: uppercase;
        }
        .tonet-modal-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tonet-modal-field-label, .tonet-ceremony-label {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #999999;
          text-transform: uppercase;
        }
        .tonet-modal-input {
          border: none;
          border-bottom: 1px solid #000000;
          padding: 8px 0;
          font-size: 12px;
          outline: none;
          background: transparent;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tonet-modal-cta, .tonet-ceremony-btn-primary {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 14px 0;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-align: center;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.3s;
          display: block;
          width: 100%;
        }
        .tonet-modal-cta:hover, .tonet-ceremony-btn-primary:hover {
          opacity: 0.85;
        }

        .tonet-ceremony-split {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 20px;
          align-items: center;
        }
        .tonet-ceremony-image {
          aspect-ratio: 3/4;
          background: #ffffff;
          overflow: hidden;
        }
        .tonet-ceremony-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tonet-ceremony-item {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .tonet-ceremony-value {
          font-weight: 400;
          color: #000000;
        }
        .tonet-ceremony-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tonet-ceremony-btn-secondary {
          background: transparent;
          border: 1px solid #eaeaea;
          color: #666666;
          padding: 14px 0;
          font-size: 11px;
          cursor: pointer;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 0.1em;
          transition: color 0.2s, border-color 0.2s;
        }
        .tonet-ceremony-btn-secondary:hover {
          border-color: #000000;
          color: #000000;
        }

        /* ── COMPLETE THE LOOK SECTION ── */
        .amiri-ctl-section {
          background-color: #ffffff;
          padding: 80px 0;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 1024px) {
          .amiri-ctl-section {
            padding: 120px 0;
          }
        }

        .amiri-ctl-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-header {
            margin-bottom: 48px;
          }
        }

        .amiri-ctl-logo {
          font-family: var(--font-brand), 'Saint Carell', sans-serif;
          font-size: 18px;
          font-weight: normal;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 8px;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-logo {
            font-size: 22px;
            margin-bottom: 12px;
          }
        }

        .amiri-ctl-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          margin: 0;
          line-height: 1;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-title {
            font-size: 11px;
          }
        }

        .amiri-ctl-carousel-wrapper {
          position: relative;
          width: 100%;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-carousel-wrapper {
            padding: 0;
          }
        }

        .amiri-ctl-carousel {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          gap: 0;
          width: 100%;
          padding-left: 40px;
          padding-right: 40px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-carousel {
            padding-left: 64px;
            padding-right: 64px;
          }
        }
        .amiri-ctl-carousel::-webkit-scrollbar {
          display: none;
        }

        .amiri-ctl-item {
          flex: 0 0 86%;
          width: 86%;
          scroll-snap-align: center;
          box-sizing: border-box;
        }
        .amiri-ctl-item:not(:last-child) {
          border-right: 2px solid #ffffff;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-item {
            flex: 0 0 25%;
            width: 25%;
            min-width: 322px;
            max-width: 380px;
            scroll-snap-align: start;
          }
        }

        .amiri-ctl-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-decoration: none;
          color: inherit;
        }

        .amiri-ctl-image-panel {
          width: 100%;
          aspect-ratio: 3 / 4;
          background-color: #f4f3f1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-image-panel {
            padding: 4px;
          }
        }

        .amiri-ctl-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .amiri-ctl-card:hover .amiri-ctl-image {
          transform: scale(1.04);
        }

        /* ── Optical image scaling classes ── */
        .amiri-ctl-image--top {
          max-width: 95%;
          max-height: 87%;
        }
        .amiri-ctl-image--pants {
          max-width: 92%;
          max-height: 85%;
        }
        .amiri-ctl-image--footwear {
          max-width: 96%;
          max-height: 82%;
        }
        .amiri-ctl-image--accessory {
          max-width: 88%;
          max-height: 78%;
        }

        .amiri-ctl-meta {
          padding-top: 16px;
          padding-bottom: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-meta {
            padding-top: 16px;
          }
        }

        .amiri-ctl-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #000000;
          text-transform: none;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-name {
            font-size: 10.5px;
          }
        }

        .amiri-ctl-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #555555;
          text-transform: uppercase;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-price {
            font-size: 10px;
          }
        }

        /* ── Discreet scroll pill indicator ── */
        .amiri-ctl-indicator-track {
          width: 80px;
          height: 1.5px;
          background-color: rgba(0, 0, 0, 0.06);
          margin: 32px auto 0;
          position: relative;
          border-radius: 1px;
          overflow: hidden;
        }
        .amiri-ctl-indicator-pill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          background-color: #000000;
          border-radius: 1px;
          transition: transform 0.1s ease-out;
        }

        /* ── Floating Circular Monogram Badge ── */
        .amiri-ctl-monogram-badge {
          position: absolute;
          bottom: 48px;
          right: 28px;
          width: 44px;
          height: 44px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s ease;
        }
        @media (min-width: 1024px) {
          .amiri-ctl-monogram-badge {
            right: 52px;
            bottom: 60px;
          }
        }
        .amiri-ctl-monogram-badge:hover {
          transform: scale(1.05);
        }
        .amiri-ctl-monogram-badge:active {
          transform: scale(0.95);
        }

        /* ── STICKY BUY BAR (VALENTINO STYLE) ── */
        .tonet-sticky-buy-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #000000;
          z-index: 990;
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, background-color 0.3s ease, padding 0.3s ease;
          pointer-events: none;
        }
        .tonet-sticky-buy-bar.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Mobile: sizes open state */
        .tonet-sticky-buy-bar.sizes-open {
          background: #ffffff;
          border-top: 1px solid #e5e5e5;
          padding: 24px 20px;
          height: auto;
        }

        .tonet-sticky-buy-card {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-card {
          flex-direction: column;
          gap: 0;
          height: auto;
        }

        .tonet-sticky-buy-info {
          display: none; /* Hidden on mobile by default */
        }
        
        /* Show info on mobile when sizes open */
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          text-align: left;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.08em;
          margin: 0;
          line-height: 1.4;
          text-transform: none;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-price-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #000000;
        }

        .tonet-sticky-buy-btn {
          width: 100%;
          height: 48px;
          background: #000000;
          color: #ffffff;
          border: none;
          border-radius: 0 !important;
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, height 0.3s ease;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-btn {
          height: 40px;
          margin-top: 16px;
          border-radius: 0 !important;
        }
        .tonet-sticky-buy-btn:hover {
          background-color: #1a1a1a;
        }

        /* Sizes Panel Height and Slide-up Transition (Slower, directional, no flicker) */
        .tonet-sticky-sizes-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          overflow: hidden;
          width: 100%;
          transition: grid-template-rows 0.9s cubic-bezier(0.85, 0, 0.15, 1), opacity 0.7s ease;
        }
        .tonet-sticky-sizes-wrapper.open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        
        .tonet-sticky-sizes-panel {
          min-height: 0;
          transform: translateY(25px);
          transition: transform 0.9s cubic-bezier(0.85, 0, 0.15, 1);
        }
        .tonet-sticky-sizes-wrapper.open .tonet-sticky-sizes-panel {
          transform: translateY(0);
        }

        .tonet-sticky-separator {
          height: 1px;
          background-color: #000000;
          width: 100%;
          margin: 16px 0 16px 0;
        }
        .tonet-sticky-sizes-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          width: 100%;
        }
        .tonet-sticky-size-box {
          height: 32px;
          background: transparent;
          border: none;
          color: #777777;
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 0;
        }
        .tonet-sticky-size-box:hover {
          color: #000000;
        }
        .tonet-sticky-size-box.selected {
          font-weight: 700;
          color: #000000;
        }
        .tonet-sticky-size-box.sold-out {
          color: #cccccc;
          text-decoration: line-through;
        }

        @media (min-width: 1024px) {
          .tonet-sticky-buy-bar {
            bottom: 24px;
            right: 24px;
            left: auto;
            top: auto;
            width: 420px;
            height: auto;
            background: transparent;
            transform: translateY(40px);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          }
          .tonet-sticky-buy-bar.sizes-open {
            background: transparent;
            padding: 0;
            border-top: none;
          }
          .tonet-sticky-buy-bar.visible {
            transform: translateY(0);
            opacity: 1;
          }
          .tonet-sticky-buy-card {
            background: #ffffff;
            border: 1px solid #e5e5e5;
            padding: 24px;
            box-shadow: 0 10px 45px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            gap: 0;
            box-sizing: border-box;
            height: auto;
            border-radius: 0 !important;
          }
          .tonet-sticky-buy-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            text-align: left;
          }
          .tonet-sticky-buy-title {
            font-family: var(--font-primary), sans-serif;
            font-size: 15px;
            font-weight: 400;
            color: #000000;
            letter-spacing: 0.08em;
            margin: 0;
            line-height: 1.4;
            text-transform: none;
          }
          .tonet-sticky-buy-price-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .tonet-sticky-buy-price {
            font-family: var(--font-primary), sans-serif;
            font-size: 13px;
            font-weight: 600;
            color: #000000;
          }
          .tonet-sticky-sizes-grid {
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
            margin-bottom: 0;
          }
          .tonet-sticky-size-box {
            height: 32px;
            font-size: 12px;
          }
          .tonet-sticky-buy-btn {
            width: 100%;
            height: 32px;
            background: #000000;
            color: #ffffff;
            border: none;
            border-radius: 0 !important;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: none;
            cursor: pointer;
            transition: background-color 0.2s ease;
            margin-top: 16px;
          }
          .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-btn {
            height: 32px;
            margin-top: 16px;
            border-radius: 0 !important;
          }
          .tonet-sticky-buy-btn:hover {
            background-color: #333333;
          }
        }
      `}</style>
    </>
  );
}
