'use client'

import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/context/cart-context'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { QuantityPicker } from '@/components/ui/quantity-picker'
import { openWhatsApp } from '@/lib/whatsapp'
import { useStoreBranding } from '@/components/theme/store-theme-provider'



interface ShoppingCartSheetProps {
  isMobileNav?: boolean
}

export const ShoppingCartSheet = ({ isMobileNav = false }: ShoppingCartSheetProps) => {
  const { items, removeItem, updateQuantity, clearCart, itemCount, total } = useCart()
  const branding = useStoreBranding()
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)



  const handleWhatsAppOrder = () => {
    openWhatsApp(items, total, undefined, branding)
    clearCart()
  }

  const handleRemoveItem = (id: string | number) => {
    setRemovingItemId(String(id))
    setTimeout(() => {
      removeItem(id)
      setRemovingItemId(null)
    }, 300)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className='hover:bg-accent'>
        {isMobileNav ? (
          <Button className="">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[10px]">
                {itemCount}
              </Badge>
            </div>
            <span className="text-xs">Carrito</span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[85vw] max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg">Carrito de Compras</SheetTitle>
          {itemCount > 0 && (
            <SheetDescription className="text-[10px] text-muted-foreground/70">
              {`Tienes ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'} en tu carrito`}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center animate-in fade-in duration-500">
              <div className="bg-muted/50 p-6 mb-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-foreground mb-2">Tu carrito está vacío</p>
              <p className="text-xs text-muted-foreground mb-6 max-w-[250px] leading-relaxed">
                ¡Empieza a explorar productos y encuentra lo que necesitas!
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setIsOpen(false)}>
                Explorar productos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`
                    group relative bg-card p-4 border border-border/50 
                    transition-all duration-300
                    ${removingItemId === String(item.id) ? 'animate-out fade-out slide-out-to-right-2 duration-300' : 'animate-in fade-in slide-in-from-left-2 duration-300'}
                  `}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 overflow-hidden bg-muted shrink-0 border border-border/30">
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
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-xs text-foreground leading-snug line-clamp-2">
                          {item.name}
                        </h4>
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

                      {/* Total Price Row */}
                      <div className="flex flex-row items-center gap-2 mb-2">
                        <p className="text-sm font-bold text-foreground text-left">
                          {formatCurrencyPrice(item.price * item.quantity, item.currency)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-normal whitespace-nowrap text-left">
                          {formatCurrencyPrice(item.price, item.currency)} c/u
                        </p>
                      </div>

                      {/* Quantity Controls and Price per unit Row */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[120px]">
                          <QuantityPicker
                            value={item.quantity}
                            onChange={(val) => updateQuantity(item.id, val)}
                            min={1}
                            size="sm"
                            className="bg-transparent text-foreground"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/60 bg-muted/30 px-6 py-5 space-y-4">
            {/* Total Section with enhanced styling */}
            <div className="border-t border-border/40 pt-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-accent tabular-nums">
                  {formatCurrencyPrice(total)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 text-sm"
                onClick={handleWhatsAppOrder}
              >
                Ordenar por WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="w-full h-9 text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 font-medium text-sm"
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
