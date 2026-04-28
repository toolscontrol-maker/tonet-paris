'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface WishlistItem {
  handle: string;
  title: string;
  imageUrl: string;
  price: number;
  currencyCode: string;
  collectionTitle: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (handle: string) => boolean;
}

const STORAGE_KEY = 'wishlist';
const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(items);
  }, [items, loaded]);

  const add = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.handle === item.handle)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((handle: string) => {
    setItems(prev => prev.filter(i => i.handle !== handle));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.handle === item.handle)) {
        return prev.filter(i => i.handle !== item.handle);
      }
      return [...prev, item];
    });
  }, []);

  const has = useCallback((handle: string) => {
    return items.some(i => i.handle === handle);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
