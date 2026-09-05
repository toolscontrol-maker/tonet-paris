import { Product } from '@/lib/shopify';

export interface ManualProductConfig extends Product {
  isManual: boolean;
  contactForAvailability: boolean;
  stock?: number;
  contactOptions?: {
    whatsapp?: string;
    instagram?: string;
  };
}

export const MANUAL_PRODUCTS: ManualProductConfig[] = [
  {
    id: 'manual-acne-studios-sprayed-1996-logo-t-shirt',
    handle: 'acne-studios-sprayed-1996-logo-t-shirt',
    title: 'Acne Studios Sprayed 1996 logo t-shirt',
    description: 'Acne Studios faded charcoal long-sleeve garment featuring the iconic Stockholm 1996 stencil sprayed logo across the chest. Crafted in relaxed proportions with fine vintage wash treatment and ribbed trims.',
    tags: ['t-shirt', 'tops', 'acne studios', 'men', 'him', 'editorial', 'vintage'],
    createdAt: new Date().toISOString(),
    price: 280.0,
    currencyCode: 'EUR',
    imageUrl: '/products/acne-studios-sprayed-1996-logo-t-shirt-1.webp',
    images: [
      '/products/acne-studios-sprayed-1996-logo-t-shirt-1.webp',
      '/products/acne-studios-sprayed-1996-logo-t-shirt-2.webp',
      '/products/acne-studios-sprayed-1996-logo-t-shirt-3.webp'
    ],
    variants: [
      {
        id: 'var-acne-studios-1996-m',
        title: 'M',
        availableForSale: true,
        price: { amount: '280.00', currencyCode: 'EUR' },
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Charcoal' }
        ],
      }
    ],
    collectionHandles: ['all', 'men', 't-shirts'],
    isManual: true,
    contactForAvailability: true,
    stock: 2,
    contactOptions: {
      whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '+34600000000',
      instagram: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || 'tonetparis'
    }
  },
  {
    id: 'manual-acne-studios-sprayed-1996-logo-t-shirt-pink',
    handle: 'acne-studios-sprayed-1996-logo-t-shirt-pink',
    title: 'Acne Studios Sprayed 1996 logo t-shirt',
    description: 'Acne Studios faded pink long-sleeve garment featuring the iconic Stockholm 1996 stencil sprayed logo across the chest. Crafted in relaxed proportions with fine vintage wash treatment and ribbed trims.',
    tags: ['t-shirt', 'tops', 'acne studios', 'men', 'him', 'editorial', 'vintage', 'pink'],
    createdAt: new Date().toISOString(),
    price: 280.0,
    currencyCode: 'EUR',
    imageUrl: '/products/acne-studios-sprayed-1996-logo-t-shirt-pink-1.webp',
    images: [
      '/products/acne-studios-sprayed-1996-logo-t-shirt-pink-1.webp',
      '/products/acne-studios-sprayed-1996-logo-t-shirt-pink-2.webp',
      '/products/acne-studios-sprayed-1996-logo-t-shirt-pink-3.webp'
    ],
    variants: [
      {
        id: 'var-acne-studios-1996-pink-m',
        title: 'M',
        availableForSale: true,
        price: { amount: '280.00', currencyCode: 'EUR' },
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Pink' }
        ],
      }
    ],
    collectionHandles: ['all', 'men', 't-shirts'],
    isManual: true,
    contactForAvailability: true,
    stock: 1,
    contactOptions: {
      whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '+34600000000',
      instagram: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || 'tonetparis'
    }
  },
  {
    id: 'manual-acne-studios-sprayed-1996-short-sleeve-t-shirt',
    handle: 'acne-studios-sprayed-1996-short-sleeve-t-shirt',
    title: 'Acne Studios Sprayed 1996 short sleeve t-shirt',
    description: 'Acne Studios faded black short-sleeve t-shirt featuring the iconic Stockholm 1996 stencil sprayed logo across the chest. Crafted in relaxed proportions with fine vintage wash treatment and ribbed crewneck.',
    tags: ['t-shirt', 'tops', 'acne studios', 'men', 'him', 'editorial', 'vintage', 'black', 'short sleeve'],
    createdAt: new Date().toISOString(),
    price: 280.0,
    currencyCode: 'EUR',
    imageUrl: '/products/acne-studios-sprayed-1996-short-sleeve-t-shirt-1.webp',
    images: [
      '/products/acne-studios-sprayed-1996-short-sleeve-t-shirt-1.webp',
      '/products/acne-studios-sprayed-1996-short-sleeve-t-shirt-2.webp',
      '/products/acne-studios-sprayed-1996-short-sleeve-t-shirt-3.webp'
    ],
    variants: [
      {
        id: 'var-acne-studios-1996-ss-black-m',
        title: 'M',
        availableForSale: true,
        price: { amount: '280.00', currencyCode: 'EUR' },
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Black' }
        ],
      }
    ],
    collectionHandles: ['all', 'men', 't-shirts'],
    isManual: true,
    contactForAvailability: true,
    stock: 1,
    contactOptions: {
      whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '+34600000000',
      instagram: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || 'tonetparis'
    }
  }
];

export function getManualProducts(): Product[] {
  return MANUAL_PRODUCTS;
}

export function getManualProduct(handle: string): Product | null {
  const cleanHandle = handle.split('?')[0].toLowerCase();
  const found = MANUAL_PRODUCTS.find(p => p.handle.toLowerCase() === cleanHandle);
  return found || null;
}
