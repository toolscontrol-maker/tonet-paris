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

        {/* Counter of images */}
        {images.length > 1 && (
          <span className="v-product-carousel-counter">
            {activeIdx + 1}/{images.length}
          </span>
        )}

        {/* Horizontal Progress Indicator Bar at the bottom of the image */}
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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Committed Filters State (Controls the Grid)
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Temporary Filters State (Inside the Refine Drawer)
  const [tempSort, setTempSort] = useState<string>('featured');
  const [tempAvailability, setTempAvailability] = useState<string[]>([]);
  const [tempColors, setTempColors] = useState<string[]>([]);
  const [tempSizes, setTempSizes] = useState<string[]>([]);
  const [tempMaterials, setTempMaterials] = useState<string[]>([]);

  const [refineOpen, setRefineOpen] = useState(false);
  const [activeFilterAccordion, setActiveFilterAccordion] = useState<string | null>(null);

  // Dynamic filter options extraction
  const filterOptions = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const materials = new Set<string>();

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
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      materials: Array.from(materials).sort()
    };
  }, [collection.products]);

  // Open / Close Drawer Handling
  const openRefine = () => {
    setTempSort(selectedSort);
    setTempAvailability(selectedAvailability);
    setTempColors(selectedColors);
    setTempSizes(selectedSizes);
    setTempMaterials(selectedMaterials);
    setRefineOpen(true);
  };

  const applyFilters = () => {
    setSelectedSort(tempSort);
    setSelectedAvailability(tempAvailability);
    setSelectedColors(tempColors);
    setSelectedSizes(tempSizes);
    setSelectedMaterials(tempMaterials);
    setRefineOpen(false);
  };

  const clearFilters = () => {
    setTempSort('featured');
    setTempAvailability([]);
    setTempColors([]);
    setTempSizes([]);
    setTempMaterials([]);
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

    // 4. Material
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

    // 5. Sorting
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
  }, [collection.products, collection.handle, selectedSort, selectedAvailability, selectedColors, selectedSizes, selectedMaterials]);

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

    return result.length;
  }, [collection.products, tempAvailability, tempColors, tempSizes, tempMaterials]);

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
    let gender = "COLECCIONES";
    if (handleLower.includes("hombre") || handleLower.includes("men")) {
      gender = "HOMBRE";
    } else if (handleLower.includes("mujer") || handleLower.includes("women")) {
      gender = "MUJER";
    }
    
    return (
      <span className="v-breadcrumb">
        Inicio / {gender} / <span className="v-breadcrumb-current">{collection.title}</span> ({filteredAndSortedProducts.length})
      </span>
    );
  };

  return (
    <>
      <div className="amiri-collection-container">
        
        {/* STICKY HEADER BLOCK */}
        <div className="v-plp-sticky-header">
          {/* TOP BAR: Breadcrumbs & Filters/Sort triggers */}
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
                Filtra por {filtersOpen ? '−' : '+'}
              </button>
              <button 
                type="button" 
                className={`v-plp-trigger ${sortOpen ? 'active' : ''}`}
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setFiltersOpen(false);
                }}
              >
                Ordenar por {sortOpen ? '−' : '+'}
              </button>
            </div>
          </div>

          {/* EXPANDED INLINE FILTERS PANEL */}
          {filtersOpen && (
            <div className="v-filters-panel">
              <div className="v-filters-grid">
                
                {/* Column 1: Color */}
                {filterOptions.colors.length > 0 && (
                  <div className="v-filter-col">
                    <span className="v-filter-col-title">Color</span>
                    <div className="v-filter-options">
                      {filterOptions.colors.map(col => (
                        <button
                          key={col}
                          type="button"
                          className={`v-filter-option ${tempColors.includes(col) ? 'active' : ''}`}
                          onClick={() => toggleTempFilter(tempColors, setTempColors, col)}
                        >
                          <span className="v-filter-dot" style={{ backgroundColor: getHexColor(col) }} />
                          <span>{col}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 2: Talla (Sizes) */}
                {filterOptions.sizes.length > 0 && (
                  <div className="v-filter-col">
                    <span className="v-filter-col-title">Talla</span>
                    <div className="v-filter-options grid-sizes">
                      {filterOptions.sizes.map(sz => (
                        <button
                          key={sz}
                          type="button"
                          className={`v-filter-option size-box ${tempSizes.includes(sz) ? 'active' : ''}`}
                          onClick={() => toggleTempFilter(tempSizes, setTempSizes, sz)}
                        >
                          <span>{sz}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 3: Material */}
                {filterOptions.materials.length > 0 && (
                  <div className="v-filter-col">
                    <span className="v-filter-col-title">Material</span>
                    <div className="v-filter-options">
                      {filterOptions.materials.map(mat => (
                        <button
                          key={mat}
                          type="button"
                          className={`v-filter-option ${tempMaterials.includes(mat) ? 'active' : ''}`}
                          onClick={() => toggleTempFilter(tempMaterials, setTempMaterials, mat)}
                        >
                          <span>{mat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 4: Disponibilidad */}
                <div className="v-filter-col">
                  <span className="v-filter-col-title">Disponibilidad</span>
                  <div className="v-filter-options">
                    <button
                      type="button"
                      className={`v-filter-option ${tempAvailability.includes('in-stock') ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'in-stock')}
                    >
                      <span>En Stock</span>
                    </button>
                    <button
                      type="button"
                      className={`v-filter-option ${tempAvailability.includes('out-of-stock') ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'out-of-stock')}
                    >
                      <span>Agotado</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Footer buttons */}
              <div className="v-filters-footer">
                <button type="button" className="v-btn-reset" onClick={clearFilters}>
                  Restablecer todo
                </button>
                <button type="button" className="v-btn-apply" onClick={applyFilters}>
                  Aplicar cambios
                </button>
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
                Recomendado
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'price-asc' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('price-asc');
                  setSortOpen(false);
                }}
              >
                Precio: de menor a mayor
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'price-desc' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('price-desc');
                  setSortOpen(false);
                }}
              >
                Precio: de mayor a menor
              </button>
              <button
                type="button"
                className={`v-sort-option ${selectedSort === 'newest' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort('price-desc'); // uses newest/price-desc logic
                  setSortOpen(false);
                }}
              >
                Novedades
              </button>
            </div>
          )}
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



      {/* REFINE DRAWER OVERLAY */}
      <div 
        className={`amiri-refine-overlay ${refineOpen ? 'open' : ''}`}
        onClick={applyFilters}
      />

      {/* REFINE DRAWER */}
      <div className={`amiri-refine-drawer ${refineOpen ? 'open' : ''}`}>
        <div className="amiri-refine-header">
          <h2>REFINE</h2>
          <button 
            type="button" 
            className="amiri-refine-close" 
            onClick={applyFilters}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="amiri-refine-body">
          {/* SORT BY ACCORDION */}
          <div className="amiri-refine-section">
            <button 
              type="button"
              className="amiri-refine-section-header"
              onClick={() => toggleAccordion('sort')}
            >
              <span>SORT BY</span>
              {activeFilterAccordion === 'sort' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
            </button>
            {activeFilterAccordion === 'sort' && (
              <div className="amiri-refine-section-content">
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'featured' ? 'active' : ''}`}
                  onClick={() => setTempSort('featured')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>FEATURED</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'price-asc' ? 'active' : ''}`}
                  onClick={() => setTempSort('price-asc')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>PRICE: LOW TO HIGH</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempSort === 'price-desc' ? 'active' : ''}`}
                  onClick={() => setTempSort('price-desc')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>PRICE: HIGH TO LOW</span>
                </button>
              </div>
            )}
          </div>

          {/* AVAILABILITY ACCORDION */}
          <div className="amiri-refine-section">
            <button 
              type="button"
              className="amiri-refine-section-header"
              onClick={() => toggleAccordion('availability')}
            >
              <span>AVAILABILITY</span>
              {activeFilterAccordion === 'availability' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
            </button>
            {activeFilterAccordion === 'availability' && (
              <div className="amiri-refine-section-content">
                <button
                  type="button"
                  className={`amiri-refine-option ${tempAvailability.includes('in-stock') ? 'active' : ''}`}
                  onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'in-stock')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>IN STOCK</span>
                </button>
                <button
                  type="button"
                  className={`amiri-refine-option ${tempAvailability.includes('out-of-stock') ? 'active' : ''}`}
                  onClick={() => toggleTempFilter(tempAvailability, setTempAvailability, 'out-of-stock')}
                >
                  <span className="amiri-refine-option-check" />
                  <span>OUT OF STOCK</span>
                </button>
              </div>
            )}
          </div>

          {/* COLOR ACCORDION */}
          {filterOptions.colors.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('color')}
              >
                <span>COLOR</span>
                {activeFilterAccordion === 'color' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'color' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.colors.map(col => (
                    <button
                      key={col}
                      type="button"
                      className={`amiri-refine-option ${tempColors.includes(col) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempColors, setTempColors, col)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{col}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SIZE ACCORDION */}
          {filterOptions.sizes.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('size')}
              >
                <span>SIZE</span>
                {activeFilterAccordion === 'size' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'size' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.sizes.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      className={`amiri-refine-option ${tempSizes.includes(sz) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempSizes, setTempSizes, sz)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{sz}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MATERIAL ACCORDION */}
          {filterOptions.materials.length > 0 && (
            <div className="amiri-refine-section">
              <button 
                type="button"
                className="amiri-refine-section-header"
                onClick={() => toggleAccordion('material')}
              >
                <span>MATERIAL</span>
                {activeFilterAccordion === 'material' ? <Minus size={11} strokeWidth={1.5} /> : <Plus size={11} strokeWidth={1.5} />}
              </button>
              {activeFilterAccordion === 'material' && (
                <div className="amiri-refine-section-content">
                  {filterOptions.materials.map(mat => (
                    <button
                      key={mat}
                      type="button"
                      className={`amiri-refine-option ${tempMaterials.includes(mat) ? 'active' : ''}`}
                      onClick={() => toggleTempFilter(tempMaterials, setTempMaterials, mat)}
                    >
                      <span className="amiri-refine-option-check" />
                      <span>{mat}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* REFINE DRAWER FOOTER */}
        <div className="amiri-refine-footer">
          <button 
            type="button" 
            className="amiri-refine-btn-clear"
            onClick={clearFilters}
          >
            CLEAR ALL
          </button>
          <button 
            type="button" 
            className="amiri-refine-btn-view"
            onClick={applyFilters}
          >
            VIEW ({tempFilteredCount})
          </button>
        </div>
      </div>

      <style>{`
        /* AMIRI LUXURY EDITORIAL PLP STYLE REPLICA */
        .amiri-collection-container {
          padding-top: 64px;
          padding-bottom: 120px;
          background-color: #ffffff;
        }

        @media (max-width: 767px) {
          .amiri-collection-container {
            padding-top: 54px;
          }
        }

        .v-plp-sticky-header {
          position: sticky;
          top: 64px;
          z-index: 100;
          background-color: #ffffff;
        }

        @media (max-width: 767px) {
          .v-plp-sticky-header {
            top: 54px;
          }
        }

        /* TOP AREA */
        .v-plp-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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
          text-transform: lowercase;
        }

        .v-breadcrumb-current {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 12.5px;
          color: #000000;
          text-transform: lowercase;
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
          text-transform: lowercase;
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
          grid-template-columns: repeat(4, 1fr);
          gap: 2px; /* tight white separator lines */
          background-color: #ffffff; /* white grid lines */
          box-sizing: border-box;
          border-top: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        }
        @media (max-width: 1023px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
          }
        }
        @media (max-width: 767px) {
          .amiri-modular-grid {
            grid-template-columns: repeat(2, 1fr);
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
          background-color: #f4f3f1;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          aspect-ratio: 3 / 5;
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
          flex: 1;
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background-color: #f4f3f1;
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
          background-color: #f4f3f1;
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
          height: 1px;
          background-color: transparent;
          z-index: 5;
        }

        .v-product-carousel-indicator-progress {
          height: 100%;
          background-color: #000000;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
          padding: 20px 24px;
          background-color: #f4f3f1;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          box-sizing: border-box;
          z-index: 5;
          width: 100%;
          text-decoration: none;
        }

        .amiri-product-name {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 300;
          text-transform: lowercase;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          text-align: left;
        }

        .amiri-product-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: right;
          flex-shrink: 0;
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
          background-color: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 32px 40px;
          box-sizing: border-box;
          animation: vSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (max-width: 767px) {
          .v-filters-panel {
            padding: 24px 20px;
          }
        }

        @keyframes vSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .v-filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }
        @media (max-width: 767px) {
          .v-filters-grid {
            grid-template-columns: repeat(1, 1fr);
            gap: 24px;
          }
        }

        .v-filter-col {
          display: flex;
          flex-direction: column;
        }

        .v-filter-col-title {
          display: block;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #000000;
          margin-bottom: 16px;
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
          font-size: 11px;
          color: rgba(0, 0, 0, 0.55);
          cursor: pointer;
          padding: 2px 0;
          text-align: left;
          transition: color 0.25s ease;
          outline: none;
          text-transform: uppercase;
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

        .v-filter-options.grid-sizes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .v-filter-option.size-box {
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 0;
          font-size: 10px;
          transition: border-color 0.25s, color 0.25s, background-color 0.25s;
          text-transform: uppercase;
        }
        .v-filter-option.size-box.active {
          border-color: #000000;
          background: #000000;
          color: #ffffff;
        }

        .v-filters-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 24px;
        }

        .v-btn-reset {
          background: none;
          border: 1px solid #000000;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 24px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
        }

        .v-btn-apply {
          background: #000000;
          border: 1px solid #000000;
          color: #ffffff;
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 28px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
        }
        .v-btn-reset:hover, .v-btn-apply:hover {
          opacity: 0.85;
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
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
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
          font-size: 11px;
          color: rgba(0, 0, 0, 0.55);
          letter-spacing: 0.08em;
          cursor: pointer;
          text-align: left;
          padding: 4px 0;
          transition: color 0.25s;
          outline: none;
          text-transform: lowercase;
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
      `}</style>
    </>
  );
}
