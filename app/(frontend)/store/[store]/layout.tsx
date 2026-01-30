import React from "react";
import "@/app/globals.css";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { Toaster } from "@/components/ui/sonner";
import { Outfit, Lobster } from "next/font/google";
import { Footer } from "@/components/layout/footer";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lobster",
});

export const metadata = {
  description: "Lea, Catalogo de Productos",
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

  // Nested layouts must not render <html> / <body>; only the root layout should.
  return (
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
  );
}
