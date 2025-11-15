'use client'

import { Minus, Plus, ShoppingCart, Trash2, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { useCart } from './CartContext'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { formatPrice as formatCurrencyPrice, type Currency } from '@/lib/currency-client'

interface ShoppingCartSheetProps {
  isMobileNav?: boolean
}

export const ShoppingCartSheet = ({ isMobileNav = false }: ShoppingCartSheetProps) => {
  const { items, removeItem, updateQuantity, clearCart, itemCount, total } = useCart()
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // For now, we'll use a simple formatter since cart items don't have currency info yet
  // You may want to store currency with cart items in the future
  const formatPrice = (amount: number, currency?: Currency | number | string | null) => {
    return formatCurrencyPrice(amount, currency)
  }

  const handleWhatsAppOrder = () => {
    // WhatsApp number (change this to your actual number)
    const phoneNumber = '+5355145384'

    // Build the message
    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n'

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   Cantidad: ${item.quantity}\n`
      message += `   Precio unitario: ${formatPrice(item.price)}\n`
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`
    })

    message += `*Total: ${formatPrice(total)}*\n\n`
    message += 'Gracias!'

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
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
      <SheetTrigger asChild>
        {isMobileNav ? (
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:text-primary transition-colors">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-white text-black text-[10px]">
                  {itemCount}
                </Badge>
              )}
            </div>
            <span className="text-xs">Carrito</span>
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="hover:bg-primary/70 relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
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
              <div className="rounded-full bg-muted/50 p-6 mb-4">
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
                    group relative bg-card rounded-lg p-4 shadow-sm border border-border/50 
                    hover:shadow-md transition-all duration-300
                    ${removingItemId === String(item.id) ? 'animate-out fade-out slide-out-to-right-2 duration-300' : 'animate-in fade-in slide-in-from-left-2 duration-300'}
                  `}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/30">
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
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-xs text-foreground leading-snug mb-1.5">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-normal">
                            {formatPrice(item.price)} c/u
                          </p>
                        </div>
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Quantity Controls & Total Price */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="inline-flex items-center rounded-lg border border-border/60 bg-background/50 shadow-sm overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-muted/50 transition-colors border-r border-border/60"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-xs font-semibold w-10 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-muted/50 transition-colors border-l border-border/60"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
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
                <span className="text-xs text-muted-foreground font-medium">Subtotal</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
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
