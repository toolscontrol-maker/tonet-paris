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
  isAccountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
  toggleAccount: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const openCart = () => {
    setIsCartOpen(true);
    setIsAccountOpen(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsAccountOpen(false);
    setIsCartOpen(false);
    setIsMenuOpen(false);
  };
  const closeSearch = () => setIsSearchOpen(false);

  const [menuSearchMode, setMenuSearchMode] = useState(false);

  const openMenu = () => {
    setIsMenuOpen(true);
    setIsAccountOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(false);
  };
  const closeMenu = () => { setIsMenuOpen(false); setMenuSearchMode(false); };
  const openMenuWithSearch = () => {
    setMenuSearchMode(true);
    setIsMenuOpen(true);
    setIsAccountOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(false);
  };
  const clearMenuSearchMode = () => setMenuSearchMode(false);

  const openAccount = () => {
    setIsAccountOpen(true);
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };
  const closeAccount = () => setIsAccountOpen(false);
  const toggleAccount = () => setIsAccountOpen((prev) => !prev);

  return (
    <UIContext.Provider value={{ 
      isCartOpen, openCart, closeCart, toggleCart, 
      isSearchOpen, openSearch, closeSearch, 
      isMenuOpen, openMenu, closeMenu, menuSearchMode, openMenuWithSearch, clearMenuSearchMode,
      isAccountOpen, openAccount, closeAccount, toggleAccount
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    return {
      isCartOpen: false, openCart: () => {}, closeCart: () => {}, toggleCart: () => {},
      isSearchOpen: false, openSearch: () => {}, closeSearch: () => {},
      isMenuOpen: false, openMenu: () => {}, closeMenu: () => {}, menuSearchMode: false, openMenuWithSearch: () => {}, clearMenuSearchMode: () => {},
      isAccountOpen: false, openAccount: () => {}, closeAccount: () => {}, toggleAccount: () => {}
    };
  }
  return context;
}
