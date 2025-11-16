import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/number'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/ProductCard'
import { Header } from '@/components/Header'
import { CategoryBarWrapper } from '@/components/CategoryBarWrapper'
import { LoadingProvider } from '@/components/LoadingContext'
import { NavigationLoadingBar } from '@/components/NavigationLoadingBar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'
import type { Metadata } from 'next'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { ImageGallery } from '../../../../components/ImageGallery'
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
    },
  })

  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  const coverImages = (product.coverImages as any[]) || []
  const primaryImage = coverImages.find((img: any) => img.isPrimary)
  const imageData = primaryImage || coverImages[0]
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

  // Fetch the product
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      subcategory: true,
      prices: { include: { currency: true } },
    },
  })

  if (!product) {
    notFound()
  }

  // Extract product data
  const coverImages = (product.coverImages as any[]) || []
  const primaryImage = coverImages.find((img: any) => img.isPrimary)
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
  const imageData = primaryImage || coverImages[0]
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
    },
    take: 4,
  })

  // Get category information for breadcrumb
  const category = product.category
  const categoryName = category?.name || 'Categoría'
  const categorySlug = category?.slug || ''

  const specifications = product.specifications as any
  const tags = product.tags as any[]

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

          {/* Product Details Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Image Gallery */}
            <ImageGallery
              images={allImages}
              productName={product.name}
              primaryImageUrl={primaryImageUrl}
              primaryImageAlt={primaryImageAlt}
            />

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                {specifications?.sku && (
                  <p className="text-sm text-muted-foreground">SKU: {specifications.sku}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.featured && (
                  <Badge className="bg-accent text-accent-foreground">Destacado</Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    -{discountPercentage}% descuento
                  </Badge>
                )}
                {product.inStock ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    En stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Agotado
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrencyPrice(price, currency)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrencyPrice(regularPrice, currency)}
                    </span>
                  )}
                </div>
                {defaultPriceObj?.taxIncluded && (
                  <p className="text-sm text-muted-foreground">Impuestos incluidos</p>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Sizes */}
              {specifications?.sizes && specifications.sizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Tallas disponibles:</p>
                  <div className="flex flex-wrap gap-2">
                    {specifications.sizes.map((sizeObj: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant={sizeObj.inStock ? 'outline' : 'secondary'}
                        className={!sizeObj.inStock ? 'opacity-50' : ''}
                      >
                        {sizeObj.size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimensions */}
              {specifications?.dimensions?.length && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-1">Dimensiones:</p>
                  <p>
                    {specifications.dimensions.length} x{' '}
                    {specifications.dimensions.width} x{' '}
                    {specifications.dimensions.height}{' '}
                    {specifications.dimensions.unit || 'cm'}
                  </p>
                </div>
              )}

              {/* Weight */}
              {specifications?.weight && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-1">Peso:</p>
                  <p>
                    {specifications.weight} {specifications.weightUnit || 'g'}
                  </p>
                </div>
              )}

              {/* Add to Cart */}
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price,
                  image: primaryImageUrl,
                  slug: product.slug,
                }}
                inStock={product.inStock ?? true}
              />
            </div>
          </div>

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
                  const relatedPrimaryImage = relatedCoverImages.find(
                    (img: any) => img.isPrimary,
                  )
                  const relatedImageData = relatedPrimaryImage || relatedCoverImages[0]
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
