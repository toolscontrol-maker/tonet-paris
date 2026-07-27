'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import type { CollectionDetail, Product } from '@/lib/shopify';
import { getOptimizedImageUrl } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

// Predefined set of ComfyUI fashion lifestyle images
const LIFESTYLE_IMAGES = [
  '/hero/black_lifestyle_1.png',
  '/hero/black_lifestyle_2.png',
  '/hero/ComfyUI-main_reference_00028_.png'
];

interface GridItem {
  key: string;
  type: 'product' | 'lifestyle';
  product?: Product;
  imageUrl?: string;
  colSpan: number; // 1 or 2
  rowSpan: number; // 1 or 2
}

// Function to classify product for optical image scaling classes
function getProductImageClass(title: string, tags: string[]): string {
  const tLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase());

  const isSneaker = tLower.includes('sneaker') || tLower.includes('shoes') || tLower.includes('clog') || tagsLower.includes('footwear') || tagsLower.includes('sneakers');
  const isPants = tLower.includes('pants') || tLower.includes('shorts') || tLower.includes('trouser') || tagsLower.includes('bottoms') || tagsLower.includes('pants');
  const isAccessory = tLower.includes('ball') || tLower.includes('sunglasses') || tLower.includes('bag') || tagsLower.includes('accessories');
  
  if (isSneaker) return 'amiri-product-img--sneaker';
  if (isPants) return 'amiri-product-img--pants';
  if (isAccessory) return 'amiri-product-img--accessory';
  return 'amiri-product-img--top'; // Default
}

function getProductScore(product: Product): number {
  const title = product.title.toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase());

  const isShirt = title.includes('shirt') || title.includes('tee') || title.includes('top') || title.includes('camiseta') || tags.includes('tops') || tags.includes('t-shirts') || tags.includes('tshirt') || tags.includes('tee');
  const isPant = title.includes('pant') || title.includes('short') || title.includes('trouser') || title.includes('jean') || title.includes('pantalon') || tags.includes('bottoms') || tags.includes('pants') || tags.includes('shorts') || tags.includes('trousers') || tags.includes('jeans');

  if (isShirt) return 0;
  if (isPant) return 1;
  return 2;
}

function hasBlackColor(product: Product): boolean {
  return product.variants.some(v => 
    v.selectedOptions.some(opt => {
      const name = opt.name.toLowerCase();
      if (name === 'color' || name === 'colour') {
        const val = opt.value.toLowerCase();
        return val.includes('black') || val.includes('negro');
      }
      return false;
    })
  );
}

function getHexColor(color: string): string {
  const c = color.toLowerCase();
  if (c.includes('negro') || c.includes('black')) return '#000000';
  if (c.includes('blanco') || c.includes('white')) return '#ffffff';
  if (c.includes('gris') || c.includes('grey') || c.includes('gray')) return '#8e8e93';
  if (c.includes('azul') || c.includes('blue')) return '#004080';
  if (c.includes('rojo') || c.includes('red')) return '#a30000';
  if (c.includes('verde') || c.includes('green')) return '#006400';
  if (c.includes('marrón') || c.includes('marron') || c.includes('brown')) return '#5c4033';
  if (c.includes('beis') || c.includes('beige')) return '#f5f5dc';
  if (c.includes('amarillo') || c.includes('yellow')) return '#ffd700';
  return '#cccccc';
}

function ProductCard({ 
  product, 
  collectionHandle, 
  formatPrice 
}: { 
  product: Product; 
  collectionHandle: string; 
  formatPrice: (price: number, currency: string) => string; 
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean) as string[];

  const { language } = useLocale();
  const { toggle, has } = useWishlist();
  const isFavorite = has(product.handle);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      handle: product.handle,
      title: product.title,
      imageUrl: product.imageUrl || '',
      price: product.price,
      currencyCode: product.currencyCode || 'EUR',
      collectionTitle: collectionHandle || ''
    });
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeIdx) {
          setActiveIdx(index);
        }
      }
    }
  };

  const imageClass = getProductImageClass(product.title, product.tags);

  return (
    <div className="amiri-grid-item amiri-grid-item--product">
      {/* Swipeable Image Gallery */}
      <div className="v-product-gallery-container">
        {/* Wishlist/Favorites Star Button */}
        <button 
          type="button"
          className={`v-wishlist-btn ${isFavorite ? 'favorite' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </button>

        <div 
          ref={carouselRef}
          className="v-product-carousel"
          onScroll={handleScroll}
        >
          {images.map((imgUrl, i) => (
            <Link 
              key={i} 
              href={`/product/${product.handle}`} 
              className="v-product-carousel-slide"
              draggable={false}
            >
              <img
                src={getOptimizedImageUrl(imgUrl, 800)}
                alt={`${product.title} - Vista ${i + 1}`}
                className={`amiri-product-img ${imageClass}`}
                loading="lazy"
                draggable={false}
              />
            </Link>
          ))}
        </div>

        {/* Horizontal Progress Indicator Bar sticky inside the image block */}
        {images.length > 1 && (
          <div className="v-product-carousel-indicator-bar">
            <div 
              className="v-product-carousel-indicator-progress"
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${activeIdx * 100}%)`
              }}
            />
          </div>
        )}
      </div>

      <Link href={`/product/${product.handle}`} className="amiri-product-info">
        <span className="amiri-product-name">{product.title}</span>
        <span className="amiri-product-price">
          {formatPrice(product.price, product.currencyCode)}
        </span>
      </Link>
    </div>
  );
}

