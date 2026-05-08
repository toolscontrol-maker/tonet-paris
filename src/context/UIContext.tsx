"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  menuSearchMode: boolean;
  openMenuWithSearch: () => void;
  clearMenuSearchMode: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const [menuSearchMode, setMenuSearchMode] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => { setIsMenuOpen(false); setMenuSearchMode(false); };
  const openMenuWithSearch = () => { setMenuSearchMode(true); setIsMenuOpen(true); };
  const clearMenuSearchMode = () => setMenuSearchMode(false);

  return (
    <UIContext.Provider value={{ isCartOpen, openCart, closeCart, toggleCart, isSearchOpen, openSearch, closeSearch, isMenuOpen, openMenu, closeMenu, menuSearchMode, openMenuWithSearch, clearMenuSearchMode }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
