import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FindStoreConditional from '@/components/FindStoreConditional';

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import MenuDrawer from "@/components/MenuDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TONET PARIS",
  description: "TONET PARIS — Online Store",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <div style={{
                  width: '100%',
                  background: '#000',
                  borderBottom: 'none',
                  textAlign: 'center',
                  padding: '3px 16px',
                  fontSize: '10px',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: '#fff',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 600,
                }}>
                  Free shipping to Spain on all orders
                </div>
                <Navbar />
                <CartDrawer />
                <MenuDrawer />
                <main>{children}</main>
                <FindStoreConditional />
                <Footer />
              </WishlistProvider>
              </AuthProvider>
            </CartProvider>
          </UIProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
