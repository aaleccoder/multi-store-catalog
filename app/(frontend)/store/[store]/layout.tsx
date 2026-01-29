import React from "react";
import "@/app/globals.css";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat, Lobster } from "next/font/google";
import { Footer } from "@/components/layout/footer";

const montserrat = Montserrat({ subsets: ["latin"] });
const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lobster",
});

export const metadata = {
  description: "Lea, Catalogo de Productos",
  title: "Lea Catalog",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`${montserrat.className} ${lobster.variable} h-full flex flex-col`}
      >
        <CartProvider storeId={store}>
          <WishlistProvider storeId={store}>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
