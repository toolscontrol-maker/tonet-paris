'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export interface WishlistItem {
  handle: string;
  title: string;
  imageUrl: string;
  price: number;
  currencyCode: string;
  collectionTitle: string;
  addedAt?: number;
}

interface WishlistContextValue {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (handle: string) => boolean;
}

const STORAGE_KEY = 'tonet-archive';
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Initial load from local storage
  useEffect(() => {
    setItems(readStorage());
    setLoaded(true);
  }, []);

  // 2. Listen to Supabase Auth State Change to sync with metadata
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        // User logged in: fetch wishlist from metadata and merge with guest items
        const dbWishlist = user.user_metadata?.wishlist;
        if (Array.isArray(dbWishlist)) {
          setItems(prev => {
            const merged = [...dbWishlist];
            prev.forEach(guestItem => {
              if (!merged.some(dbItem => dbItem.handle === guestItem.handle)) {
                merged.push(guestItem);
              }
            });
            return merged;
          });
        }
      } else {
        // User logged out: restore guest local storage
        setItems(readStorage());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Write updates to storage / database
  useEffect(() => {
    if (loaded) {
      writeStorage(items);
      
      if (currentUser) {
        supabase.auth.updateUser({
          data: { wishlist: items }
        }).catch(err => console.error("Error saving wishlist to user metadata:", err));
      }
    }
  }, [items, loaded, currentUser]);

  const add = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.handle === item.handle)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
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
      return [...prev, { ...item, addedAt: Date.now() }];
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

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      items: [],
      add: () => {},
      remove: () => {},
      toggle: () => {},
      has: () => false,
    };
  }
  return ctx;
}
