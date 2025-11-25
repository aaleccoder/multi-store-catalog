'use client'

import { Heart, Trash2, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { useState } from 'react'
import { toast } from 'sonner'

interface WishlistSheetProps {
  isMobileNav?: boolean
}

export const WishlistSheet = ({ isMobileNav = false }: WishlistSheetProps) => {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist()
  const { addItem: addToCart, updateQuantity, items: cartItems } = useCart()
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, null)
  }

  const getCartQuantity = (id: string | number) => {
    const cartItem = cartItems.find((item) => item.id === id)
    return cartItem?.quantity || 0
  }

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id)
    if (!existingItem) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
      })
    }
  }

  const handleIncrement = (item: (typeof wishlistItems)[0]) => {
    const quantity = getCartQuantity(item.id)
    if (quantity > 0) {
      updateQuantity(item.id, quantity + 1)
    } else {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
      })
    }
  }

  const handleDecrement = (id: string | number) => {
    const quantity = getCartQuantity(id)
    if (quantity > 0) {
      updateQuantity(id, quantity - 1)
    }
  }

  const handleAddAllToCart = () => {
    const itemsNotInCart = wishlistItems.filter(
      (item) => !cartItems.find((cartItem) => cartItem.id === item.id)
    )

    if (itemsNotInCart.length === 0) {
      toast.info('Todos los productos ya están en el carrito')
      return
    }

    itemsNotInCart.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
      })
    })
  }

  const handleRemoveAllFromCart = () => {
    wishlistItems.forEach((item) => {
      updateQuantity(item.id, 0)
    })
  }

  const areAllItemsInCart = () => {
    if (wishlistItems.length === 0) return false
    return wishlistItems.every((item) =>
      cartItems.find((cartItem) => cartItem.id === item.id)
    )
  }

  const handleRemoveItem = (id: string | number) => {
    setRemovingItemId(String(id))
    setTimeout(() => {
      removeItem(id)
      setRemovingItemId(null)
    }, 300) // Match animation duration
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className='hover:bg-accent'>
        {isMobileNav ? (
          <Button className="flex flex-col items-center justify-center gap-1 text-white hover:text-black transition-colors">
            <div className="relative">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-white text-black text-[10px]">
                  {wishlistItems.length}
                </Badge>
              )}
            </div>
            <span className="text-xs">Favoritos</span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {wishlistItems.length}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[85vw] max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg">Lista de Deseos</SheetTitle>
          {wishlistItems.length > 0 && (
            <SheetDescription className="text-[10px] text-muted-foreground/70">
              {`Tienes ${wishlistItems.length} ${wishlistItems.length === 1 ? 'producto' : 'productos'} en tu lista de deseos`}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center animate-in fade-in duration-500">
              <div className="rounded-full bg-muted/50 p-6 mb-4">
                <Heart className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-foreground mb-2">
                Tu lista de deseos está vacía
              </p>
              <p className="text-xs text-muted-foreground mb-6 max-w-[250px] leading-relaxed">
                ¡Agrega productos a tu lista de deseos para verlos aquí!
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setIsOpen(false)}>
                Explorar productos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {wishlistItems.map((item) => {
                const quantityInCart = getCartQuantity(item.id)
                return (
                  <div
                    key={item.id}
                    className={`
                    group relative bg-white rounded-lg p-4 shadow-sm border border-border/50 
                    hover:shadow-md transition-all duration-300
                    ${removingItemId === String(item.id) ? 'animate-out fade-out slide-out-to-right-2 duration-300' : 'animate-in fade-in slide-in-from-left-2 duration-300'}
                  `}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/30"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/product/${item.slug}`}>
                            <h4 className="font-medium text-xs text-foreground leading-snug hover:text-primary transition-colors line-clamp-2">
                              {item.name}
                            </h4>
                          </Link>
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex w-full flex-col">
                          <p className="text-sm font-bold text-primary whitespace-nowrap text-left">
                            {formatPrice(item.price)}
                          </p>
                          {quantityInCart > 0 ? (
                            <>
                              <Button variant={"outline"} onClick={() => updateQuantity(item.id, 0)} className='flex-1 h-8 text-xs bg-destructive text-primary'>
                                <Trash2 className='h-3 w-3 mr-1' />
                                Quitar del carrito
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleAddToCart(item)}
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Agregar al Carrito
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="border-t border-border/60 bg-muted/30 px-6 py-5 space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              {areAllItemsInCart() ? (
                <Button
                  variant="outline"
                  className="w-full h-10 text-destructive border-destructive/40 hover:bg-destructive/10 hover:border-destructive/60 font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                  onClick={handleRemoveAllFromCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Quitar Todo del Carrito
                </Button>
              ) : (
                <Button
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                  onClick={handleAddAllToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar Todo al Carrito
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full h-9 text-destructive border border-destructive/40 hover:bg-destructive/10 hover:border-destructive/60 transition-all duration-200 font-medium text-sm"
                onClick={clearWishlist}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Lista
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
