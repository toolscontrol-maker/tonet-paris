import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Jost, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import AccountDrawer from "@/components/AccountDrawer";
import MenuDrawer from "@/components/MenuDrawer";
import SearchDrawer from "@/components/SearchDrawer";
import CookieBanner from "@/components/CookieBanner";
import TransitionProvider from "@/components/TransitionProvider";
import LocaleSelectorModal from "@/components/LocaleSelectorModal";
import SupportWidget from "@/components/SupportWidget";
import WishlistToast from "@/components/WishlistToast";


const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "TONET TORRENTINNI",
  description: "TONET TORRENTINNI — Online Store",
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
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TransitionProvider>
        <LocaleProvider>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <AnnouncementBar />
                <Navbar />
                <CartDrawer />
                <AccountDrawer />
                <MenuDrawer />
                <SearchDrawer />
                <LocaleSelectorModal />
                <main>{children}</main>
                <Footer />
                <CookieBanner />
                <SupportWidget />
                <WishlistToast />
                <Analytics />
              </WishlistProvider>
              </AuthProvider>
            </CartProvider>
          </UIProvider>
        </LocaleProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
