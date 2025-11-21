import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/number'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/header'
import { CategoryBarWrapper } from '@/components/category-bar-wrapper'
import { LoadingProvider } from '@/components/loading-context'
import { NavigationLoadingBar } from '@/components/navigation-loading'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import type { Metadata } from 'next'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { RichTextRenderer } from '@/components/rich-text-editor'
import { ProductDetailClient } from './product-detail-client'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency'
interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      coverImages: true,
    },
  })

  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  const coverImages = (product.coverImages as any[]) || []
  const imageData = coverImages[0]
  const imageUrl = imageData?.url || ''

  const metaData = product.metaData as any

  return {
    title: metaData?.title || product.name,
    description: metaData?.description || product.shortDescription || '',
    keywords: metaData?.keywords,
    openGraph: {
      title: product.name,
      description: product.shortDescription || '',
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      subcategory: true,
      prices: { include: { currency: true } },
      coverImages: true,
      variants: {
        where: { isActive: true },
        include: {
          prices: { include: { currency: true } },
          images: true
        }
      }
    },
  })

  if (!product) {
    notFound()
  }

  // Extract product data
  const coverImages = (product.coverImages as any[]) || []
  const allImages = coverImages

  const defaultPriceObj = (product as any).prices?.find((p: any) => p.isDefault) || (product as any).prices?.[0]
  const parseNumeric = (raw: any) => toNumber(raw)

  const price = defaultPriceObj ? parseNumeric(defaultPriceObj.saleAmount ?? defaultPriceObj.amount) : 0
  const regularPrice = defaultPriceObj ? (defaultPriceObj.saleAmount ? parseNumeric(defaultPriceObj.amount) : undefined) : undefined
  const currency = defaultPriceObj?.currency ?? null
  const hasDiscount = regularPrice && regularPrice > price
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0

  // Get the primary image URL
  const imageData = coverImages[0]
  const primaryImageUrl = imageData?.url || ''
  const primaryImageAlt = imageData?.alt || product.name

  // Fetch related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      category: true,
      prices: { include: { currency: true } },
      coverImages: true,
    },
    take: 4,
  })

  const category = product.category
  const categoryName = category?.name || 'Categoría'
  const categorySlug = category?.slug || ''

  const specifications = product.specifications as any
  const tags = product.tags as any[]

  const serializedProduct = {
    ...product,
    prices: product.prices.map((p: any) => ({
      ...p,
      amount: toNumber(p.amount),
      saleAmount: p.saleAmount ? toNumber(p.saleAmount) : null,
    })),
    variants: product.variants.map((v: any) => ({
      ...v,
      prices: v.prices.map((p: any) => ({
        ...p,
        amount: toNumber(p.amount),
        saleAmount: p.saleAmount ? toNumber(p.saleAmount) : null,
      })),
    })),
  }

  return (
    <LoadingProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <NavigationLoadingBar />
        <Header />
        <CategoryBarWrapper selectedCategorySlug={categorySlug} />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Inicio</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {category && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={`/?category=${categorySlug}`}>{categoryName}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <ProductDetailClient product={serializedProduct} />

          {/* Description Section */}
          {product.description && (
            <Card className="mb-16">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <RichTextRenderer content={product.description} />
              </CardContent>
            </Card>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-24">
              <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const relatedCoverImages = (relatedProduct.coverImages as any[]) || []
                  const relatedImageData = relatedCoverImages[0]
                  const relatedImageUrl = relatedImageData?.url || ''

                  const relatedDefaultPriceObj = (relatedProduct as any).prices?.find((p: any) => p.isDefault) || (relatedProduct as any).prices?.[0]
                  const relatedPrice = relatedDefaultPriceObj
                    ? parseNumeric(relatedDefaultPriceObj.saleAmount ?? relatedDefaultPriceObj.amount)
                    : 0
                  const relatedRegularPrice = relatedDefaultPriceObj
                    ? (relatedDefaultPriceObj.saleAmount
                      ? parseNumeric(relatedDefaultPriceObj.amount)
                      : undefined)
                    : undefined
                  const relatedCurrency = relatedDefaultPriceObj?.currency ?? null

                  return (
                    <ProductCard
                      key={relatedProduct.id}
                      id={relatedProduct.id}
                      name={relatedProduct.name}
                      description={relatedProduct.shortDescription || ''}
                      price={relatedPrice}
                      regularPrice={relatedRegularPrice}
                      currency={relatedCurrency}
                      image={relatedImageUrl}
                      imageAlt={relatedImageData?.alt}
                      slug={relatedProduct.slug}
                      featured={relatedProduct.featured}
                      inStock={relatedProduct.inStock}
                      unit={(relatedProduct.specifications as any)?.unit}
                      weight={(relatedProduct.specifications as any)?.weight}
                      weightUnit={(relatedProduct.specifications as any)?.weightUnit}
                      volume={(relatedProduct.specifications as any)?.volume}
                      volumeUnit={(relatedProduct.specifications as any)?.volumeUnit}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </LoadingProvider>
  )
}
