import React from 'react'
import '../globals.css'
import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { Toaster } from '@/components/ui/sonner'
import { Montserrat, Lobster } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster' })

export const metadata = {
  description: "Wapa, Catalogo de Productos",
  title: 'Wapa Catalog',
}

import { Footer } from '@/components/layout/footer'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.className} ${lobster.variable} flex flex-col min-h-screen`}>
        <CartProvider>
          <WishlistProvider>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
