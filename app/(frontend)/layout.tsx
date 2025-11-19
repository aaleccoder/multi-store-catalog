import React from 'react'
import '../globals.css'
import { CartProvider } from '@/components/cart-context'
import { WishlistProvider } from '@/components/wishlist-context'
import { Toaster } from '@/components/ui/sonner'
import { Montserrat, Lobster } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster' })

export const metadata = {
  description: "Wapa, Catalogo de Productos",
  title: 'Wapa Catalog',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.className} ${lobster.variable}`}>
        <CartProvider>
          <WishlistProvider>
            <main>{children}</main>
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
