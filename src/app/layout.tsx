import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocaleSelectorModal from "@/components/LocaleSelectorModal";

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import SearchDrawer from "@/components/SearchDrawer";
import MenuDrawer from "@/components/MenuDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tonet Studios",
  description: "Tonet Studios — Online Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialLang = 'en';
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('site_locale');
    if (localeCookie?.value) {
      const parsed = JSON.parse(decodeURIComponent(localeCookie.value));
      if (parsed.language) initialLang = parsed.language;
    }
  } catch { /* cookie not available or invalid */ }

  return (
    <html lang={initialLang} className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider initialLanguage={initialLang}>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <Navbar />
                <CartDrawer />
                <SearchDrawer />
                <MenuDrawer />
                <LocaleSelectorModal />
                <main>{children}</main>
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
