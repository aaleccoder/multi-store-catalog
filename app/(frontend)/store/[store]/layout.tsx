import React from 'react'
import '@/app/globals.css'
import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { Toaster } from '@/components/ui/sonner'
import { Montserrat, Lobster } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster' })

export const metadata = {
  description: "Lea, Catalogo de Productos",
  title: 'Lea Catalog',
}

import { Footer } from '@/components/layout/footer'

export default async function RootLayout(props: { children: React.ReactNode; params: { store: string } }) {
  const { children, params } = props
  const storeId = params.store

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className={`${montserrat.className} ${lobster.variable} h-full flex flex-col`}>
        <CartProvider storeId={storeId}>
          <WishlistProvider storeId={storeId}>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
