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
  const [expressLoading, setExpressLoading] = useState(false);
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
  const [activeDesktopIdx, setActiveDesktopIdx] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const [stickySizesOpen, setStickySizesOpen] = useState(false);
  const mainButtonWrapRef = useRef<HTMLButtonElement>(null);

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
  const [channelModalOpen, setChannelModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (product.variants.length === 1 && !selectedSize) {
      const opt = product.variants[0].selectedOptions.find(o => o.name.toLowerCase() === 'size');
      if (opt?.value) {
        setSelectedSize(opt.value);
      } else if (product.variants[0].title && product.variants[0].title !== 'Default Title') {
        setSelectedSize(product.variants[0].title);
      }
    }
  }, [product, selectedSize]);

  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [wishlistToastVisible, setWishlistToastVisible] = useState<boolean>(false);

  useEffect(() => {
    if (wishlistToastVisible) {
      const timer = setTimeout(() => {
        setWishlistToastVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [wishlistToastVisible]);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({
    salutation: 'Sr.',
    firstName: '',
    lastName: '',
    email: '',
    country: 'Spain',
    phonePrefix: '+34',
    phone: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    topic: '',
    message: '',
    marketingConsent1: false,
    marketingConsent2: false
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === 'es' ? 'Mensaje enviado correctamente. Nos pondremos en contacto con usted lo antes posible.' : 'Message sent successfully. We will get back to you as soon as possible.');
    setContactModalOpen(false);
    setContactForm({
      salutation: 'Sr.',
      firstName: '',
      lastName: '',
      email: '',
      country: 'Spain',
      phonePrefix: '+34',
      phone: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      topic: '',
      message: '',
      marketingConsent1: false,
      marketingConsent2: false
    });
  };

  const handleWishlistToggle = () => {
    const wasInWishlist = inWishlist;
    toggle(wishlistItem);
    if (!wasInWishlist) {
      setWishlistToastVisible(true);
    }
  };

  function openPreview(index: number) {
    setPreviewImageIndex(index);
    setZoomLevel(1);
    setPreviewModalOpen(true);
  }

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
  const { cart, addToCart } = useCart();

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
    const seen = new Set<string>();
    const result: { value: string; imageUrl: string; handle?: string }[] = [];
    if (colorOptionName) {
      for (const v of product.variants) {
        const opt = v.selectedOptions.find(o => o.name === colorOptionName);
        if (opt && !seen.has(opt.value)) {
          seen.add(opt.value);
          result.push({ value: opt.value, imageUrl: v.image?.url ?? '' });
        }
      }
    }
    if (relatedProductsByTag) {
      for (const sib of relatedProductsByTag) {
        if (sib.title.trim().toLowerCase() === product.title.trim().toLowerCase()) {
          for (const sv of sib.variants) {
            const sOpt = sv.selectedOptions.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
            if (sOpt && !seen.has(sOpt.value)) {
              seen.add(sOpt.value);
              result.push({ value: sOpt.value, imageUrl: sib.imageUrl, handle: sib.handle });
            }
          }
        }
      }
    }
    return result;
  }, [colorOptionName, product.variants, product.title, relatedProductsByTag]);

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
    if (product.isManual) {
      return allImages;
    }

    if (!selectedColor || !colorOptionName) {
      return allImages;
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

  function handleSizeSelect(sizeValue: string) {
    setSelectedSize(sizeValue);
    if (sizeOptionName) {
      const updated = { ...selectedOptionsState, [sizeOptionName]: sizeValue };
      setSelectedOptionsState(updated);
      const next = findVariantByOptions(updated);
      if (next) {
        setSelectedVariant(next);
      }
    }
  }

  async function handleExpressCheckout() {
    if (!selectedVariant.id || expressLoading) return;
    if (needsSizeSelection) {
      return;
    }
    setExpressLoading(true);
    try {
      await addToCart(selectedVariant.id, 1);
      setTimeout(() => {
        if (cart.checkoutUrl) {
          window.location.href = cart.checkoutUrl;
        } else {
          openCart();
        }
      }, 500);
    } catch (e) {
      console.error("Express checkout error:", e);
      openCart();
    } finally {
      setExpressLoading(false);
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
    const targetOption = colorOptions.find(c => c.value === colorValue);
    if (targetOption?.handle) {
      router.push(`/product/${targetOption.handle}`);
      return;
    }
    setSelectedColor(colorValue);
    setCurrentSlide(0);
    setActiveDesktopIdx(0);
    setPreviewImageIndex(0);
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
                  <div key={i} className={`tonet-mobile-slide ${product.isManual ? 'tonet-mobile-slide--custom tonet-custom-slide-fill' : ''}`}>
                    <img 
                      src={getOptimizedImageUrl(img, 1000)} 
                      alt={`${product.title} - ${i}`} 
                      className={`tonet-pdp-img amiri-fade-in ${product.isManual ? 'tonet-pdp-img--custom-fill tonet-custom-img-fill' : ''}`} 
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
              
              {/* Progress Indicator Bar */}
              {images.length > 1 && (
                <div className="tonet-mobile-carousel-indicator-bar">
                  <div 
                    className="tonet-mobile-carousel-indicator-progress"
                    style={{
                      width: `${100 / images.length}%`,
                      transform: `translateX(${currentSlide * 100}%)`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Desktop Gallery (Main image fixed on left, secondary scrollable thumbnails on right) */}
            <div className="tonet-desktop-gallery">
              <div 
                className={`tonet-desktop-main-wrapper ${product.isManual ? 'tonet-desktop-main-wrapper--custom tonet-custom-slide-fill' : ''}`}
                onClick={() => openPreview(activeDesktopIdx)}
                style={{ cursor: 'pointer' }}
                title="Click para ampliar"
              >
                <img 
                  src={getOptimizedImageUrl(images[activeDesktopIdx] || images[0], 1600)} 
                  alt={`${product.title} - Main`} 
                  className={`tonet-pdp-img amiri-fade-in ${product.isManual ? 'tonet-pdp-img--custom-fill tonet-custom-img-fill' : ''}`} 
                  loading="eager"
                  decoding="async"
                  onLoad={(e) => e.currentTarget.classList.add('loaded')}
                  ref={(el) => {
                    if (el && el.complete) el.classList.add('loaded');
                  }}
                />
              </div>

              {images.length > 1 && (
                <div className="tonet-desktop-secondary-container">
                  <div className="tonet-desktop-secondary-scroll">
                    {images.map((img, i) => (
                      <div 
                        key={i} 
                        className={`tonet-desktop-secondary-wrapper ${product.isManual ? 'tonet-desktop-secondary-wrapper--custom tonet-custom-slide-fill' : ''} ${i === activeDesktopIdx ? 'tonet-desktop-secondary-active' : ''}`}
                        onClick={() => setActiveDesktopIdx(i)}
                        onDoubleClick={() => openPreview(i)}
                        title="Click para seleccionar o ampliar"
                      >
                        <img 
                          src={getOptimizedImageUrl(img, 800)} 
                          alt={`${product.title} - ${i + 1}`} 
                          className={`tonet-pdp-img amiri-fade-in ${product.isManual ? 'tonet-pdp-img--custom-fill tonet-custom-img-fill' : ''}`} 
                          loading="lazy"
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
              )}
            </div>
          </div>

          {/* INFO COLUMN (Right side buy box ~50% on desktop, sticky) */}
          <div className="tonet-info-column">
            <div className="tonet-info-sticky">
              
              {/* Title */}
              <h1 className="tonet-product-title">{toTitleCase(product.title)}</h1>

              {/* Wishlist Button - Centered directly below title */}
              <button 
                type="button" 
                className="tonet-pdp-wishlist-btn"
                onClick={handleWishlistToggle}
                title={inWishlist 
                  ? (language === 'es' ? 'Eliminar de la Wishlist' : 'Remove from Wishlist') 
                  : (language === 'es' ? 'Añadir a la Wishlist' : 'Add to Wishlist')
                }
                aria-label={inWishlist 
                  ? (language === 'es' ? 'Eliminar de la Wishlist' : 'Remove from Wishlist') 
                  : (language === 'es' ? 'Añadir a la Wishlist' : 'Add to Wishlist')
                }
              >
                <span className="tonet-wishlist-icon">{inWishlist ? '★' : '☆'}</span>
                <span className="tonet-wishlist-text">
                  {inWishlist 
                    ? (language === 'es' ? 'Eliminar de la Wishlist' : 'Remove from Wishlist') 
                    : (language === 'es' ? 'Añadir a la Wishlist' : 'Add to Wishlist')
                  }
                </span>
              </button>
              
              {/* Price */}
              <div className="tonet-pdp-price-row">
                <span className="tonet-product-price">{priceFormatted}</span>
              </div>

              {/* Stock / Units Counter Badge */}
              {product.stock !== undefined && (
                <div className="tonet-pdp-stock-badge">
                  <span className="tonet-stock-dot" />
                  <span className="tonet-stock-label">
                    {language === 'es'
                      ? `${product.stock} ${product.stock === 1 ? 'UNIDAD DISPONIBLE' : 'UNIDADES DISPONIBLES'}`
                      : `${product.stock} ${product.stock === 1 ? 'PIECE IN STOCK' : 'PIECES IN STOCK'}`}
                  </span>
                </div>
              )}

              {/* Color Row */}
              <div className="tonet-pdp-color-row">
                <span className="tonet-pdp-color-label">{toTitleCase(selectedColor)}</span>
                <div className="tonet-pdp-color-swatches">
                  {colorOptions.map((co) => {
                    const isSelected = selectedColor === co.value;
                    return (
                      <button
                        key={co.value}
                        type="button"
                        className={`tonet-pdp-color-dot ${isSelected ? 'active' : ''}`}
                        onClick={() => handleColorChange(co.value)}
                        style={{ background: colorNameToCSS(co.value) }}
                        aria-label={`Select color ${co.value}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Sizes Row */}
              {hasSizes && (
                <div className="tonet-pdp-sizes-container">
                  <div className="tonet-pdp-sizes-row">
                    <span className="tonet-pdp-sizes-label">Talle:</span>
                    <div className="tonet-pdp-sizes-list">
                      {sizeOptions.map((size) => {
                        const isAvailable = isSizeAvailable(size);
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            className={`tonet-pdp-size-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'sold-out' : ''}`}
                            onClick={() => {
                              if (isAvailable) {
                                handleSizeSelect(size);
                              } else {
                                openAvailModal(size);
                              }
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="button" className="tonet-pdp-size-guide-btn" onClick={() => setSizeGuideOpen(true)}>
                    Guía de talles
                  </button>
                </div>
              )}

              {/* Main Action Button */}
              {product.contactForAvailability ? (
                <button 
                  type="button" 
                  ref={mainButtonWrapRef}
                  className="tonet-pdp-main-btn tonet-pdp-contact-btn"
                  onClick={() => setChannelModalOpen(true)}
                >
                  <span>
                    {language === 'es' ? 'Contactar para disponibilidad' : 'Contact for availability'}
                  </span>
                </button>
              ) : (
                <button 
                  type="button" 
                  ref={mainButtonWrapRef}
                  className="tonet-pdp-main-btn"
                  onClick={selectedSize ? handleAddToBag : () => alert(language === 'es' ? 'Por favor, seleccione un talle.' : 'Please select a size.')}
                  disabled={adding && selectedSize !== null}
                >
                  <span>
                    {selectedSize 
                      ? (adding ? 'Añadiendo...' : 'Comprar') 
                      : 'Confirme un talle'
                    }
                  </span>
                </button>
              )}

              {/* Express Checkout (only for standard products) */}
              {!product.contactForAvailability && (
                <div className="tonet-pdp-express-box">
                  <span className="tonet-pdp-express-label">Pago exprés</span>
                  <button 
                    type="button" 
                    className="tonet-pdp-express-btn" 
                    onClick={selectedSize ? handleExpressCheckout : () => alert(language === 'es' ? 'Por favor, seleccione un talle.' : 'Please select a size.')}
                    disabled={expressLoading}
                  >
                    <span>{expressLoading ? 'Cargando PayPal...' : 'Pagar con PayPal'}</span>
                  </button>
                </div>
              )}

              {/* Klarna Info Text (only for standard products) */}
              {!product.contactForAvailability && (
                <p className="tonet-pdp-klarna-text">
                  Compra ahora, paga después con Klarna. <span className="underline cursor-pointer" onClick={() => alert('Klarna estará disponible en la pasarela de pago.')}>Más información</span>
                </p>
              )}

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
              </div>

              {/* Help & Boutique Availability Actions */}
              <div className="tonet-pdp-actions-section">
                <div className="tonet-pdp-actions-divider" />
                <div className="tonet-pdp-actions-grid">
                  
                  {/* Need Help? Button */}
                  <button 
                    type="button" 
                    className="tonet-pdp-action-btn"
                    onClick={() => setContactModalOpen(true)}
                  >
                    <svg className="tonet-action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>{language === 'es' ? '¿Necesita ayuda?' : 'Need help?'}</span>
                  </button>

                  {/* Boutique Availability Button */}
                  <Link 
                    href="/stores"
                    className="tonet-pdp-action-btn"
                  >
                    <svg className="tonet-action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span>{language === 'es' ? 'Comprobar la disponibilidad en la boutique' : 'Check boutique availability'}</span>
                  </Link>

                </div>
              </div>

              {/* Additional Mobile-only grid below accordions */}
              <div className="tonet-mobile-extra-grid">
                <div className={images.length === 1 ? "tonet-mobile-single" : "tonet-mobile-grid"}>
                  {images.map((img, i) => (
                    <div key={i} className={`tonet-mobile-grid-item ${product.isManual ? 'tonet-mobile-grid-item--custom tonet-custom-slide-fill' : ''}`}>
                      <img 
                        src={img} 
                        alt={`${product.title} - ${i}`} 
                        className={`tonet-pdp-img amiri-fade-in ${product.isManual ? 'tonet-pdp-img--custom-fill tonet-custom-img-fill' : ''}`} 
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
                          className={`amiri-ctl-image-panel ${p.isManual || (p.imageUrl && p.imageUrl.startsWith('/products/')) ? 'tonet-custom-slide-fill' : ''}`}
                          ref={idx === 0 ? outfitImgRef : null}
                        >
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className={`amiri-ctl-image amiri-ctl-image--${pType} amiri-fade-in ${p.isManual || (p.imageUrl && p.imageUrl.startsWith('/products/')) ? 'tonet-custom-img-fill' : ''}`}
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
                          <span className="amiri-ctl-name">{p.title}</span>
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
                          className={`amiri-ctl-image-panel ${p.isManual || (p.imageUrl && p.imageUrl.startsWith('/products/')) ? 'tonet-custom-slide-fill' : ''}`}
                          ref={idx === 0 ? recImgRef : null}
                        >
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className={`amiri-ctl-image amiri-ctl-image--${pType} amiri-fade-in ${p.isManual || (p.imageUrl && p.imageUrl.startsWith('/products/')) ? 'tonet-custom-img-fill' : ''}`}
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
                          <span className="amiri-ctl-name">{p.title}</span>
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

      {/* ══ CONTACT MODAL (CONTÁCTENOS) ══ */}
      {contactModalOpen && (
        <div className="tonet-contact-overlay" onClick={() => setContactModalOpen(false)}>
          <div className="tonet-contact-modal" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="tonet-contact-header">
              <h2 className="tonet-contact-title">CONTÁCTENOS</h2>
              <button 
                type="button" 
                className="tonet-contact-close-btn" 
                onClick={() => setContactModalOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="tonet-contact-content">
              <form onSubmit={handleContactSubmit}>
                
                {/* Salutation / Título */}
                <div className="tonet-contact-field tonet-salutation-field">
                  <span className="tonet-field-label">Título</span>
                  <div className="tonet-radio-group">
                    <label className="tonet-radio-label">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="Sr." 
                        checked={contactForm.salutation === 'Sr.'}
                        onChange={e => setContactForm(prev => ({ ...prev, salutation: e.target.value }))}
                      />
                      <span>Sr.</span>
                    </label>
                    <label className="tonet-radio-label">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="Señorita"
                        checked={contactForm.salutation === 'Señorita'}
                        onChange={e => setContactForm(prev => ({ ...prev, salutation: e.target.value }))}
                      />
                      <span>Señorita</span>
                    </label>
                    <label className="tonet-radio-label">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="Sra."
                        checked={contactForm.salutation === 'Sra.'}
                        onChange={e => setContactForm(prev => ({ ...prev, salutation: e.target.value }))}
                      />
                      <span>Sra.</span>
                    </label>
                  </div>
                </div>

                {/* Name Row */}
                <div className="tonet-form-row">
                  <div className="tonet-contact-field">
                    <label className="tonet-input-label">Nombre *</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.firstName}
                      onChange={e => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="tonet-contact-input"
                    />
                  </div>
                  <div className="tonet-form-row-space" style={{ width: '20px' }} />
                  <div className="tonet-contact-field">
                    <label className="tonet-input-label">Apellido *</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.lastName}
                      onChange={e => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="tonet-contact-input"
                    />
                  </div>
                </div>

                {/* Email and Country Row */}
                <div className="tonet-form-row">
                  <div className="tonet-contact-field">
                    <label className="tonet-input-label">Dirección De Correo Electrónico *</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="tonet-contact-input"
                    />
                  </div>
                  <div className="tonet-form-row-space" style={{ width: '20px' }} />
                  <div className="tonet-contact-field">
                    <label className="tonet-input-label">País *</label>
                    <select 
                      value={contactForm.country}
                      onChange={e => setContactForm(prev => ({ ...prev, country: e.target.value }))}
                      className="tonet-contact-select"
                    >
                      <option value="Spain">Spain</option>
                      <option value="United States">United States</option>
                      <option value="France">France</option>
                      <option value="Italy">Italy</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>
                </div>

                {/* Phone prefix & Number */}
                <div className="tonet-form-row">
                  <div className="tonet-contact-field" style={{ flex: '0 0 100px' }}>
                    <label className="tonet-input-label">Prefijo</label>
                    <input 
                      type="text" 
                      value={contactForm.phonePrefix}
                      onChange={e => setContactForm(prev => ({ ...prev, phonePrefix: e.target.value }))}
                      className="tonet-contact-input"
                    />
                  </div>
                  <div className="tonet-form-row-space" style={{ width: '20px' }} />
                  <div className="tonet-contact-field" style={{ flex: '1' }}>
                    <label className="tonet-input-label">Teléfono *</label>
                    <input 
                      type="tel" 
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="tonet-contact-input"
                    />
                  </div>
                </div>

                {/* Birthday Row */}
                <div className="tonet-contact-field">
                  <span className="tonet-field-label">Cumpleaños</span>
                  <div className="tonet-birthday-row">
                    <select 
                      value={contactForm.birthDay}
                      onChange={e => setContactForm(prev => ({ ...prev, birthDay: e.target.value }))}
                      className="tonet-contact-select"
                    >
                      <option value="">Día</option>
                      {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div style={{ width: '16px' }} />
                    <select 
                      value={contactForm.birthMonth}
                      onChange={e => setContactForm(prev => ({ ...prev, birthMonth: e.target.value }))}
                      className="tonet-contact-select"
                    >
                      <option value="">Mes</option>
                      {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, idx) => (
                        <option key={m} value={String(idx + 1)}>{m}</option>
                      ))}
                    </select>
                    <div style={{ width: '16px' }} />
                    <select 
                      value={contactForm.birthYear}
                      onChange={e => setContactForm(prev => ({ ...prev, birthYear: e.target.value }))}
                      className="tonet-contact-select"
                    >
                      <option value="">Año</option>
                      {Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i)).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Topic / ¿En qué podemos asistirle? */}
                <div className="tonet-contact-field">
                  <label className="tonet-input-label">¿En qué podemos asistirle? *</label>
                  <select 
                    required
                    value={contactForm.topic}
                    onChange={e => setContactForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="tonet-contact-select"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Consulta sobre producto">Consulta sobre producto</option>
                    <option value="Información sobre envíos">Información sobre envíos</option>
                    <option value="Devoluciones y reembolsos">Devoluciones y reembolsos</option>
                    <option value="Opciones de personalización">Opciones de personalización</option>
                    <option value="Otros temas">Otros temas</option>
                  </select>
                </div>

                {/* Message */}
                <div className="tonet-contact-field">
                  <label className="tonet-input-label">Cualquier información adicional *</label>
                  <textarea 
                    required
                    placeholder="Mensaje"
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="tonet-contact-textarea"
                  />
                </div>

                {/* Upload Product Photo */}
                <div className="tonet-contact-field tonet-upload-field">
                  <label className="tonet-upload-btn">
                    <input type="file" style={{ display: 'none' }} />
                    <span>+ Subir foto del producto</span>
                  </label>
                </div>

                {/* Disclaimer */}
                <p className="tonet-contact-disclaimer">
                  Si necesita ayuda o tiene alguna pregunta relacionada con nuestras colecciones, servicios o tienda en línea, no dude en contactarnos por e-mail o chat.<br/>
                  También puede ver respuestas a nuestras preguntas más frecuentes en las secciones de <span className="underline cursor-pointer">Atención al cliente</span>.<br/><br/>
                  Este sitio está protegido por reCAPTCHA, y se aplican la <span className="underline cursor-pointer">Política de privacidad</span> y los <span className="underline cursor-pointer">Términos de servicio de Google</span>.<br/>
                  Valentino usará sus datos personales para fines relacionados con el servicio o contacto solicitado. Consulte nuestra <span className="underline cursor-pointer">Política de privacidad</span> para obtener más información y para comunicarse con Valentino en caso de tener inquietudes y solicitudes relacionadas con la privacidad.<br/><br/>
                  Además, si también desea seguir en contacto con Valentino y recibir comunicaciones comerciales personalizadas, autorícenos a:
                </p>

                {/* Marketing Checkboxes */}
                <div className="tonet-consent-checkboxes">
                  <label className="tonet-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={contactForm.marketingConsent1}
                      onChange={e => setContactForm(prev => ({ ...prev, marketingConsent1: e.target.checked }))}
                    />
                    <span>Doy mi consentimiento para que Valentino procese mis datos personales con fines de marketing (boletines informativos, comunicaciones por teléfono, SMS y mensajes inteligentes).</span>
                  </label>
                  <label className="tonet-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={contactForm.marketingConsent2}
                      onChange={e => setContactForm(prev => ({ ...prev, marketingConsent2: e.target.checked }))}
                    />
                    <span>Doy mi consentimiento para que Valentino procese mis datos con el fin de analizar mis preferencias, hábitos y preferencias de compra.</span>
                  </label>
                </div>

                {/* Send Button */}
                <div className="tonet-contact-actions">
                  <button type="submit" className="tonet-contact-submit-btn">
                    ENVIAR
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* ══ CHANNEL MODAL (CONTACTAR PARA DISPONIBILIDAD: WHATSAPP / INSTAGRAM) ══ */}
      {channelModalOpen && (
        <div className="tonet-contact-overlay" onClick={() => setChannelModalOpen(false)}>
          <div className="tonet-channel-modal" onClick={e => e.stopPropagation()}>
            <div className="tonet-channel-header">
              <span className="tonet-channel-tag">ATELIER ASSISTANCE</span>
              <button 
                type="button" 
                className="tonet-contact-close-btn" 
                onClick={() => setChannelModalOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="tonet-channel-body">
              <h3 className="tonet-channel-title">
                {language === 'es' ? 'Consultar Disponibilidad' : 'Inquire Availability'}
              </h3>
              <p className="tonet-channel-desc">
                {language === 'es'
                  ? 'Esta pieza cuenta con unidades exclusivas de archivo. Elige cómo prefieres contactar directamente con nuestro atelier para gestionar su disponibilidad y entrega:'
                  : 'This garment has exclusive archive inventory. Select your preferred channel to directly consult with our atelier regarding availability and acquisition:'}
              </p>

              <div className="tonet-channel-product-summary">
                <div className={`tonet-channel-thumb ${product.isManual ? 'tonet-custom-slide-fill' : ''}`}>
                  <img src={product.imageUrl} alt={product.title} className={product.isManual ? 'tonet-custom-img-fill' : ''} />
                </div>
                <div className="tonet-channel-summary-info">
                  <h4 className="tonet-channel-prod-title">{product.title}</h4>
                  <div className="tonet-channel-meta-row">
                    <span className="tonet-channel-spec">TALLE: {selectedSize || 'M'}</span>
                    {product.stock !== undefined && (
                      <span className="tonet-channel-stock">● {product.stock} {product.stock === 1 ? 'UNIDAD DISPONIBLE' : 'UNIDADES DISPONIBLES'}</span>
                    )}
                  </div>
                  <span className="tonet-channel-price">{priceFormatted}</span>
                </div>
              </div>

              <div className="tonet-channel-actions">
                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${(product.contactOptions?.whatsapp || '+34600000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    language === 'es'
                      ? `Hola, me interesa consultar la disponibilidad de: ${product.title} (Talla: ${selectedSize || 'M'}, Ref: ${product.handle}).`
                      : `Hello, I would like to inquire about availability for: ${product.title} (Size: ${selectedSize || 'M'}, Ref: ${product.handle}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tonet-channel-btn tonet-channel-whatsapp"
                  onClick={() => setChannelModalOpen(false)}
                >
                  <div className="tonet-channel-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="tonet-channel-btn-text">
                    <span className="tonet-channel-btn-title">WhatsApp</span>
                    <span className="tonet-channel-btn-sub">
                      {language === 'es' ? 'Chat directo con atelier' : 'Direct atelier chat'}
                    </span>
                  </div>
                  <span className="tonet-channel-btn-arrow">→</span>
                </a>

                {/* Instagram Button */}
                <a
                  href={`https://ig.me/m/${product.contactOptions?.instagram || 'tonetparis'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tonet-channel-btn tonet-channel-instagram"
                  onClick={() => setChannelModalOpen(false)}
                >
                  <div className="tonet-channel-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="0" ry="0"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </div>
                  <div className="tonet-channel-btn-text">
                    <span className="tonet-channel-btn-title">Instagram Direct</span>
                    <span className="tonet-channel-btn-sub">@{product.contactOptions?.instagram || 'tonetparis'}</span>
                  </div>
                  <span className="tonet-channel-btn-arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ WISHLIST TOAST NOTIFICATION ══ */}
      {wishlistToastVisible && (
        <div className="tonet-wishlist-toast">
          <div className="tonet-wishlist-toast-header">
            <span className="tonet-wishlist-toast-title">Wishlist ({items.length})</span>
            <div className="tonet-wishlist-toast-thumb">
              <img src={product.imageUrl} alt={product.title} />
            </div>
          </div>
          <div className="tonet-wishlist-toast-footer">
            <Link href="/archive?tab=personal" className="tonet-wishlist-toast-link">
              ★ Ver lista
            </Link>
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
              <div className={`tonet-ceremony-image ${product.isManual || (product.imageUrl && product.imageUrl.startsWith('/products/')) ? 'tonet-custom-slide-fill' : ''}`}>
                {product.imageUrl && (
                  <img 
                    src={getOptimizedImageUrl(product.imageUrl, 800)} 
                    alt={product.title} 
                    className={`ac-tonet-img ${product.isManual || (product.imageUrl && product.imageUrl.startsWith('/products/')) ? 'tonet-custom-img-fill' : ''}`} 
                  />
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
          
          {product.contactForAvailability ? (
            <button 
              type="button" 
              className="tonet-sticky-buy-btn tonet-sticky-contact-btn"
              onClick={() => setChannelModalOpen(true)}
            >
              <span>
                {language === 'es' ? 'Contactar para disponibilidad' : 'Contact for availability'}
              </span>
            </button>
          ) : (
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
          )}
        </div>
      </div>

      {/* ── PREVISUALIZADOR MODAL (LIGHTBOX ZOOM) ── */}
      {previewModalOpen && (
        <div 
          className="tonet-preview-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewModalOpen(false);
          }}
        >
          <div className="tonet-preview-stage">
            <div 
              className="tonet-preview-img-wrapper"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img 
                src={getOptimizedImageUrl(images[previewImageIndex] || images[0], 2400)} 
                alt={`${product.title} - Preview`} 
                className={`tonet-preview-img ${product.isManual || ((images[previewImageIndex] || images[0]) && (images[previewImageIndex] || images[0]).startsWith('/products/')) ? 'tonet-custom-img-fill' : ''}`}
              />
            </div>

            {/* Bottom Bar: Zoom controls + Title tag */}
            <div className="tonet-preview-bottom-bar">
              <div className="tonet-preview-zoom-control">
                <button 
                  type="button" 
                  className="tonet-preview-zoom-btn"
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                  title="Disminuir zoom"
                >
                  −
                </button>
                <input 
                  type="range" 
                  min="1" 
                  max="2.5" 
                  step="0.05" 
                  value={zoomLevel} 
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="tonet-preview-zoom-slider"
                />
                <button 
                  type="button" 
                  className="tonet-preview-zoom-btn"
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                  title="Aumentar zoom"
                >
                  +
                </button>
              </div>
              <div className="tonet-preview-product-tag">
                {toTitleCase(product.title)}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Close button + Scrollable Image List */}
          <div className="tonet-preview-sidebar">
            <button 
              type="button" 
              className="tonet-preview-close-btn"
              onClick={() => setPreviewModalOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <div className="tonet-preview-sidebar-list">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  className={`tonet-preview-sidebar-item ${previewImageIndex === i ? 'active' : ''} ${product.isManual || (img && img.startsWith('/products/')) ? 'tonet-custom-slide-fill' : ''}`}
                  onClick={() => {
                    setPreviewImageIndex(i);
                    setZoomLevel(1);
                  }}
                >
                  <img 
                    src={getOptimizedImageUrl(img, 600)} 
                    alt={`${product.title} - ${i}`}
                    className={product.isManual || (img && img.startsWith('/products/')) ? 'tonet-custom-img-fill' : ''}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            grid-template-columns: 61.666% 38.334%;
            column-gap: 0;
            padding: 0;
            max-width: none;
            margin: 0;
            box-sizing: border-box;
          }
        }

        /* ── GALLERY COLUMN (Left side ~61.6% width) ── */
        .tonet-gallery-column {
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-gallery-column {
            background-color: #f7f8fa;
            padding: 140px 0px 80px 40px;
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
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          padding: 2px;
          box-sizing: border-box;
          aspect-ratio: 15 / 23;
        }
        .tonet-mobile-slide img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .tonet-mobile-carousel-indicator-bar {
          width: 100%;
          height: 2px;
          background-color: rgba(0, 0, 0, 0.05);
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 10;
        }
        .tonet-mobile-carousel-indicator-progress {
          height: 100%;
          background-color: #000000;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
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
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
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

        /* Desktop Gallery with Main image & Secondary Scrollable Container */
        .tonet-desktop-gallery {
          display: none;
          grid-template-columns: 4fr 1fr;
          gap: 12px;
          width: 100%;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .tonet-mobile-gallery { display: none; }
          .tonet-desktop-gallery { display: grid; }
        }
        .tonet-desktop-main-wrapper {
          width: 100%;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          display: flex;
          justify-content: center;
          align-items: center;
          aspect-ratio: 3 / 4;
          position: sticky;
          top: 140px;
          border: none;
        }
        .tonet-desktop-main-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .tonet-desktop-secondary-container {
          width: 100%;
          position: sticky;
          top: 140px;
          max-height: calc(100vh - 180px);
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          padding-right: 0px;
        }
        .tonet-desktop-secondary-container::-webkit-scrollbar {
          width: 3px;
        }
        .tonet-desktop-secondary-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }
        .tonet-desktop-secondary-scroll {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .tonet-desktop-secondary-wrapper {
          width: 100%;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          aspect-ratio: 3 / 4;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-sizing: border-box;
          transition: opacity 0.2s ease;
          opacity: 0.85;
        }
        .tonet-desktop-secondary-wrapper:hover,
        .tonet-desktop-secondary-wrapper.tonet-desktop-secondary-active {
          opacity: 1;
          border-color: #000000;
        }
        .tonet-desktop-secondary-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          mix-blend-mode: multiply;
        }

        /* ══════════════════════════════════════
           PREVISUALIZADOR / LIGHTBOX MODAL (VALENTINO STYLE)
        ══════════════════════════════════════ */
        .tonet-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: #ffffff;
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          animation: tonetFadeIn 0.25s ease-out;
        }

        .tonet-preview-stage {
          flex: 1;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          overflow: hidden;
          padding: 40px;
          box-sizing: border-box;
        }

        .tonet-preview-img-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
        }

        .tonet-preview-img {
          max-width: 90%;
          max-height: 86vh;
          object-fit: contain;
          mix-blend-mode: multiply;
          user-select: none;
        }

        .tonet-preview-bottom-bar {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 10;
          pointer-events: auto;
        }

        .tonet-preview-zoom-control {
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border-radius: 999px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .tonet-preview-zoom-btn {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 16px;
          font-weight: 400;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .tonet-preview-zoom-btn:hover {
          opacity: 1;
        }

        .tonet-preview-zoom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 130px;
          height: 3px;
          background: rgba(255, 255, 255, 0.35);
          outline: none;
          border-radius: 2px;
        }
        .tonet-preview-zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
        }

        .tonet-preview-product-tag {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          padding: 6px 16px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: #000000;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }

        .tonet-preview-sidebar {
          width: 280px;
          flex-shrink: 0;
          height: 100%;
          background: #ffffff;
          border-left: 1px solid #eee;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .tonet-preview-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #505050;
          color: #ffffff;
          border: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: background 0.2s, transform 0.2s;
        }
        .tonet-preview-close-btn:hover {
          background: #000000;
          transform: scale(1.05);
        }

        .tonet-preview-sidebar-list {
          margin-top: 80px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 16px 32px;
        }

        .tonet-preview-sidebar-item {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.65;
          transition: opacity 0.2s;
        }
        .tonet-preview-sidebar-item:hover,
        .tonet-preview-sidebar-item.active {
          opacity: 1;
        }
        .tonet-preview-sidebar-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* ── INFO COLUMN (Right side buy box ~50% width on desktop) ── */
        .tonet-info-column {
          display: block;
          padding: 32px 20px 80px;
          box-sizing: border-box;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-info-column {
            padding: 140px 64px 120px 64px;
            display: flex;
            justify-content: center;
          }
        }
        .tonet-info-sticky {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .tonet-info-sticky {
            position: sticky;
            top: 140px;
            align-items: center;
            text-align: center;
            max-width: 420px;
            margin: 0 auto;
          }
        }

        /* Title */
        .tonet-product-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          line-height: 1.4;
          margin: 0;
          text-transform: uppercase;
          color: #000000;
          text-align: center;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .tonet-product-title {
            font-size: 14px;
            font-weight: 700;
            text-align: center;
          }
        }

        /* Price */
        .tonet-pdp-price-row {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .tonet-product-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #000000;
          text-align: center;
        }

        .tonet-title-wishlist-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }

        /* Wishlist Button - Centered below product title */
        .tonet-pdp-wishlist-btn {
          background: transparent;
          border: none;
          padding: 0;
          margin: 2px auto 6px auto;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .tonet-pdp-wishlist-btn:hover {
          opacity: 0.7;
        }
        .tonet-wishlist-icon {
          font-size: 13px;
          line-height: 1;
        }

        /* ── Help & Boutique Actions Section ── */
        .tonet-pdp-actions-section {
          width: 100%;
          max-width: 380px;
          margin: 20px auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tonet-pdp-actions-divider {
          display: none;
        }
        .tonet-pdp-actions-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          width: 100%;
          flex-wrap: wrap;
        }
        .tonet-pdp-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          line-height: 1.4;
          transition: opacity 0.2s ease;
        }
        .tonet-pdp-action-btn:hover {
          opacity: 0.7;
        }
        .tonet-action-icon {
          flex-shrink: 0;
          color: #333333;
        }
        @media (max-width: 600px) {
          .tonet-pdp-actions-grid {
            gap: 16px;
          }
          .tonet-pdp-action-btn {
            font-size: 9.5px;
          }
        }

        /* Color Row */
        .tonet-pdp-color-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
        }
        .tonet-pdp-color-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
        }
        .tonet-pdp-color-swatches {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .tonet-pdp-color-dot {
          width: 15px;
          height: 15px;
          border-radius: 0 !important;
          border: 1px solid rgba(0, 0, 0, 0.2);
          cursor: pointer;
          padding: 0;
          box-sizing: border-box;
          position: relative;
        }
        .tonet-pdp-color-dot.active::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 1px solid #000000;
          border-radius: 0 !important;
        }

        /* Sizes container */
        .tonet-pdp-sizes-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .tonet-pdp-sizes-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
        }
        .tonet-pdp-sizes-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
        }
        .tonet-pdp-sizes-list {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tonet-pdp-size-btn {
          background: transparent;
          border: none;
          padding: 0 0 2px 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #000000;
          cursor: pointer;
          border-bottom: 1px solid transparent;
          line-height: 1;
        }
        .tonet-pdp-size-btn.selected {
          border-bottom: 1px solid #000000;
        }
        .tonet-pdp-size-btn.sold-out {
          color: #cccccc;
          text-decoration: line-through;
        }
        .tonet-pdp-size-guide-btn {
          background: transparent;
          border: none;
          padding: 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #666666;
          text-decoration: underline;
          cursor: pointer;
          width: fit-content;
          text-align: center;
          margin: 0 auto;
        }

        /* PDP Buy Button */
        .tonet-pdp-main-btn {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
          height: 42px;
          background: #000000;
          color: #ffffff;
          border: none;
          border-radius: 0 !important;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }
        .tonet-pdp-main-btn:hover {
          background-color: #1a1a1a;
        }

        /* Express Checkout */
        .tonet-pdp-express-box {
          position: relative;
          width: 100%;
          max-width: 380px;
          margin: 8px auto 0;
          border: 1px solid #e5e5e5;
          border-radius: 0 !important;
          padding: 24px 20px 20px;
          box-sizing: border-box;
          text-align: center;
        }
        .tonet-pdp-express-label {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #ffffff;
          padding: 0 10px;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #666666;
          text-transform: uppercase;
        }
        .tonet-pdp-express-btn {
          width: 100%;
          height: 40px;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 0 !important;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tonet-pdp-express-btn:hover {
          background-color: #f9f9f9;
        }

        /* Klarna */
        .tonet-pdp-klarna-text {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.4;
          color: #666666;
          margin: 4px auto 0;
          width: 100%;
          max-width: 380px;
          text-align: center;
        }
        .tonet-pdp-klarna-text span {
          text-decoration: underline;
          cursor: pointer;
        }

        /* Minimal Accordions */
        .tonet-accordions {
          width: 100%;
          max-width: 380px;
          margin: 12px auto 0;
          border-top: none;
        }
        .tonet-accordion-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          width: 100%;
        }
        .tonet-accordion-header {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 14px 0;
          font-size: 10px;
          font-family: var(--font-primary), sans-serif;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #000000;
          text-transform: uppercase;
          cursor: pointer;
          text-align: center;
        }
        .tonet-accordion-icon {
          position: absolute;
          right: 0;
          font-size: 11px;
          font-weight: 400;
          color: #888888;
        }
        .tonet-accordion-content {
          padding: 0 0 18px;
          text-align: center;
          font-size: 9.5px;
          line-height: 1.6;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #444444;
          text-transform: uppercase;
        }
        .tonet-accordion-content p {
          margin: 0 0 10px;
          text-align: center;
        }
        .tonet-specs-list {
          list-style: none;
          padding: 0;
          margin: 10px auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
        }
        .tonet-size-guide-link {
          background: none;
          border: none;
          padding: 0;
          margin-top: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          display: block;
          margin-left: auto;
          margin-right: auto;
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
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
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
        
        .amiri-ctl-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .amiri-ctl-image-link {
          display: block;
          width: 100%;
        }
        .amiri-ctl-card {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
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
          padding: 16px 8px 24px 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          box-sizing: border-box;
          width: 100%;
        }

        .amiri-ctl-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: lowercase;
          letter-spacing: 0.05em;
          line-height: 1.3;
          color: #000000;
          margin: 0;
          text-align: left;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .amiri-ctl-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: left;
        }

        @media (max-width: 767px) {
          .amiri-ctl-meta {
            padding: 12px 4px 16px 4px;
            gap: 2px;
          }
          .amiri-ctl-name {
            font-size: 9.5px;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.35;
          }
          .amiri-ctl-price {
            font-size: 9.5px;
            color: rgba(0, 0, 0, 0.65);
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
          background: #ffffff;
          border-top: 1px solid #e5e5e5;
          padding: 12px 20px;
          z-index: 990;
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, border-color 0.3s ease, padding 0.3s ease;
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
          border-top: 1px solid #000000;
          padding: 12px 20px;
          height: auto;
        }

        .tonet-sticky-buy-card {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-buy-card {
          flex-direction: column;
          gap: 0;
          height: auto;
        }

        .tonet-sticky-buy-info {
          display: none; /* Hidden on mobile by default */
        }

        .tonet-sticky-buy-bar.sizes-open .tonet-sticky-separator {
          display: none;
        }

        .tonet-sticky-buy-btn {
          width: 100%;
          height: 40px;
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
          will-change: grid-template-rows, opacity;
        }
        .tonet-sticky-sizes-wrapper.open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        
        .tonet-sticky-sizes-panel {
          min-height: 0;
          transform: translateY(25px);
          transition: transform 0.9s cubic-bezier(0.85, 0, 0.15, 1);
          will-change: transform;
          padding-bottom: 16px;
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
            border-top: none;
            padding: 0;
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
            font-size: 18px;
            font-weight: 400;
            color: #000000;
            letter-spacing: 0.08em;
            margin: 0;
            line-height: 1.3;
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
          .tonet-sticky-sizes-panel {
            padding-bottom: 0;
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

        /* ══ CONTACT MODAL (Valentino Style) ══ */
        .tonet-contact-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .tonet-contact-modal {
          width: 90%;
          max-width: 680px;
          max-height: 90vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          border-radius: 0 !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        .tonet-contact-header {
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eeeeee;
          flex-shrink: 0;
        }
        .tonet-contact-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0;
        }
        .tonet-contact-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #000000;
          cursor: pointer;
          padding: 4px;
        }
        .tonet-contact-content {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }
        .tonet-form-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0px;
          width: 100%;
        }
        .tonet-form-row-space {
          flex-shrink: 0;
        }
        .tonet-contact-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
        }
        .tonet-field-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #777777;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tonet-input-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #777777;
          margin-bottom: 4px;
        }
        .tonet-contact-input,
        .tonet-contact-select,
        .tonet-contact-textarea {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          color: #000000;
          border: none;
          border-bottom: 1px solid #cccccc;
          border-radius: 0 !important;
          background: transparent;
          padding: 8px 0;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-bottom-color 0.2s ease;
        }
        .tonet-contact-input:focus,
        .tonet-contact-select:focus,
        .tonet-contact-textarea:focus {
          border-bottom-color: #000000;
        }
        .tonet-radio-group {
          display: flex;
          gap: 24px;
          margin-top: 6px;
        }
        .tonet-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          cursor: pointer;
        }
        .tonet-radio-label input {
          border-radius: 0 !important;
        }
        .tonet-birthday-row {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .tonet-birthday-row select {
          flex: 1;
        }
        .tonet-upload-btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #000000;
          cursor: pointer;
          display: inline-block;
          margin-top: 8px;
        }
        .tonet-contact-disclaimer {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #666666;
          margin-top: 32px;
          margin-bottom: 24px;
        }
        .tonet-consent-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .tonet-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #333333;
          cursor: pointer;
        }
        .tonet-checkbox-label input {
          margin-top: 3px;
          border-radius: 0 !important;
          flex-shrink: 0;
        }
        .tonet-contact-actions {
          display: flex;
          justify-content: center;
          width: 100%;
        }
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

        /* ══ CONTACT MODAL (Valentino Style) ══ */
        .tonet-contact-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .tonet-contact-modal {
          width: 90%;
          max-width: 680px;
          max-height: 90vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          border-radius: 0 !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        .tonet-contact-header {
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eeeeee;
          flex-shrink: 0;
        }
        .tonet-contact-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0;
        }
        .tonet-contact-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #000000;
          cursor: pointer;
          padding: 4px;
        }
        .tonet-contact-content {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }
        .tonet-form-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0px;
          width: 100%;
        }
        .tonet-form-row-space {
          flex-shrink: 0;
        }
        .tonet-contact-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
        }
        .tonet-field-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #777777;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tonet-input-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #777777;
          margin-bottom: 4px;
        }
        .tonet-contact-input,
        .tonet-contact-select,
        .tonet-contact-textarea {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          color: #000000;
          border: none;
          border-bottom: 1px solid #cccccc;
          border-radius: 0 !important;
          background: transparent;
          padding: 8px 0;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-bottom-color 0.2s ease;
        }
        .tonet-contact-input:focus,
        .tonet-contact-select:focus,
        .tonet-contact-textarea:focus {
          border-bottom-color: #000000;
        }
        .tonet-radio-group {
          display: flex;
          gap: 24px;
          margin-top: 6px;
        }
        .tonet-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          cursor: pointer;
        }
        .tonet-radio-label input {
          border-radius: 0 !important;
        }
        .tonet-birthday-row {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .tonet-birthday-row select {
          flex: 1;
        }
        .tonet-upload-btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #000000;
          cursor: pointer;
          display: inline-block;
          margin-top: 8px;
        }
        .tonet-contact-disclaimer {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #666666;
          margin-top: 32px;
          margin-bottom: 24px;
        }
        .tonet-consent-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .tonet-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #333333;
          cursor: pointer;
        }
        .tonet-checkbox-label input {
          margin-top: 3px;
          border-radius: 0 !important;
          flex-shrink: 0;
        }
        .tonet-contact-actions {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .tonet-contact-submit-btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #ffffff;
          background: #000000;
          border: 1px solid #000000;
          border-radius: 0 !important;
          padding: 12px 64px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
          width: 100%;
          text-align: center;
        }
        .tonet-contact-submit-btn:hover {
          background: #ffffff;
          color: #000000;
        }
        @media (max-width: 600px) {
          .tonet-form-row {
            flex-direction: column;
            gap: 0;
            margin-bottom: 0;
          }
          .tonet-form-row-space {
            display: none;
          }
          .tonet-contact-content {
            padding: 20px;
          }
        }

        /* ══ WISHLIST TOAST NOTIFICATION ══ */
        .tonet-wishlist-toast {
          position: fixed;
          top: 100px;
          right: 24px;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 16px 20px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 0 !important;
          animation: tonet-toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes tonet-toast-slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .tonet-wishlist-toast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .tonet-wishlist-toast-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #000000;
          letter-spacing: 0.05em;
        }
        .tonet-wishlist-toast-thumb {
          width: 60px;
          height: 80px;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          flex-shrink: 0;
          border: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .tonet-wishlist-toast-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .tonet-wishlist-toast-footer {
          display: flex;
          justify-content: flex-start;
          width: 100%;
        }
        .tonet-wishlist-toast-link {
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #000000;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .tonet-wishlist-toast-link:hover {
          opacity: 0.7;
        }

        /* Stock Counter Badge on PDP */
        .tonet-pdp-stock-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 6px 14px;
          background: #0c0c0c;
          color: #ffffff;
          margin: 6px auto 10px auto;
          width: fit-content;
          border-radius: 0 !important;
        }
        .tonet-stock-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 0 !important;
          display: inline-block;
          animation: tonetPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes tonetPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .tonet-stock-label {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        /* Contact for Availability Buttons - Frosted Glass & Rounded Corners */
        .tonet-pdp-contact-btn {
          background: rgba(255, 255, 255, 0.45) !important;
          color: #000000 !important;
          border: 1px solid rgba(0, 0, 0, 0.8) !important;
          border-radius: 9999px !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          letter-spacing: 0.15em !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .tonet-pdp-contact-btn:hover {
          background: rgba(0, 0, 0, 0.07) !important;
          border-color: #000000 !important;
          color: #000000 !important;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px);
        }
        .tonet-pdp-contact-btn:active {
          transform: translateY(0);
          background: rgba(0, 0, 0, 0.12) !important;
        }
        .tonet-sticky-contact-btn {
          background: rgba(255, 255, 255, 0.7) !important;
          color: #000000 !important;
          border: 1px solid rgba(0, 0, 0, 0.8) !important;
          border-radius: 9999px !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          letter-spacing: 0.15em !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.3s ease !important;
        }
        .tonet-sticky-contact-btn:hover {
          background: rgba(0, 0, 0, 0.07) !important;
          border-color: #000000 !important;
          color: #000000 !important;
        }

        /* Channel Modal (WhatsApp / Instagram) */
        .tonet-channel-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          width: 90%;
          max-width: 480px;
          border-radius: 18px !important;
          border: 1px solid rgba(0, 0, 0, 0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.22);
          animation: tonetFadeIn 0.25s ease-out;
          overflow: hidden;
          position: relative;
          z-index: 10000;
        }
        .tonet-channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #f7f8fa;
        }
        .tonet-channel-tag {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: rgba(0, 0, 0, 0.5);
          text-transform: uppercase;
        }
        .tonet-channel-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .tonet-channel-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 20px;
          font-weight: 300;
          letter-spacing: -0.01em;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }
        .tonet-channel-desc {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: #555555;
          margin: 0;
        }
        .tonet-channel-product-summary {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 12px;
          background: #f7f8fa url('/product-bg.avif') center / cover no-repeat;
          border-radius: 0 !important;
          margin: 4px 0 6px 0;
        }
        .tonet-channel-thumb {
          width: 60px;
          height: 80px;
          background: transparent;
          flex-shrink: 0;
          overflow: hidden;
        }
        .tonet-channel-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .tonet-channel-summary-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tonet-channel-prod-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #000000;
          margin: 0;
        }
        .tonet-channel-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tonet-channel-spec {
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #666666;
        }
        .tonet-channel-stock {
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #15803d;
          font-weight: 500;
        }
        .tonet-channel-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #000000;
        }
        .tonet-channel-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 6px;
        }
        .tonet-channel-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 22px;
          text-decoration: none;
          color: #000000;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 9999px !important;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .tonet-channel-btn:hover {
          background: #000000;
          color: #ffffff;
          opacity: 1;
        }
        .tonet-channel-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tonet-channel-btn-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          text-align: left;
        }
        .tonet-channel-btn-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .tonet-channel-btn-sub {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          opacity: 0.7;
        }
        .tonet-channel-btn-arrow {
          font-size: 16px;
          transition: transform 0.2s ease;
        }
        .tonet-channel-btn:hover .tonet-channel-btn-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </>
  );
}
