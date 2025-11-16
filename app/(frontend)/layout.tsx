import React from 'react'
import '../globals.css'
import { CartProvider } from '@/components/CartContext'
import { WishlistProvider } from '@/components/WishlistContext'
import { Toaster } from '@/components/ui/sonner'
import { Montserrat, Lobster } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster' })

export const metadata = {
  description: "Lea's Catalogo de Productos",
  title: 'Lea Catalog',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
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
