'use client'

import { Home, Search } from 'lucide-react'
import { ShoppingCartSheet } from '@/components/shopping-cart-sheet'
import { WishlistSheet } from '@/components/wishlist-sheet'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Logo from '@/components/logo'

export const Header = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }

    router.push(`/?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    router.push(`/?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="flex flex-row h-16 items-center justify-between px-4 md:px-6 py-3 md:py-0 gap-4 bg-primary/30">
        <div className="flex w-full items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="shrink-0 cursor-pointer"
            aria-label="Ir a inicio"
          >
            <Logo
              className="h-28 w-28   md:h-32 md:w-32 text-[#c90606]"
              aria-label="Lea Catalog logo"
            />
          </button>


        </div>

        <div className="flex items-center gap-2 md:gap-4 md:ml-auto">
          <div className="hidden md:flex relative flex-1 items-center w-md bg-white">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 pr-9 border border-primary/30"
              value={searchQuery}
              onChange={(e) => {
                const newValue = e.target.value
                setSearchQuery(newValue)
                if (newValue === '' && searchParams.get('search')) {
                  clearSearch()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>
          <WishlistSheet />
          <ShoppingCartSheet />
        </div>
      </div>
    </header>
  )
}