export default function CollectionClient({ collection }: { collection: CollectionDetail }) {
  const { formatPrice } = useLocale();

  const getProductCategory = (p: Product) => {
    const title = p.title.toLowerCase();
    const tags = p.tags.map(t => t.toLowerCase());
    if (title.includes('shirt') || title.includes('tee') || tags.includes('tops') || tags.includes('t-shirt') || tags.includes('tshirt')) return 'T-shirts';
    if (title.includes('pant') || title.includes('trouser') || title.includes('jean') || title.includes('short') || tags.includes('bottoms') || tags.includes('pants') || tags.includes('shorts') || tags.includes('jeans')) return 'Trousers';
    if (title.includes('sneaker') || title.includes('shoe') || tags.includes('footwear') || tags.includes('sneakers')) return 'Footwear';
    if (title.includes('jacket') || title.includes('coat') || tags.includes('outerwear') || tags.includes('jackets')) return 'Outerwear';
    if (title.includes('bag') || title.includes('belt') || tags.includes('accessories')) return 'Accessories';
    return 'Apparel';
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Reset mobile submenu when filters are closed
  useEffect(() => {
    if (!filtersOpen) {
      setMobileSubmenu(null);
      setActiveSubmenu(null);
      setIsClosing(false);
    }
  }, [filtersOpen]);

  // Disable body scroll when filters panel is open
  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  // Committed Filters State (Controls the Grid)
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Temporary Filters State (Inside the Refine Drawer)
  const [tempSort, setTempSort] = useState<string>('featured');
  const [tempAvailability, setTempAvailability] = useState<string[]>([]);
  const [tempColors, setTempColors] = useState<string[]>([]);
  const [tempSizes, setTempSizes] = useState<string[]>([]);
  const [tempMaterials, setTempMaterials] = useState<string[]>([]);
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  const [refineOpen, setRefineOpen] = useState(false);
  const [activeFilterAccordion, setActiveFilterAccordion] = useState<string | null>(null);

  // Mobile accordions open/closed state
  const [mobileAccordions, setMobileAccordions] = useState<Record<string, boolean>>({
    color: true, // Color open by default (most important)
    linea: false,
    categoria: false,
    talla: false
  });
  const toggleMobileAccordion = (key: string) => {
    setMobileAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic filter options extraction
  const filterOptions = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const materials = new Set<string>();
    const categories = new Set<string>();



    const materialKeywords = ['cotton', 'fleece', 'denim', 'leather', 'wool', 'silk', 'nylon', 'polyester', 'linen', 'knit', 'cashmere', 'waffle'];

    collection.products.forEach(p => {
      p.variants.forEach(v => {
        v.selectedOptions.forEach(opt => {
          const nameLower = opt.name.toLowerCase();
          if (nameLower === 'color' || nameLower === 'colour') {
            colors.add(opt.value);
          } else if (nameLower === 'size' || nameLower === 'talla') {
            sizes.add(opt.value);
          }
        });
      });

      p.tags.forEach(t => {
        const tLower = t.toLowerCase();
        if (materialKeywords.includes(tLower)) {
          materials.add(t);
        }
      });

      materialKeywords.forEach(mat => {
        if (p.description?.toLowerCase().includes(mat) || p.title.toLowerCase().includes(mat)) {
          materials.add(mat.charAt(0).toUpperCase() + mat.slice(1));
        }
      });

      categories.add(getProductCategory(p));
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      materials: Array.from(materials).sort(),
      categories: Array.from(categories).sort()
    };
  }, [collection.products]);

  // Open / Close Drawer Handling
  const openRefine = () => {
    setTempSort(selectedSort);
    setTempAvailability(selectedAvailability);
    setTempColors(selectedColors);
    setTempSizes(selectedSizes);
    setTempMaterials(selectedMaterials);
    setTempCategories(selectedCategories);
    setRefineOpen(true);
  };

  const closeFiltersPanel = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsClosing(true);
      setTimeout(() => {
        setFiltersOpen(false);
        setIsClosing(false);
        setMobileSubmenu(null);
      }, 450);
    } else {
      setFiltersOpen(false);
    }
  };

  const applyFilters = () => {
    setSelectedSort(tempSort);
    setSelectedAvailability(tempAvailability);
    setSelectedColors(tempColors);
    setSelectedSizes(tempSizes);
    setSelectedMaterials(tempMaterials);
    setSelectedCategories(tempCategories);
    setRefineOpen(false);
    closeFiltersPanel(); // Close filters panel with transition when applied
  };

  const clearFilters = () => {
    setTempSort('featured');
    setTempAvailability([]);
    setTempColors([]);
    setTempSizes([]);
    setTempMaterials([]);
    setTempCategories([]);
  };

  const toggleTempFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // committed filtering
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...collection.products];

    // 1. Availability
    if (selectedAvailability.length > 0) {
      result = result.filter(p => {
        const inStock = p.variants.some(v => v.availableForSale);
        if (selectedAvailability.includes('in-stock') && inStock) return true;
        if (selectedAvailability.includes('out-of-stock') && !inStock) return true;
        return false;
      });
    }

    // 2. Color
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') && 
            selectedColors.includes(opt.value)
          )
        )
      );
    }

    // 3. Size
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'talla') && 
            selectedSizes.includes(opt.value)
          )
        )
      );
    }

    // 4. Material (Linea)
    if (selectedMaterials.length > 0) {
      result = result.filter(p => {
        const tagsLower = p.tags.map(t => t.toLowerCase());
        const titleLower = p.title.toLowerCase();
        const descLower = p.description?.toLowerCase() ?? '';
        return selectedMaterials.some(mat => {
          const matLower = mat.toLowerCase();
          return tagsLower.includes(matLower) || titleLower.includes(matLower) || descLower.includes(matLower);
        });
      });
    }

    // 5. Category (Categoria)
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const cat = getProductCategory(p);
        return selectedCategories.includes(cat);
      });
    }

    // 6. Sorting
    if (selectedSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Default: sort by newest first (createdAt descending)
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [collection.products, collection.handle, selectedSort, selectedAvailability, selectedColors, selectedSizes, selectedMaterials, selectedCategories]);

  // temp count inside drawer
  const tempFilteredCount = useMemo(() => {
    let result = [...collection.products];

    if (tempAvailability.length > 0) {
      result = result.filter(p => {
        const inStock = p.variants.some(v => v.availableForSale);
        if (tempAvailability.includes('in-stock') && inStock) return true;
        if (tempAvailability.includes('out-of-stock') && !inStock) return true;
        return false;
      });
    }

    if (tempColors.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') && 
            tempColors.includes(opt.value)
          )
        )
      );
    }

    if (tempSizes.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => 
          v.selectedOptions.some(opt => 
            (opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'talla') && 
            tempSizes.includes(opt.value)
          )
        )
      );
    }

    if (tempMaterials.length > 0) {
      result = result.filter(p => {
        const tagsLower = p.tags.map(t => t.toLowerCase());
        const titleLower = p.title.toLowerCase();
        const descLower = p.description?.toLowerCase() ?? '';
        return tempMaterials.some(mat => {
          const matLower = mat.toLowerCase();
          return tagsLower.includes(matLower) || titleLower.includes(matLower) || descLower.includes(matLower);
        });
      });
    }

    if (tempCategories.length > 0) {
      result = result.filter(p => {
        const cat = getProductCategory(p);
        return tempCategories.includes(cat);
      });
    }

    return result.length;
  }, [collection.products, tempAvailability, tempColors, tempSizes, tempMaterials, tempCategories]);

  // Dynamic layout generator (Interweaving lifestyle images into the grid)
  const gridItems = useMemo(() => {
    const items: GridItem[] = [];
    let productIdx = 0;
    let lifestyleIdx = 0;

    const totalProducts = filteredAndSortedProducts.length;
    if (totalProducts === 0) return [];

    // For new arrivals, display only products as standard 1x1 grid items
    if (collection.handle === 'new-arrivals') {
      filteredAndSortedProducts.forEach((p) => {
        items.push({
          key: `prod-${p.id}`,
          type: 'product',
          product: p,
          colSpan: 1,
          rowSpan: 1
        });
      });
      return items;
    }

    // Simple grid layout if very few products
    if (totalProducts <= 3) {
      filteredAndSortedProducts.forEach((p) => {
        items.push({
          key: `prod-${p.id}`,
          type: 'product',
          product: p,
          colSpan: 1,
          rowSpan: 1
        });
      });
      items.push({
        key: 'lifestyle-end',
        type: 'lifestyle',
        imageUrl: LIFESTYLE_IMAGES[0],
        colSpan: 1,
        rowSpan: 1
      });
      return items;
    }

    // High fidelity modular pattern
    const pattern = [
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'lifestyle', colSpan: 2, rowSpan: 1 }, // wide lifestyle cover
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 2, rowSpan: 2 }, // spotlight product cell
      { type: 'lifestyle', colSpan: 1, rowSpan: 1 }, // small lifestyle cell
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'product', colSpan: 1, rowSpan: 1 },
      { type: 'lifestyle', colSpan: 2, rowSpan: 2 } // large lifestyle cover
    ];

    let patternIdx = 0;
    while (productIdx < totalProducts) {
      const pRule = pattern[patternIdx % pattern.length];
      
      if (pRule.type === 'product') {
        const p = filteredAndSortedProducts[productIdx++];
        items.push({
          key: `prod-${p.id}-${productIdx}`,
          type: 'product',
          product: p,
          colSpan: pRule.colSpan,
          rowSpan: pRule.rowSpan
        });
      } else {
        const img = LIFESTYLE_IMAGES[lifestyleIdx % LIFESTYLE_IMAGES.length];
        lifestyleIdx++;
        items.push({
          key: `lifestyle-${lifestyleIdx}`,
          type: 'lifestyle',
          imageUrl: img,
          colSpan: pRule.colSpan,
          rowSpan: pRule.rowSpan
        });
      }
      patternIdx++;
    }

    // Grid balancing row completion (to fill a 4-column row layout cleanly)
    if (items.length % 4 !== 0) {
      const remainder = 4 - (items.length % 4);
      for (let i = 0; i < remainder; i++) {
        const img = LIFESTYLE_IMAGES[lifestyleIdx % LIFESTYLE_IMAGES.length];
        lifestyleIdx++;
        items.push({
          key: `lifestyle-fill-${lifestyleIdx}`,
          type: 'lifestyle',
          imageUrl: img,
          colSpan: 1,
          rowSpan: 1
        });
      }
    }

    return items;
  }, [filteredAndSortedProducts, collection.handle]);

  const toggleAccordion = (name: string) => {
    setActiveFilterAccordion(activeFilterAccordion === name ? null : name);
  };

  const getBreadcrumbs = () => {
    const handleLower = collection.handle.toLowerCase();
    let gender = "Collections";
    let genderLink = "/";
    if (handleLower.includes("hombre") || handleLower.includes("men")) {
      gender = "MEN";
      genderLink = "/collection/men";
    } else if (handleLower.includes("mujer") || handleLower.includes("women")) {
      gender = "WOMEN";
      genderLink = "/collection/women";
    }
    
    const displayTitle = (collection.title.toUpperCase() === 'MEN' || collection.title.toUpperCase() === 'WOMEN')
      ? collection.title.toUpperCase()
      : collection.title.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
      <span className="v-breadcrumb">
        <Link href="/">Home</Link> / <Link href={genderLink}>{gender}</Link> / <span className="v-breadcrumb-current">{displayTitle}</span> ({filteredAndSortedProducts.length})
      </span>
    );
  };

  return (
    <>
      <div className="amiri-collection-container">
        
        {/* STICKY HEADER BLOCK */}
        <div className={`v-plp-sticky-header ${(filtersOpen || isClosing) ? 'filters-active' : ''}`}>
          {/* TOP BAR: Breadcrumbs & Filters/Sort triggers (Desktop always, Mobile when closed) */}
          <div className="v-plp-header-row">
            <div className="v-plp-header-left">
              {getBreadcrumbs()}
            </div>
            <div className="v-plp-header-right">
              <button 
                type="button" 
                className={`v-plp-trigger ${filtersOpen ? 'active' : ''}`}
                onClick={() => {
                  setFiltersOpen(!filtersOpen);
                  setSortOpen(false);
                }}
              >
                Filter by {filtersOpen ? '−' : '+'}
              </button>
              <button 
                type="button" 
                className={`v-plp-trigger ${sortOpen ? 'active' : ''}`}
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setFiltersOpen(false);
                }}
              >
                Sort by {sortOpen ? '−' : '+'}
              </button>
            </div>
          </div>

          {/* MOBILE HEADER (Visible on mobile only, when filters are open!) */}
          <div className="v-plp-mobile-header">
            {/* Mobile Row 1 */}
            <div className="v-plp-mobile-row-1">
              <div className="v-plp-header-left">
                {getBreadcrumbs()}
              </div>
              <button 
                type="button" 
                className="v-plp-mobile-close-btn"
                onClick={closeFiltersPanel}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Mobile Row 2 */}
            <div className="v-plp-mobile-row-2">
              <div className="v-plp-mobile-breadcrumbs">
                <button 
                  type="button" 
                  className={`v-plp-mb-link ${!mobileSubmenu ? 'active' : ''}`}
                  onClick={() => setMobileSubmenu(null)}
                >
                  Filters
                </button>
                
                {mobileSubmenu ? (
                  <>
                    <span className="v-plp-mb-separator">/</span>
                    <span className="v-plp-mb-text active">
                      {mobileSubmenu === 'color' ? `Color${tempColors.length > 0 ? ` [${tempColors.length}]` : ''}` :
                       mobileSubmenu === 'linea' ? `Line${tempMaterials.length > 0 ? ` [${tempMaterials.length}]` : ''}` :
                       mobileSubmenu === 'categoria' ? `Category${tempCategories.length > 0 ? ` [${tempCategories.length}]` : ''}` :
                       mobileSubmenu === 'talla' ? `Size${tempSizes.length > 0 ? ` [${tempSizes.length}]` : ''}` : 'Sort by'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="v-plp-mb-separator">/</span>
                    <button 
                      type="button" 
                      className="v-plp-mb-link"
                      onClick={() => {
                        setActiveSubmenu('sort');
                        setMobileSubmenu('sort');
                      }}
                    >
                      Sort by
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* EXPANDED INLINE FILTERS PANEL */}
          {(filtersOpen || isClosing) && (
            <div className={`v-filters-panel ${isClosing ? 'closing' : ''}`}>
              {/* DESKTOP VIEW */}
              <div className="v-filters-desktop-view">
                {/* Mobile Fixed Header (hidden on desktop) */}
                <div className="v-filters-mobile-header">
                  <button 
                    type="button" 
                    className="v-filters-mobile-header-reset" 
                    onClick={clearFilters}
                  >
                    Reset
                  </button>
                  <span className="v-filters-mobile-title">Filters</span>
                  <button 
                    type="button" 
                    className="v-filters-mobile-close"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X size={20} strokeWidth={1.2} />
                  </button>
                </div>

                {/* Scrollable filters container */}
                <div className="v-filters-scrollable-content">
                  <div className="v-filters-grid">
                    
                    {/* Column 1: Color */}
                    {filterOptions.colors.length > 0 && (
                      <div className="v-filter-col">
                        <button 
                          type="button"
                          className="v-filter-col-header"
                          onClick={() => toggleMobileAccordion('color')}
                        >
                          <span className="v-filter-col-title">Color</span>
                          <span className="v-filter-col-arrow">{mobileAccordions.color ? '−' : '+'}</span>
                        </button>
                        
                        <div className={`v-filter-options-wrapper ${mobileAccordions.color ? 'open' : ''}`}>
                          <div className="v-filter-options-scrollable-container">
                            <div className="v-filter-options v-filter-options-scroll">
                              {filterOptions.colors.map(col => (
                                <button
                                  key={col}
                                  type="button"
                                  className={`v-filter-option ${tempColors.includes(col) ? 'active' : ''}`}
                                  onClick={() => toggleTempFilter(tempColors, setTempColors, col)}
                                >
                                  <span className="v-filter-dot" style={{ backgroundColor: getHexColor(col) }} />
                                  <span>{col.toLowerCase()}</span>
                                  {tempColors.includes(col) && <span className="v-filter-option-close">×</span>}
                                </button>
                              ))}
                            </div>
                            <div className="v-filter-options-blur" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Column 2: Linea */}
                    {filterOptions.materials.length > 0 && (
                      <div className="v-filter-col">
                        <button 
                          type="button"
                          className="v-filter-col-header"
                          onClick={() => toggleMobileAccordion('linea')}
                        >
                          <span className="v-filter-col-title">Line</span>
                          <span className="v-filter-col-arrow">{mobileAccordions.linea ? '−' : '+'}</span>
                        </button>

                        <div className={`v-filter-options-wrapper ${mobileAccordions.linea ? 'open' : ''}`}>
                          <div className="v-filter-options-scrollable-container">
                            <div className="v-filter-options v-filter-options-scroll">
                               {filterOptions.materials.map(mat => (
                                <button
                                  key={mat}
                                  type="button"
                                  className={`v-filter-option ${tempMaterials.includes(mat) ? 'active' : ''}`}
                                  onClick={() => toggleTempFilter(tempMaterials, setTempMaterials, mat)}
                                >
                                  <span>{mat.toLowerCase()}</span>
                                  {tempMaterials.includes(mat) && <span className="v-filter-option-close">×</span>}
                                </button>
                              ))}
                            </div>
                            <div className="v-filter-options-blur" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Column 3: Categoria */}
                    {filterOptions.categories.length > 0 && (
                      <div className="v-filter-col">
                        <button 
                          type="button"
                          className="v-filter-col-header"
                          onClick={() => toggleMobileAccordion('categoria')}
                        >
                          <span className="v-filter-col-title">Category</span>
                          <span className="v-filter-col-arrow">{mobileAccordions.categoria ? '−' : '+'}</span>
                        </button>

                        <div className={`v-filter-options-wrapper ${mobileAccordions.categoria ? 'open' : ''}`}>
                          <div className="v-filter-options-scrollable-container">
                            <div className="v-filter-options v-filter-options-scroll">
                               {filterOptions.categories.map(cat => (
                                <button
                                  key={cat}
                                  type="button"
                                  className={`v-filter-option ${tempCategories.includes(cat) ? 'active' : ''}`}
                                  onClick={() => toggleTempFilter(tempCategories, setTempCategories, cat)}
                                >
                                  <span>{cat.toLowerCase()}</span>
                                  {tempCategories.includes(cat) && <span className="v-filter-option-close">×</span>}
                                </button>
                              ))}
                            </div>
                            <div className="v-filter-options-blur" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Column 4: Talla */}
                    {filterOptions.sizes.length > 0 && (
                      <div className="v-filter-col">
                        <button 
                          type="button"
                          className="v-filter-col-header"
                          onClick={() => toggleMobileAccordion('talla')}
                        >
                          <span className="v-filter-col-title">Size</span>
                          <span className="v-filter-col-arrow">{mobileAccordions.talla ? '−' : '+'}</span>
                        </button>

                        <div className={`v-filter-options-wrapper ${mobileAccordions.talla ? 'open' : ''}`}>
                          <div className="v-filter-options-scrollable-container">
                            <div className="v-filter-options v-filter-options-scroll">
                               {filterOptions.sizes.map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  className={`v-filter-option ${tempSizes.includes(sz) ? 'active' : ''}`}
                                  onClick={() => toggleTempFilter(tempSizes, setTempSizes, sz)}
                                >
                                  <span>{sz.toLowerCase()}</span>
                                  {tempSizes.includes(sz) && <span className="v-filter-option-close">×</span>}
                                </button>
                              ))}
                            </div>
                            <div className="v-filter-options-blur" />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Desktop inline buttons absolute positioned at the right */}
                  <div className="v-filters-desktop-inline-buttons">
                    <button 
                      type="button" 
                      className="v-filters-mobile-btn-reset" 
                      onClick={clearFilters}
                    >
                      Reset all
                    </button>
                    <button 
                      type="button" 
                      className="v-filters-mobile-btn-apply" 
                      onClick={applyFilters}
                    >
                      Apply changes
                    </button>
                  </div>
                </div>

                {/* Footer buttons (Shared Mobile & Desktop) */}
                <div className="v-filters-mobile-footer">
                  <button 
                    type="button" 
                    className="v-filters-mobile-btn-reset" 
                    onClick={clearFilters}
                  >
                    Reset all
                  </button>
                  <button 
                    type="button" 
                    className="v-filters-mobile-btn-apply" 
                    onClick={applyFilters}
                  >
                    Apply changes
                  </button>
                </div>

                {/* Blur backdrop overlay (desktop only, clicking it closes filters) */}
                <div className="v-filters-blur-overlay" onClick={() => setFiltersOpen(false)} />
              </div>

              {/* MOBILE VIEW */}
              <div className="v-filters-mobile-view">
                {/* Mobile Slider Viewport Container */}
                <div className="v-filters-mobile-slider-viewport">
                  <div className={`v-filters-mobile-slider-track ${mobileSubmenu ? 'slide-active' : ''}`}>
                    
                    {/* PANEL 1: Main Menu */}
                    <div className="v-filters-mobile-panel">
                      {/* Mobile Main Menu Content */}
                      <div className="v-filters-mobile-menu-list">
                        <button 
                          type="button" 
                          className="v-filters-mobile-menu-item"
                          onClick={() => {
                            setActiveSubmenu('color');
                            setMobileSubmenu('color');
                          }}
                        >
                          <span>Color</span>
                          <span className="v-filters-mobile-chevron">
                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                              <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                            </svg>
                          </span>
                        </button>
                        <button 
                          type="button" 
                          className="v-filters-mobile-menu-item"
                          onClick={() => {
                            setActiveSubmenu('linea');
                            setMobileSubmenu('linea');
                          }}
                        >
                          <span>Line</span>
                          <span className="v-filters-mobile-chevron">
                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                              <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                            </svg>
                          </span>
                        </button>
                        <button 
                          type="button" 
                          className="v-filters-mobile-menu-item"
                          onClick={() => {
                            setActiveSubmenu('categoria');
                            setMobileSubmenu('categoria');
                          }}
                        >
                          <span>Category</span>
                          <span className="v-filters-mobile-chevron">
                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                              <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                            </svg>
                          </span>
                        </button>
                        <button 
                          type="button" 
                          className="v-filters-mobile-menu-item"
                          onClick={() => {
                            setActiveSubmenu('talla');
                            setMobileSubmenu('talla');
                          }}
                        >
                          <span>Size</span>
                          <span className="v-filters-mobile-chevron">
                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                              <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* PANEL 2: Sub-menu */}
                    <div className="v-filters-mobile-panel">
                      {/* Mobile Back Button Row (Row 3 - slides inside Panel 2!) */}
                      <div className="v-filters-mobile-row-back">
                        <button 
                          type="button" 
                          className="v-filters-mobile-back-btn"
                          onClick={() => setMobileSubmenu(null)}
                        >
                          <svg width="10" height="10" viewBox="0 0 6 10" fill="none" style={{ transform: 'rotate(180deg)' }}>
                            <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                          </svg>
                          Back
                        </button>
                      </div>

                      {/* Mobile Submenu Option List Content */}
                      <div className="v-filters-mobile-submenu-options">
                        {activeSubmenu === 'color' && filterOptions.colors.map(col => (
                          <button
                            key={col}
                            type="button"
                            className={`v-filter-option ${tempColors.includes(col) ? 'active' : ''}`}
                            onClick={() => toggleTempFilter(tempColors, setTempColors, col)}
                          >
                            <span className="v-filter-dot" style={{ backgroundColor: getHexColor(col) }} />
                            <span>{col.toLowerCase()}</span>
                            {tempColors.includes(col) && <span className="v-filter-option-close">×</span>}
                          </button>
                        ))}

                        {activeSubmenu === 'linea' && filterOptions.materials.map(mat => (
                          <button
                            key={mat}
                            type="button"
                            className={`v-filter-option ${tempMaterials.includes(mat) ? 'active' : ''}`}
                            onClick={() => toggleTempFilter(tempMaterials, setTempMaterials, mat)}
                          >
                            <span>{mat.toLowerCase()}</span>
                            {tempMaterials.includes(mat) && <span className="v-filter-option-close">×</span>}
                          </button>
                        ))}

                        {activeSubmenu === 'categoria' && filterOptions.categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            className={`v-filter-option ${tempCategories.includes(cat) ? 'active' : ''}`}
                            onClick={() => toggleTempFilter(tempCategories, setTempCategories, cat)}
                          >
                            <span>{cat.toLowerCase()}</span>
                            {tempCategories.includes(cat) && <span className="v-filter-option-close">×</span>}
                          </button>
                        ))}

                        {activeSubmenu === 'talla' && filterOptions.sizes.map(sz => (
                          <button
                            key={sz}
                            type="button"
                            className={`v-filter-option ${tempSizes.includes(sz) ? 'active' : ''}`}
                            onClick={() => toggleTempFilter(tempSizes, setTempSizes, sz)}
                          >
                            <span>{sz.toLowerCase()}</span>
                            {tempSizes.includes(sz) && <span className="v-filter-option-close">×</span>}
                          </button>
                        ))}

                        {activeSubmenu === 'sort' && [
                          { value: 'featured', label: 'featured' },
                          { value: 'newest', label: 'new arrivals' },
                          { value: 'price-asc', label: 'price: low to high' },
                          { value: 'price-desc', label: 'price: high to low' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`v-filter-option ${tempSort === opt.value ? 'active' : ''}`}
                            onClick={() => setTempSort(opt.value)}
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Mobile Bottom Action Footer */}
                <div className="v-filters-mobile-action-footer">
                  <button 
                    type="button" 
                    className="v-filters-mobile-btn-reset" 
                    onClick={() => {
                      if (mobileSubmenu === 'sort') {
                        setTempSort('featured');
                      } else {
                        clearFilters();
                      }
                    }}
                  >
                    Reset all
                  </button>
                  <button 
                    type="button" 
                    className="v-filters-mobile-btn-apply" 
                    onClick={() => {
                      if (mobileSubmenu === 'sort') {
                        setSelectedSort(tempSort);
                        setFiltersOpen(false);
                        setMobileSubmenu(null);
                      } else {
                        applyFilters();
                        setMobileSubmenu(null);
                      }
                    }}
                  >
                    Apply changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPANDED INLINE SORT PANEL */}
          {sortOpen && (
            <div className="v-sort-dropdown">
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'featured' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('featured');
                  setSortOpen(false);
                }}
              >
                <span className="v-sort-checkmark-wrapper">
                  {selectedSort === 'featured' ? '✓ ' : '\u00A0\u00A0'}
                </span>
                Recommended
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'price-asc' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('price-asc');
                  setSortOpen(false);
                }}
              >
                <span className="v-sort-checkmark-wrapper">
                  {selectedSort === 'price-asc' ? '✓ ' : '\u00A0\u00A0'}
                </span>
                Price: low to high
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'price-desc' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('price-desc');
                  setSortOpen(false);
                }}
              >
                <span className="v-sort-checkmark-wrapper">
                  {selectedSort === 'price-desc' ? '✓ ' : '\u00A0\u00A0'}
                </span>
                Price: high to low
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'newest' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('newest'); // corrected to set 'newest' instead of 'price-desc'
                  setSortOpen(false);
                }}
              >
                <span className="v-sort-checkmark-wrapper">
                  {selectedSort === 'newest' ? '✓ ' : '\u00A0\u00A0'}
                </span>
                New in
              </button>
            </div>
          )}
        </div>

        {/* COLLECTION TITLE */}
        <div className="v-collection-title-row">
          <h1 className="v-collection-title">
            {collection.title.toLowerCase()}
          </h1>
        </div>

        {/* MAIN MODULAR GRID */}
        <div className="amiri-grid-wrapper">
          {gridItems.length > 0 ? (
            <div className="amiri-modular-grid">
              {gridItems.map((item) => {
                if (item.type === 'product' && item.product) {
                  const p = item.product;
                  return (
                    <ProductCard
                      key={item.key}
                      product={p}
                      collectionHandle={collection.handle}
                      formatPrice={formatPrice}
                    />
                  );
                } else {
                  const isLarge = item.colSpan === 2 && item.rowSpan === 2;
                  const isWide = item.colSpan === 2 && item.rowSpan === 1;
                  
                  return (
                    <div
                      key={item.key}
                      className={`amiri-grid-item amiri-grid-item--lifestyle ${
                        isLarge ? 'amiri-grid-item--span-2 amiri-grid-item--row-2' : ''
                      } ${isWide ? 'amiri-grid-item--span-2 amiri-grid-item--wide' : ''}`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt="Collection Lifestyle"
                          className="amiri-lifestyle-img amiri-fade-in"
                          loading="lazy"
                          decoding="async"
                          onLoad={(e) => e.currentTarget.classList.add('loaded')}
                          ref={(el) => {
                            if (el && el.complete) el.classList.add('loaded');
                          }}
                        />
                      )}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="amiri-empty-grid">
              <span>NO PRODUCTS FOUND MATCHING THE ACTIVE FILTERS</span>
            </div>
          )}
        </div>
      </div>





      <style>{`
        /* AMIRI LUXURY EDITORIAL PLP STYLE REPLICA */
        .amiri-collection-container {
          padding-top: 0;
          padding-bottom: 120px;
          background-color: #ffffff;
          overflow: visible;
        }

        @media (max-width: 767px) {
          .amiri-collection-container {
            padding-top: 0;
          }
        }

        .v-collection-title-row {
          padding: 40px 40px 32px 40px;
        }
        @media (max-width: 767px) {
          .v-collection-title-row {
            padding: 32px 16px 24px 16px;
          }
        }
        .v-collection-title {
          font-family: var(--font-primary), sans-serif;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 700;
          text-transform: lowercase;
          letter-spacing: -0.01em;
          color: #000000;
          margin: 0;
          line-height: 1.1;
        }

        .v-plp-sticky-header {
          position: sticky;
          top: var(--header-height, 64px);
          z-index: 100;
          background-color: #ffffff;
        }

        /* TOP AREA */
        .v-plp-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px 16px 40px;

          background-color: #ffffff;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .v-plp-header-row {
            padding: 12px 16px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }
        }

        .v-breadcrumb {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.5);
          letter-spacing: 0.05em;
          text-transform: none;
        }

        .v-breadcrumb a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .v-breadcrumb a:hover {
          color: #000000;
          text-decoration: underline;
        }

        .v-breadcrumb-current {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 12.5px;
          color: #000000;
          text-transform: none;
        }

        .v-plp-header-right {
          display: flex;
          gap: 16px;
        }

        @media (max-width: 767px) {
          .v-plp-header-right {
            width: auto;
            justify-content: flex-end;
            gap: 12px;
          }
        }

        .v-plp-trigger {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.6);
          letter-spacing: 0.08em;
          cursor: pointer;
          padding: 6px 0;
          transition: color 0.3s ease;
          outline: none;
          text-transform: none;
        }

        .v-plp-trigger:hover, .v-plp-trigger.active {
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        /* GRID SYSTEM */
        .amiri-grid-wrapper {
          padding: 0;
          box-sizing: border-box;
          width: 100%;
        }

        .amiri-modular-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2px; /* tight white separator lines */
          background-color: #ffffff; /* white grid lines */
          box-sizing: border-box;
          border-top: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        }
        @media (max-width: 1023px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 2px;
          }
        }
        @media (max-width: 767px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 2px;
          }
        }

        .amiri-empty-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 120px 24px;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #888888;
          background-color: #ffffff;
        }

        /* GRID ITEMS */
        .amiri-grid-item {
          background-color: #f7f8fa;
          position: relative;
          box-sizing: border-box;
          overflow: visible;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }

        @media (max-width: 767px) {
          .amiri-grid-item--product {
            background-color: #ffffff;
            aspect-ratio: unset;
            overflow: visible;
          }
        }

        .amiri-grid-item--span-2 {
          grid-column: span 2;
        }
        .amiri-grid-item--row-2 {
          grid-row: span 2;
        }
        .amiri-grid-item--wide {
          aspect-ratio: 6 / 5;
        }

        @media (max-width: 767px) {
          .amiri-grid-item--span-2 {
            grid-column: span 2;
          }
          .amiri-grid-item--row-2 {
            grid-row: span 2;
          }
        }

        /* PRODUCT CELLS INTERIOR */
        .amiri-product-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #000000;
          z-index: 6;
        }

        /* Swiper / Carousel styles */
        .v-product-gallery-container {
          width: 100%;
          aspect-ratio: 3 / 4;
          position: relative;
          overflow: hidden;
          background-color: #f7f8fa;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .v-product-gallery-container {
            flex: none;
            height: auto;
            aspect-ratio: 3 / 4;
          }
        }

        .v-product-link-overlay {
          position: absolute;
          inset: 0;
          z-index: 4;
        }

        .v-product-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
          height: 100%;
        }
        .v-product-carousel::-webkit-scrollbar {
          display: none;
        }

        .v-product-carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px;
          box-sizing: border-box;
          background-color: #f7f8fa;
        }
        .v-product-carousel-slide:hover {
          background-color: #f7f8fa;
          opacity: 1;
        }

        .v-product-carousel-counter {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.4);
          background-color: transparent;
          letter-spacing: 0.05em;
          z-index: 5;
        }

        .v-product-carousel-indicator-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: transparent;
          z-index: 6;
          overflow: hidden;
        }

        .v-product-carousel-indicator-progress {
          height: 100%;
          background-color: rgba(0, 0, 0, 0.75);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
        }

        .amiri-product-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .amiri-product-img--top,
        .amiri-product-img--pants,
        .amiri-product-img--sneaker,
        .amiri-product-img--accessory {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .amiri-product-info {
          padding: 20px 24px 20px 40px;
          background-color: #f7f8fa;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          box-sizing: border-box;
          z-index: 5;
          width: 100%;
          text-decoration: none;
        }
        .amiri-product-info:hover {
          opacity: 1;
        }

        @media (max-width: 767px) {
          .amiri-product-info {
            background-color: #ffffff;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
            padding: 12px 16px;
            flex-grow: 1;
          }
        }

        .amiri-product-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          text-transform: lowercase;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          text-align: left;
        }

        @media (max-width: 767px) {
          .amiri-product-name {
            font-size: 9.5px;
            white-space: normal;
            line-height: 1.35;
          }
        }

        .amiri-product-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: right;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .amiri-product-price {
            text-align: left;
            color: rgba(0,0,0,0.65);
            font-size: 9.5px;
          }
        }

        /* LIFESTYLE CELLS INTERIOR */
        .amiri-lifestyle-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* FLOATING MONOGRAM BADGE */
        .amiri-monogram-badge {
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
          color: #ffffff;
          font-family: var(--font-brand);
          font-size: 18px;
          z-index: 999;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .amiri-monogram-badge:hover {
          transform: scale(1.05);
        }

        /* REFINE DRAWER DRAWER OVERLAYS REMOVED, INLINE DROPDOWN PANELS ACTIVATED */

        .v-filters-panel {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: calc(100vh - 120px);
          background-color: transparent;
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box;
          box-shadow: none;
          animation: vSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .v-filters-mobile-header {
          display: none;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background-color: #ffffff;
          border-bottom: none;
          position: sticky;
          top: 0;
          z-index: 10;
          height: 64px;
          box-sizing: border-box;
          width: 100%;
        }

        .v-filters-mobile-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000000;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .v-filters-mobile-header-reset {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          padding: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .v-filters-mobile-close {
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v-filters-scrollable-content {
          position: relative;
          background-color: #ffffff;
          height: calc(42vh + 80px);
          overflow: visible;
          padding: 24px 24px 40px 40px;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          width: 100%;
        }

        .v-filters-blur-overlay {
          width: 100%;
          flex: 1;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
        }

        .v-filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 165px);
          gap: 28px;
          width: 100%;
        }

        .v-filter-col-header {
          background: none;
          border: none;
          display: block;
          width: 100%;
          text-align: left;
          padding: 0;
          cursor: default;
          pointer-events: none;
        }

        .v-filter-col-arrow {
          display: none;
        }

        .v-filter-options-wrapper {
          display: block !important;
          max-height: none !important;
          opacity: 1 !important;
          overflow: visible !important;
        }

        .v-filter-options-scrollable-container {
          position: relative;
          width: fit-content;
          min-width: 80px;
        }

         .v-filter-options-scroll {
          max-height: 42vh;
          overflow-y: auto;
          padding-bottom: 24px;
          padding-right: 16px;
          box-sizing: border-box;
        }

        .v-filter-options-scroll::-webkit-scrollbar {
          width: 1px;
        }

        .v-filter-options-scroll::-webkit-scrollbar-track {
          background: transparent;
          transition: background-color 0.2s ease;
        }

        .v-filter-options-scroll::-webkit-scrollbar-thumb {
          background-color: transparent;
          transition: background-color 0.2s ease;
        }

        .v-filter-col:hover .v-filter-options-scroll::-webkit-scrollbar-track {
          background: #eaeaea;
        }

        .v-filter-col:hover .v-filter-options-scroll::-webkit-scrollbar-thumb {
          background-color: #000000;
        }

        .v-filter-options-scroll::-webkit-scrollbar-button {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
        }

        .v-filter-options-blur {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff);
          pointer-events: none;
          z-index: 2;
        }

        .v-filters-mobile-footer {
          display: none;
        }

        .v-filters-desktop-inline-buttons {
          position: absolute;
          right: 24px;
          top: calc(42vh + 8px);
          display: flex;
          gap: 12px;
          width: 340px;
          box-sizing: border-box;
        }

        .v-filters-desktop-inline-buttons .v-filters-mobile-btn-reset {
          height: 36px;
          font-size: 11px;
          flex: 1;
          box-sizing: border-box;
        }

        .v-filters-desktop-inline-buttons .v-filters-mobile-btn-apply {
          height: 36px;
          font-size: 11px;
          flex: 1.2;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .v-filters-desktop-inline-buttons {
            display: none !important;
          }
        }

        .v-filters-mobile-btn-reset {
          background-color: #ffffff;
          border: 1px solid #cccccc;
          color: #555555;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          text-transform: none;
          letter-spacing: 0.05em;
          height: 48px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0;
          box-sizing: border-box;
          transition: border-color 0.3s, color 0.3s;
        }
        .v-filters-mobile-btn-reset:hover {
          border-color: #888888;
          color: #000000;
        }

        .v-filters-mobile-btn-apply {
          background-color: #767676;
          border: 1px solid #767676;
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          text-transform: none;
          letter-spacing: 0.05em;
          height: 48px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0;
          box-sizing: border-box;
          transition: background-color 0.3s;
        }
        .v-filters-mobile-btn-apply:hover {
          background-color: #555555;
          border-color: #555555;
        }

        .v-plp-mobile-header {
          display: none;
        }
        .v-plp-desktop-header {
          display: flex;
        }

        .v-filters-desktop-view {
          display: block;
          width: 100%;
          height: 100%;
        }
        .v-filters-mobile-view {
          display: none;
        }

        @media (max-width: 767px) {
          .v-filters-desktop-view {
            display: none !important;
          }
          .v-filters-mobile-view {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            position: relative;
            box-sizing: border-box;
          }

          /* Mobile Slider viewport and track */
          .v-filters-mobile-slider-viewport {
            width: 100%;
            overflow: hidden;
            flex: 1;
            position: relative;
            background-color: #ffffff;
          }

          .v-filters-mobile-slider-track {
            width: 200%;
            height: 100%;
            display: flex;
            transition: transform 0.45s cubic-bezier(0.32, 0, 0.67, 0);
          }

          .v-filters-mobile-slider-track.slide-active {
            transform: translateX(-50%);
          }

          .v-filters-mobile-panel {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background-color: #ffffff;
          }

          .v-plp-header-row {
            display: flex !important;
          }

          .v-plp-mobile-header {
            display: none !important;
          }

          /* When filters are active (open or closing) on mobile */
          .v-plp-sticky-header.filters-active .v-plp-header-row {
            display: none !important;
          }

          .v-plp-sticky-header.filters-active .v-plp-mobile-header {
            display: flex !important;
            flex-direction: column;
            width: 100%;
            background-color: #ffffff;
            box-sizing: border-box;
            position: relative;
            z-index: 10000;
          }

          .v-plp-mobile-row-1 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px 8px 20px;
            height: 44px;
            box-sizing: border-box;
            width: 100%;
            background-color: #ffffff;
          }

          .v-plp-mobile-row-2 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 20px;
            height: 52px;
            box-sizing: border-box;
            width: 100%;
            background-color: #ffffff;
            border-top: 1px solid #eaeaea;
            border-bottom: 1px solid #eaeaea;
          }

          .v-plp-mobile-breadcrumbs {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-primary), sans-serif;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #000000;
          }

          .v-plp-mb-link {
            background: none;
            border: none;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            text-transform: inherit;
            letter-spacing: inherit;
            color: rgba(0, 0, 0, 0.4);
            cursor: pointer;
            padding: 0;
            transition: color 0.25s ease;
          }

          .v-plp-mb-link.active,
          .v-plp-mb-text.active {
            color: #000000;
          }

          .v-plp-mb-separator {
            color: rgba(0, 0, 0, 0.25);
            font-weight: 300;
          }

          .v-plp-mobile-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            font-weight: 300;
            color: #000000;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
          }

          .v-filters-panel {
            position: fixed !important;
            top: 96px !important; /* height of Row 1 & Row 2 static headers combined */
            left: 0 !important;
            width: 100vw !important;
            height: calc(100vh - 96px) !important;
            background-color: #ffffff !important;
            z-index: 9999 !important;
            animation: slideInMobile 0.45s cubic-bezier(0.32, 0, 0.67, 0) forwards;
          }

          .v-filters-panel.closing {
            animation: slideOutMobile 0.45s cubic-bezier(0.32, 0, 0.67, 0) forwards;
          }

          /* Row 2: Title and Sort Trigger / Back Button */
          .v-filters-mobile-row-2 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 20px 16px 20px;
            box-sizing: border-box;
            width: 100%;
            background-color: #ffffff;
          }

          .v-filters-mobile-section-title {
            font-family: var(--font-primary), sans-serif;
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #000000;
          }

          .v-filters-mobile-sort-trigger {
            background: none;
            border: none;
            font-family: var(--font-primary), sans-serif;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #000000;
            text-decoration: underline;
            cursor: pointer;
            padding: 0;
          }

          .v-filters-mobile-back-btn {
            background: none;
            border: none;
            font-family: var(--font-primary), sans-serif;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #000000;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .v-filters-mobile-row-back {
            display: flex;
            align-items: center;
            padding: 8px 20px 16px 20px;
            box-sizing: border-box;
            width: 100%;
            background-color: #ffffff;
          }

          /* Main Menu categories list */
          .v-filters-mobile-menu-list {
            display: flex;
            flex-direction: column;
            padding: 0 20px;
            flex: 1;
            overflow-y: auto;
          }

          .v-filters-mobile-menu-item {
            background: none;
            border: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            width: 100%;
            cursor: pointer;
            font-family: var(--font-primary), sans-serif;
            font-size: 12px;
            text-transform: capitalize;
            letter-spacing: 0.05em;
            color: #000000;
          }

          .v-filters-mobile-chevron {
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.4);
          }

          /* Options Submenu List */
          .v-filters-mobile-submenu-options {
            display: flex;
            flex-direction: column;
            padding: 0 20px;
            flex: 1;
            overflow-y: auto;
            gap: 16px;
          }

          .v-filters-mobile-submenu-options .v-filter-option {
            display: flex;
            align-items: center;
            gap: 12px;
            background: none;
            border: none;
            padding: 8px 0;
            width: 100%;
            text-align: left;
            font-family: var(--font-primary), sans-serif;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            letter-spacing: 0.05em;
            cursor: pointer;
          }

          .v-filters-mobile-submenu-options .v-filter-option.active {
            color: #000000;
            font-weight: 600;
          }

          .v-filters-mobile-submenu-options .v-filter-dot {
            width: 10px;
            height: 10px;
            display: inline-block;
          }

          /* Mobile Sticky Footer */
          .v-filters-mobile-action-footer {
            display: flex;
            gap: 12px;
            padding: 16px 20px;
            background-color: #ffffff;
            box-sizing: border-box;
            width: 100%;
            z-index: 10;
          }

          .v-filters-mobile-action-footer .v-filters-mobile-btn-reset {
            background-color: #ffffff;
            border: 1px solid #cccccc;
            color: #555555;
            font-family: var(--font-primary), sans-serif;
            font-size: 11px;
            text-transform: none;
            letter-spacing: 0.05em;
            height: 44px;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 0;
            box-sizing: border-box;
            padding: 0;
          }

          .v-filters-mobile-action-footer .v-filters-mobile-btn-apply {
            background-color: #000000;
            border: 1px solid #000000;
            color: #ffffff;
            font-family: var(--font-primary), sans-serif;
            font-size: 11px;
            text-transform: none;
            letter-spacing: 0.05em;
            height: 44px;
            flex: 1.2;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 0;
            box-sizing: border-box;
            padding: 0;
          }
        }

        @keyframes vSlideDown {
          from { 
            transform: translateY(-15px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }

        .v-filter-col {
          display: flex;
          flex-direction: column;
        }

        .v-filter-col-title {
          display: block;
          font-family: var(--font-primary), sans-serif;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
          letter-spacing: 0.05em;
          color: #000000;
          margin-bottom: 40px;
        }

        .v-filter-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .v-filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          color: rgba(0, 0, 0, 0.55);
          cursor: pointer;
          padding: 3px 0;
          text-align: left;
          transition: color 0.25s ease;
          outline: none;
          text-transform: capitalize;
        }
        .v-filter-option:hover, .v-filter-option.active {
          color: #000000;
        }
        .v-filter-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          display: inline-block;
          flex-shrink: 0;
        }
        .v-filter-option-close {
          font-size: 18px;
          color: rgba(0, 0, 0, 0.4);
          margin-left: 9px;
          display: inline-flex;
          align-items: center;
          line-height: 1;
          font-weight: 300;
        }

        .v-sort-dropdown {
          position: absolute;
          right: 40px;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          animation: vSlideDown 0.25s ease forwards;
          border-radius: 0;
        }
        @media (max-width: 767px) {
          .v-sort-dropdown {
            right: 20px;
          }
        }
        .v-sort-option {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 11.5px;
          color: rgba(0, 0, 0, 0.55);
          letter-spacing: 0.05em;
          cursor: pointer;
          text-align: left;
          padding: 4px 0;
          transition: color 0.25s;
          outline: none;
          text-transform: none;
          display: flex;
          align-items: center;
        }
        .v-sort-checkmark-wrapper {
          display: inline-block;
          width: 14px;
          margin-right: 8px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .v-sort-option:hover, .v-sort-option.active {
          color: #000000;
        }

        /* WISHLIST STAR BUTTON */
        .v-wishlist-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          z-index: 10;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.25s ease, transform 0.2s ease;
          outline: none;
        }

        .v-wishlist-btn:hover {
          transform: scale(1.1);
        }

        @media (max-width: 767px) {
          .v-wishlist-btn {
            top: 10px;
            right: 10px;
            padding: 4px;
          }
          .v-wishlist-btn svg {
            width: 12px;
            height: 12px;
          }
        }

        @media (min-width: 1024px) {
          .v-wishlist-btn {
            opacity: 0;
            pointer-events: none;
          }
          .amiri-grid-item:hover .v-wishlist-btn {
            opacity: 1;
            pointer-events: all;
          }
        }
        @keyframes slideInMobile {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOutMobile {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}
