'use client'
import { Heart, Minus, Plus, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { useWishlist } from '@/components/WishlistContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatPrice as formatCurrencyPrice, type Currency } from '@/lib/currency-client'

interface ProductCardProps {
  id: number | string
  name: string
  description: string
  price: number
  regularPrice?: number
  currency?: Currency | number | string | null
  image: string
  imageAlt?: string
  images?: Array<{
    url: string
    alt?: string
  }>
  slug: string
  featured?: boolean
  inStock?: boolean
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  regularPrice,
  currency,
  image,
  imageAlt,
  images,
  slug,
  featured = false,
  inStock = true,
}: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addItem, updateQuantity, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const isMobile = useIsMobile()

  // Prepare images array - use images prop if available, otherwise fallback to single image
  const imageList = images && images.length > 0 ? images : [{ url: image, alt: imageAlt || name }]

  const hasMultipleImages = imageList.length > 1

  // Auto-advance images every 3 seconds (only for desktop with multiple images)
  useEffect(() => {
    if (!isMobile && hasMultipleImages) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === imageList.length - 1 ? 0 : prevIndex + 1,
        )
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isMobile, hasMultipleImages, imageList.length])

  // Obtener la cantidad actual del producto en el carrito
  const cartItem = items.find((item) => item.id === id)
  const quantityInCart = cartItem?.quantity || 0

  const hasDiscount = regularPrice && regularPrice > price
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency)
  }

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image,
      slug,
    })
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleAddToCart()
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantityInCart > 0) {
      updateQuantity(id, quantityInCart + 1)
    } else {
      addItem({
        id,
        name,
        price,
        image,
        slug,
      })
    }
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantityInCart > 0) {
      updateQuantity(id, quantityInCart - 1)
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? imageList.length - 1 : prevIndex - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex === imageList.length - 1 ? 0 : prevIndex + 1))
  }

  const handleDotClick = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(id)) {
      removeFromWishlist(id)
    } else {
      addToWishlist({
        id,
        name,
        price,
        image,
        slug,
      })
    }
  }

  // Mobile Card View (2-column grid optimized)
  if (isMobile) {
    const currentImage = imageList[currentImageIndex]

    return (
      <Link href={`/product/${slug}`} className="block">
        <Card className="group overflow-hidden border-border bg-white shadow-sm hover:shadow-md transition-all duration-200 py-0 flex flex-col gap-0">
          {/* Image Container */}
          <div className="relative aspect-square">
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              {currentImage?.url ? (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || name}
                  fill
                  className="object-contain"
                  sizes="10vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Image indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {imageList.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-3 h-1.5' : 'bg-white/50 w-1.5 h-1.5'
                      }`}
                  />
                ))}
              </div>
            )}

            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors ${isInWishlist(id) ? 'text-destructive' : 'text-muted-foreground'
                }`}
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Content */}
          <CardContent className="p-2 flex flex-col flex-1">
            <div className="flex-1 space-y-2.5">
              {/* Badges */}
              {(featured || hasDiscount || !inStock) && (
                <div className="flex flex-wrap gap-1.5">
                  {featured && (
                    <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 h-5">
                      Destacado
                    </Badge>
                  )}
                  {/* {hasDiscount && (
                    <Badge className="bg-destructive/50 text-destructive-foreground text-[10px] px-2 py-0.5 h-5">
                      -{discountPercentage}%
                    </Badge>
                  )} */}
                  {!inStock && (
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 h-5"
                    >
                      Agotado
                    </Badge>
                  )}
                </div>
              )}

              <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 leading-tight">
                {name}
              </h3>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-primary">{formatPrice(price)}</span>
                {/* {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )} */}
              </div>
            </div>

            {/* Add to Cart Button - Full Width at Bottom */}
            {/* <div className="mt-3">
              {quantityInCart > 0 && inStock ? (
                <div className="flex items-center gap-1 bg-accent border border-accent-foreground/20 rounded-md p-1 w-full">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded hover:bg-accent-foreground/10 text-accent-foreground flex-shrink-0"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-sm font-semibold text-accent-foreground flex-1 text-center">
                    {quantityInCart}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded hover:bg-accent-foreground/10 text-accent-foreground flex-shrink-0"
                    onClick={handleIncrement}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : inStock ? (
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-2 rounded-md text-xs h-8 flex items-center justify-center gap-1.5"
                  onClick={handleAddToCartClick}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span></span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full bg-muted text-muted-foreground font-medium px-3 py-2 rounded-md text-xs h-8"
                  disabled
                >
                  Agotado
                </Button>
              )}
            </div> */}
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Desktop Card View
  const currentImage = imageList[currentImageIndex]

  return (
    <Link href={`/product/${slug}`} className="block">
      <Card className="group overflow-hidden border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-0">
        <div className="relative aspect-square">
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt || name}
                fill
                className="object-contain transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <span className="text-muted-foreground text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Navigation Arrows - Only show if multiple images */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-4 w-4 text-card-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4 text-card-foreground" />
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imageList.map((_, index) => (
                <button
                  key={index}
                  onClick={handleDotClick(index)}
                  className={`rounded-full transition-all ${index === currentImageIndex
                      ? 'bg-card w-6 h-2'
                      : 'bg-card/50 hover:bg-card/75 w-2 h-2'
                    }`}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {featured && (
              <Badge className="bg-accent text-accent-foreground shadow-sm">Destacado</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-destructive/50 text-destructive-foreground shadow-sm">
                -{discountPercentage}%
              </Badge>
            )}
            {!inStock && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground shadow-sm">
                Agotado
              </Badge>
            )}
          </div>
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors z-10 ${isInWishlist(id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
              }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-5 w-5 ${isInWishlist(id) ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="p-5 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {name}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-primary">{formatPrice(price)}</span>
                {/* {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )} */}
              </div>

              {quantityInCart > 0 ? (
                <div className="flex items-center gap-2 bg-accent border border-accent-foreground/20 rounded-lg p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-md hover:bg-accent-foreground/10 text-accent-foreground"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-semibold text-accent-foreground min-w-[2rem] text-center">
                    {quantityInCart}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-md hover:bg-accent-foreground/10 text-accent-foreground"
                    onClick={handleIncrement}
                    disabled={!inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="default"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!inStock}
                  onClick={handleAddToCartClick}
                >
                  {inStock ? 'Agregar' : 'Agotado'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
