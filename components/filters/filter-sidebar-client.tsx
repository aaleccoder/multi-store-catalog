'use client'

import { X } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Currency } from '@/lib/currency-client'

export interface Filter {
  name: string
  slug: string
  type: string
  options?: Array<{ label: string; value: string }>
  unit?: string
}

type FilterValue = string | string[] | { min: number; max: number } | boolean | undefined

export interface FilterSidebarClientProps {
  activeFilters: Filter[]
  categorySlug?: string
  subcategorySlug?: string
  currencies?: Currency[]
}

export const FilterSidebarClient = ({
  activeFilters,
  categorySlug,
  subcategorySlug,
  currencies = [],
}: FilterSidebarClientProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initialize filter state from URL params
  const [filterState, setFilterState] = useState<Record<string, FilterValue>>(() => {
    const state: Record<string, FilterValue> = {}
    activeFilters.forEach((filter) => {
      const paramValue = searchParams.get(filter.slug)
      if (paramValue) {
        if (filter.type === 'multiselect') {
          state[filter.slug] = paramValue.split(',')
        } else if (filter.type === 'range') {
          const [min, max] = paramValue.split('-').map(Number)
          state[filter.slug] = { min, max }
        } else {
          state[filter.slug] = paramValue
        }
      }
    })
    return state
  })

  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    searchParams.get('currency') || '',
  )

  // Allow empty / arbitrary price values. Store min/max as numbers or undefined.
  const [priceRange, setPriceRange] = useState<[number, number] | null>(() => {
    const priceParam = searchParams.get('price')
    if (priceParam) {
      const [minStr, maxStr] = priceParam.split('-')
      const min = minStr !== '' ? parseFloat(minStr) : undefined
      const max = maxStr !== '' ? parseFloat(maxStr) : undefined
      if (min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max)) return [min, max]
    }
    return null
  })

  const [priceMin, setPriceMin] = useState<number | undefined>(() => {
    const priceParam = searchParams.get('price')
    if (priceParam) {
      const [minStr] = priceParam.split('-')
      const min = minStr !== '' ? parseFloat(minStr) : undefined
      return isNaN(min as number) ? undefined : (min as number | undefined)
    }
    return undefined
  })

  const [priceMax, setPriceMax] = useState<number | undefined>(() => {
    const priceParam = searchParams.get('price')
    if (priceParam) {
      const [, maxStr] = priceParam.split('-')
      const max = maxStr !== '' ? parseFloat(maxStr) : undefined
      return isNaN(max as number) ? undefined : (max as number | undefined)
    }
    return undefined
  })

  const [onlyInStock, setOnlyInStock] = useState(searchParams.get('inStock') === 'true')
  const [onlyFeatured, setOnlyFeatured] = useState(searchParams.get('featured') === 'true')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt')

  const handleMultiselectChange = (filterSlug: string, value: string) => {
    setFilterState((prev) => {
      const currentValues = (prev[filterSlug] as string[]) || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [filterSlug]: newValues.length > 0 ? newValues : undefined,
      }
    })
  }

  const handleRangeChange = (filterSlug: string, values: number[]) => {
    setFilterState((prev) => ({
      ...prev,
      [filterSlug]: { min: values[0], max: values[1] } as { min: number; max: number },
    }))
  }

  const handleBooleanChange = (filterSlug: string) => {
    setFilterState((prev) => ({
      ...prev,
      [filterSlug]: !prev[filterSlug],
    }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    // Add category and subcategory
    if (categorySlug) params.set('category', categorySlug)
    if (subcategorySlug) params.set('subcategory', subcategorySlug)

    // Preserve search query from URL if it exists
    const searchQuery = searchParams.get('search')
    if (searchQuery) params.set('search', searchQuery)

    // Add sort parameter
    if (sortBy && sortBy !== '-createdAt') {
      params.set('sort', sortBy)
    }

    // Add price range
    // Add price if either boundary is set. Use empty string for missing side.
    if (priceMin !== undefined || priceMax !== undefined) {
      const minStr = priceMin !== undefined ? String(priceMin) : ''
      const maxStr = priceMax !== undefined ? String(priceMax) : ''
      params.set('price', `${minStr}-${maxStr}`)
    }

    // Add stock and featured filters
    if (onlyInStock) params.set('inStock', 'true')
    if (onlyFeatured) params.set('featured', 'true')

    // Add currency filter
    if (selectedCurrency) params.set('currency', selectedCurrency)

    // Add custom filters
    Object.entries(filterState).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','))
        }
      } else if (typeof value === 'object' && 'min' in value && 'max' in value) {
        params.set(key, `${value.min}-${value.max}`)
      } else if (value === true) {
        params.set(key, 'true')
      } else if (typeof value === 'string') {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    // Reset all state to defaults
    setFilterState({})
    setPriceRange(null)
    setPriceMin(undefined)
    setPriceMax(undefined)
    setOnlyInStock(false)
    setOnlyFeatured(false)
    setSortBy('-createdAt')
    setSelectedCurrency('')

    // Navigate to URL with only category/subcategory and search (if exists)
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (subcategorySlug) params.set('subcategory', subcategorySlug)
    const searchQuery = searchParams.get('search')
    if (searchQuery) params.set('search', searchQuery)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasActiveFilters =
    priceMin !== undefined ||
    priceMax !== undefined ||
    onlyInStock ||
    onlyFeatured ||
    selectedCurrency !== '' ||
    (sortBy && sortBy !== '-createdAt') ||
    Object.keys(filterState).some((key) => {
      const value = filterState[key]
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null
    })

  // Sync slider with input fields
  const handleSliderChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
    setPriceMin(values[0])
    setPriceMax(values[1])
  }

  const handleMinInputChange = (value: string) => {
    // allow blank to unset
    if (value.trim() === '') {
      setPriceMin(undefined)
      setPriceRange(priceMax !== undefined ? [0, priceMax] : null)
      return
    }

    const num = parseFloat(value)
    if (isNaN(num)) return
    setPriceMin(num)
    if (priceMax !== undefined) setPriceRange([num, priceMax])
  }

  const handleMaxInputChange = (value: string) => {
    if (value.trim() === '') {
      setPriceMax(undefined)
      setPriceRange(priceMin !== undefined ? [priceMin, 0] : null)
      return
    }

    const num = parseFloat(value)
    if (isNaN(num)) return
    setPriceMax(num)
    if (priceMin !== undefined) setPriceRange([priceMin, num])
  }

  return (
    <div className="space-y-6">
      {/* Sorting */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Ordenar por</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-white dark:bg-background text-foreground">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Más recientes</SelectItem>
            <SelectItem value="createdAt">Más antiguos</SelectItem>
            <SelectItem value="name">Nombre (A-Z)</SelectItem>
            <SelectItem value="-name">Nombre (Z-A)</SelectItem>
            <SelectItem value="price">Precio (menor a mayor)</SelectItem>
            <SelectItem value="-price">Precio (mayor a menor)</SelectItem>
            <SelectItem value="-featured">Destacados primero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Dynamic Filters */}
      {activeFilters.map((filter) => {
        if (filter.type === 'multiselect' || filter.type === 'select') {
          return (
            <div key={filter.slug} className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                {filter.name}
              </h3>
              <div className="space-y-2">
                {filter.options?.map((option) => {
                  const isChecked = Array.isArray(filterState[filter.slug]) && (filterState[filter.slug] as string[]).includes(option.value)
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${filter.slug}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={() => handleMultiselectChange(filter.slug, option.value)}
                      />
                      <label
                        htmlFor={`${filter.slug}-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  )
                })}
              </div>
              <Separator />
            </div>
          )
        }

        if (filter.type === 'range') {
          const rangeValue = (filterState[filter.slug] as { min: number; max: number }) || { min: 0, max: 100 }
          return (
            <div key={filter.slug} className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                {filter.name} {filter.unit && `(${filter.unit})`}
              </h3>
              <div className="space-y-4 px-1">
                <Slider
                  value={[rangeValue.min, rangeValue.max]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={(values) => handleRangeChange(filter.slug, values)}
                />
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>
                    {rangeValue.min} {filter.unit}
                  </span>
                  <span>
                    {rangeValue.max} {filter.unit}
                  </span>
                </div>
              </div>
              <Separator />
            </div>
          )
        }

        if (filter.type === 'boolean') {
          const isChecked = !!filterState[filter.slug]
          return (
            <div key={filter.slug} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={filter.slug}
                  checked={isChecked}
                  onCheckedChange={() => handleBooleanChange(filter.slug)}
                />
                <label
                  htmlFor={filter.slug}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {filter.name}
                </label>
              </div>
              <Separator />
            </div>
          )
        }

        return null
      })}

      {/* Currency Filter */}
      {currencies.length > 0 && (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Moneda</h3>
            <Select
              value={selectedCurrency || 'all'}
              onValueChange={(value) => setSelectedCurrency(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="bg-white dark:bg-background text-foreground">
                <SelectValue placeholder="Todas las monedas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las monedas</SelectItem>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id.toString()}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Precio</h3>
        <div className="space-y-4 px-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor="priceMin" className="text-xs text-muted-foreground mb-1 block">
                Mínimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="priceMin"
                  type="number"
                  value={priceMin ?? ''}
                  onChange={(e) => handleMinInputChange(e.target.value)}
                  className="pl-6 bg-white dark:bg-background"
                />
              </div>
            </div>
            <span className="text-muted-foreground pt-5">-</span>
            <div className="flex-1">
              <label htmlFor="priceMax" className="text-xs text-muted-foreground mb-1 block">
                Máximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="priceMax"
                  type="number"
                  value={priceMax ?? ''}
                  onChange={(e) => handleMaxInputChange(e.target.value)}
                  className="pl-6 bg-white dark:bg-background"
                />
              </div>
            </div>
          </div>

          {/* Price slider */}
          {priceRange && (
            <Slider
              value={priceRange}
              max={1000}
              step={10}
              className="w-full"
              onValueChange={handleSliderChange}
            />
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>${priceMin ?? 0}</span>
            <span>${priceMax ?? 1000}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Stock and Featured Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Mostrar solo</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
              Solo disponibles
            </label>
            <Switch
              id="inStock"
              checked={onlyInStock}
              onCheckedChange={(checked: boolean) => setOnlyInStock(checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
              Productos destacados
            </label>
            <Switch
              id="featured"
              checked={onlyFeatured}
              onCheckedChange={(checked: boolean) => setOnlyFeatured(checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Apply and Clear Buttons */}
      <div className="space-y-2 pt-2">
        <Button onClick={applyFilters} className="w-full font-semibold" size="lg">
          Aplicar Filtros
        </Button>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  )
}
