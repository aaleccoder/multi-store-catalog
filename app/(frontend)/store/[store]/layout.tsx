import React from "react";
import "@/app/globals.css";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { Toaster } from "@/components/ui/sonner";
import { Outfit, Lobster } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { StoreTheme } from "@/lib/theme";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lobster",
});

export const metadata = {
  description: "Catalogo de Productos",
  title: "Una Ganga",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;

  const storeData = await prisma.store.findFirst({
    where: { slug: store, isActive: true },
  });

  if (!storeData) {
    notFound();
  }

  const storeTheme = (storeData.theme ?? null) as unknown as StoreTheme | null;

  return (
    <StoreThemeProvider theme={storeTheme ?? undefined}>
      <div
        className={`${outfit.variable} ${lobster.variable} h-full flex flex-col w-full`}
      >
        <CartProvider storeId={store}>
          <WishlistProvider storeId={store}>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </div>
    </StoreThemeProvider>
  );
}
