'use client'

import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MobileFilterSheet } from './MobileFilterSheet'

interface SearchAndFiltersBarProps {
  filterContent?: React.ReactNode
}

export const SearchAndFiltersBar = ({ filterContent }: SearchAndFiltersBarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const currentSort = searchParams.get('sort') || '-createdAt'

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

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '-createdAt') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="md:hidden md:border-b md:border-border bg-background">
      <div className="container px-6 py-3">
        <div className="flex gap-2 items-center">
          {/* Search Input - Takes most space on mobile */}
          <div className="">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="mobile-search-input"
              placeholder="Buscar..."
              className="pl-9 pr-9 h-10 bg-white border border-black/30"
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
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 bg-primary backdrop-blur-md text-white"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Sort Dropdown */}
          <div className="md:hidden">
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="border h-10 !text-white">
                <ArrowUpDown className="h-4 w-4 text-black" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Más recientes</SelectItem>
                <SelectItem value="createdAt">Más antiguos</SelectItem>
                <SelectItem value="name">A-Z</SelectItem>
                <SelectItem value="-name">Z-A</SelectItem>
                <SelectItem value="pricing.price">$ Menor</SelectItem>
                <SelectItem value="-pricing.price">$ Mayor</SelectItem>
                <SelectItem value="-featured">Destacados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        {filterContent}
      </MobileFilterSheet>
    </div>
  )
}
