'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { ImageGallery } from '@/components/utils/image-gallery'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { toNumber } from '@/lib/number'
import { cn } from '@/lib/utils'

interface ProductDetailClientProps {
    product: any
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

    useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            const inStockVariant = product.variants.find((v: any) => v.stock > 0 && v.isActive)
            if (inStockVariant) {
                setSelectedVariantId(inStockVariant.id)
            } else {
                setSelectedVariantId(product.variants[0].id)
            }
        }
    }, [product.variants])

    const selectedVariant = selectedVariantId
        ? product.variants.find((v: any) => v.id === selectedVariantId)
        : null

    // Determine display values based on selection or default product data
    const currentData = selectedVariant || product

    // Helper to parse prices
    const parseNumeric = (raw: any) => toNumber(raw)



    // Get price for the current selection
    // If variant selected, use its price. If not, use product default price.
    const getPriceData = () => {
        const prices = currentData.prices || []
        const defaultPriceObj = prices.find((p: any) => p.isDefault) || prices[0]

        if (!defaultPriceObj) return { price: 0, regularPrice: undefined, currency: null, taxIncluded: true }

        const price = parseNumeric(defaultPriceObj.saleAmount ?? defaultPriceObj.amount)
        const regularPrice = defaultPriceObj.saleAmount ? parseNumeric(defaultPriceObj.amount) : undefined

        return {
            price,
            regularPrice,
            currency: defaultPriceObj.currency,
            taxIncluded: defaultPriceObj.taxIncluded ?? true
        }
    }

    const { price, regularPrice, currency, taxIncluded } = getPriceData()
    const hasDiscount = regularPrice !== undefined && regularPrice > price
    const discountPercentage = hasDiscount
        ? Math.round(((regularPrice! - price) / regularPrice!) * 100)
        : 0

    // Images
    // Priority: variant images array > variant single image > product images
    const productImages = (product.coverImages as any[]) || []

    let allImages = productImages
    if (selectedVariant) {
        const variantImages = (selectedVariant.images as any[]) || []
        if (variantImages.length > 0) {
            allImages = variantImages
        } else if (selectedVariant.image) {
            allImages = [{ url: selectedVariant.image, alt: selectedVariant.name, isPrimary: true }, ...productImages]
        }
    }

    const primaryImageUrl = allImages[0]?.url || ''
    const primaryImageAlt = allImages[0]?.alt || product.name

    // Stock
    const inStock = selectedVariant
        ? (selectedVariant.stock > 0 && selectedVariant.isActive)
        : product.inStock

    // Specifications
    const specifications = product.specifications as any

    // Handle variant selection
    const handleVariantChange = (variantId: string) => {
        setSelectedVariantId(variantId)
    }

    return (
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {selectedVariant?.sku ? (
                            <span>SKU: {selectedVariant.sku}</span>
                        ) : specifications?.sku ? (
                            <span>SKU: {specifications.sku}</span>
                        ) : null}
                    </div>
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
                    {inStock ? (
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
                                {formatCurrencyPrice(regularPrice!, currency)}
                            </span>
                        )}
                    </div>
                    {(specifications?.unit || specifications?.weight || specifications?.volume) && (
                        <div className="text-base text-muted-foreground flex flex-col gap-0.5 leading-none">
                            {specifications?.unit && <span>{specifications.unit.replace(/^(\d+).*$/, '$1')} unidades</span>}
                            {(specifications?.weight || specifications?.volume) && (
                                <span>
                                    {specifications.weight
                                        ? `${specifications.weight} ${specifications.weightUnit || 'g'}`
                                        : `${specifications.volume} ${specifications.volumeUnit || 'ml'}`}
                                </span>
                            )}
                        </div>
                    )}
                    {/* {taxIncluded && (
                        <p className="text-sm text-muted-foreground">Impuestos incluidos</p>
                    )} */}
                </div>

                {/* Variants Selector */}
                {product.variants && product.variants.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Opciones:</p>
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant: any) => (
                                <button
                                    key={variant.id}
                                    onClick={() => handleVariantChange(variant.id)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm border rounded-md transition-all hover:border-primary",
                                        selectedVariantId === variant.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary font-medium"
                                            : "border-input bg-background",
                                        (!variant.isActive || variant.stock <= 0) && "opacity-50 cursor-not-allowed bg-muted"
                                    )}
                                    disabled={!variant.isActive || variant.stock <= 0}
                                >
                                    {variant.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                    <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
                )}

                {/* Sizes (Legacy from specifications) - Only show if no variants */}
                {(!product.variants || product.variants.length === 0) && specifications?.sizes && specifications.sizes.length > 0 && (
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
                        id: selectedVariant ? selectedVariant.id : product.id, // Use variant ID if selected
                        name: product.name,
                        price,
                        image: primaryImageUrl,
                        slug: product.slug,
                        variantName: selectedVariant?.name,
                        currency
                    }}
                    inStock={inStock}
                />
            </div>
        </div>
    )
}
