'use client'
import { Heart, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatPrice as formatCurrencyPrice, type Currency } from '@/lib/currency-client'
import { Input } from './ui/input'
import { QuantityPicker } from './ui/quantity-picker'



interface ProductCardProps {
  id: number | string
  name: string
  description: string
  price: number
  regularPrice?: number
  currency?: Currency | string | null
  image: string
  imageAlt?: string
  images?: Array<{
    url: string
    alt?: string
  }>
  slug: string
  featured?: boolean
  inStock?: boolean
  unit?: string
  weight?: number
  weightUnit?: string
  volume?: number
  volumeUnit?: string
  pricePrefix?: string
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
  unit,
  weight,
  weightUnit,
  volume,
  volumeUnit,
  pricePrefix,
}: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addItem, updateQuantity, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const isMobile = useIsMobile()

  const imageList = images && images.length > 0 ? images : [{ url: image, alt: imageAlt || name }]

  const hasMultipleImages = imageList.length > 1

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
    // Accept either a Currency object or a currency code string.
    // If a number ID sneaks in, it's not expected; convert to string defensively.
    const currencyArg = typeof currency === 'number' ? String(currency) : currency
    return formatCurrencyPrice(amount, currencyArg)
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
          <CardContent className="p-1.5 flex flex-col">
            <div className="space-y-1">
              {/* Badges */}
              <div className="h-5">
                {(featured || hasDiscount || !inStock) && (
                  <div className="flex flex-wrap gap-1.5">
                    {featured && (
                      <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 h-5">
                        Destacado
                      </Badge>
                    )}
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
              </div>

              <h3 className="font-semibold text-sm text-card-foreground line-clamp-1 leading-tight h-[1.25rem]">
                {name}
              </h3>

              <div className="flex flex-col">
                <span className="text-sm font-bold text-primary">
                  {pricePrefix && <span className="text-xs font-normal text-muted-foreground mr-1">{pricePrefix}</span>}
                  {formatPrice(price)}
                </span>
                {(unit || weight || volume) && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 leading-none">
                    {unit && <span>{unit.replace(/^(\d+)(\w)$/, '$1 $2')}U</span>}
                    {unit && (weight || volume) && <span>•</span>}
                    {(weight || volume) && (
                      <span>
                        {weight ? `${weight} ${weightUnit || 'g'}` : `${volume} ${volumeUnit || 'ml'}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-1.5">
              {quantityInCart > 0 && inStock ? (
                <div className="w-full">
                  <QuantityPicker
                    value={quantityInCart}
                    onChange={(val) => updateQuantity(id, val)}
                    min={0}
                    size="sm"
                    className="bg-transparent shadow-sm text-black"
                  />
                </div>
              ) : inStock ? (
                <Button
                  size="sm"
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-medium px-3 py-2 rounded-md text-xs h-8 flex items-center justify-center gap-1.5"
                  onClick={handleAddToCartClick}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Agregar</span>
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
            </div>
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
        <div className="relative aspect-4/3">
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
            {hasDiscount && discountPercentage > 0 && (
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
          <div className="px-3 pb-4 flex flex-col h-28 space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight h-[1.5rem]">
                {name}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed h-[1.25rem]">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-primary">
                  {pricePrefix && <span className="text-xs font-normal text-muted-foreground mr-1">{pricePrefix}</span>}
                  {formatPrice(price)}
                </span>
                {(unit || weight || volume) && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 leading-none">
                    {unit && <span>{unit.replace(/^(\d+)(\w)$/, '$1 $2')}</span>}
                    {unit && (weight || volume) && <span>•</span>}
                    {(weight || volume) && (
                      <span>
                        {weight ? `${weight} ${weightUnit || 'g'}` : `${volume} ${volumeUnit || 'ml'}`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {quantityInCart > 0 ? (
                <div className="w-auto max-w-28">
                  <QuantityPicker
                    value={quantityInCart}
                    onChange={(val) => updateQuantity(id, val)}
                    min={0}
                    size="sm"
                    className="bg-transparent shadow-sm text-black"
                  />
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-primary font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-8 text-xs"
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
