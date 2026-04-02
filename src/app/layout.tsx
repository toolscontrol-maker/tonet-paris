import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { UIProvider } from "@/context/UIContext";
import CartDrawer from "@/components/CartDrawer";
import SearchDrawer from "@/components/SearchDrawer";
import MenuDrawer from "@/components/MenuDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Art Gallery - Minimalist Store",
  description: "Exclusive collection of 3 fine artworks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body suppressHydrationWarning>
        <UIProvider>
          <Navbar />
          <CartDrawer />
          <SearchDrawer />
          <MenuDrawer />
          <main>{children}</main>
          <Footer />
        </UIProvider>
      </body>
    </html>
  );
}
