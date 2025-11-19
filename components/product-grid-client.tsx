'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from './product-card'
import { toNumber } from '@/lib/number'
import { ProductGridSkeleton } from './product-grid-skeleton'
import { useLoading } from './loading-context'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { trpc } from '@/trpc/client'

interface ProductGridClientProps {
  categorySlug?: string
  subcategorySlug?: string
}

export const ProductGridClient = ({ categorySlug, subcategorySlug }: ProductGridClientProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setIsLoading: setGlobalLoading } = useLoading()

  const currentSort = searchParams.get('sort') || '-createdAt'
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)

  // tRPC queries
  const categoryQuery = trpc.categories.list.useQuery(
    categorySlug ? { slug: categorySlug } : {},
    { enabled: !!categorySlug }
  )
  const selectedCategory = categoryQuery.data?.docs?.[0] || null

  const subcategoryQuery = trpc.subcategories.list.useQuery(
    subcategorySlug && selectedCategory ? { slug: subcategorySlug, categoryId: selectedCategory.id } : {},
    { enabled: !!subcategorySlug && !!selectedCategory }
  )
  const selectedSubcategory = subcategoryQuery.data?.docs?.[0] || null

  const productsQuery = trpc.products.list.useQuery({
    page: pageFromUrl.toString(),
    limit: '12',
    sort: currentSort,
    category: selectedCategory?.id,
    subcategory: selectedSubcategory?.id,
    inStock: searchParams.get('inStock') || undefined,
    featured: searchParams.get('featured') || undefined,
    search: searchParams.get('search') || undefined,
    currency: searchParams.get('currency') || undefined,
    price: searchParams.get('price') || undefined,
  })

  const products = productsQuery.data?.docs || []
  const totalPages = productsQuery.data?.totalPages || 1
  const totalDocs = productsQuery.data?.totalDocs || 0
  const currentPage = productsQuery.data?.page || 1

  const loading = categoryQuery.isLoading || subcategoryQuery.isLoading || productsQuery.isLoading

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '-createdAt') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    params.delete('page') // Reset to page 1 when sorting changes
    router.push(`/?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`/?${params.toString()}`)
    // Scroll to top of product grid
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <ProductGridSkeleton />
  }

  if (!products || products.length === 0) {
    return (
      <ScrollArea className="w-full h-full">
        <div className="p-6 md:p-8">
          {/* Breadcrumb */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Volver a todos los productos</span>
              </Link>
            </div>
          )}
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hay productos disponibles {categorySlug ? 'en esta categoría' : 'en este momento'}.
            </p>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea id="product-scroll-area" className="w-full h-full">
      <div className="p-4 md:p-8 mb-12">
        {/* Breadcrumb */}
        {(selectedCategory || selectedSubcategory) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <span className="text-muted-foreground">/</span>
              {selectedCategory && (
                <>
                  <Link
                    href={`/?category=${categorySlug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {selectedCategory.name}
                  </Link>
                  {selectedSubcategory && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground font-medium">
                        {selectedSubcategory.name}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Mostrando {products.length > 0 ? (currentPage - 1) * 12 + 1 : 0} -{' '}
              {Math.min(currentPage * 12, totalDocs)} de {totalDocs}{' '}
              {totalDocs === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          {/* Desktop Sort Dropdown */}
          <div className="hidden md:block">
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px] text-black">
                <SelectValue placeholder="Ordenar por" />
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product: any) => {
            const imageData = product.coverImages?.[0]
            const imageUrl = imageData?.url || ''

            // Prepare all images for carousel
            const images = product.coverImages
              ?.map((img: any) => ({
                url: img.url || '',
                alt: img.alt || product.name,
              }))
              .filter((img: any) => img.url) // Filter out images without URL

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.shortDescription || ''}
                price={
                  (() => {
                    const rawPrice =
                      product.prices?.find((p: any) => p.isDefault)?.saleAmount ??
                      product.prices?.find((p: any) => p.isDefault)?.amount ??
                      0

                    return toNumber(rawPrice)
                  })()
                }
                regularPrice={
                  (() => {
                    const raw = product.prices?.find((p: any) => p.isDefault)?.amount ?? 0
                    return toNumber(raw)
                  })()
                }
                currency={(product.prices?.find((p: any) => p.isDefault)?.currency ?? null) as any}
                image={imageUrl}
                imageAlt={imageData?.alt || product.name}
                images={images}
                slug={product.slug}
                featured={product.featured || false}
                inStock={product.inStock || false}
                unit={product.specifications?.unit}
                weight={product.specifications?.weight}
                weightUnit={product.specifications?.weightUnit}
                volume={product.specifications?.volume}
                volumeUnit={product.specifications?.volumeUnit}
              />
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 mb-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)

                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  if (!showPage) return null

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) handlePageChange(currentPage + 1)
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

        )}
      </div>
    </ScrollArea>
  )
}
