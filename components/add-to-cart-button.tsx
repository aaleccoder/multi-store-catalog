'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { ShoppingCart, Plus, Minus, Send } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: number | string
    name: string
    price: number
    image: string
    slug: string
    variantName?: string
  }
  inStock?: boolean
}

export const AddToCartButton = ({ product, inStock = true }: AddToCartButtonProps) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleAddToCart = () => {
    // Add the item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    // Reset quantity after adding
    setQuantity(1)
  }

  const handleWhatsAppOrder = () => {
    // WhatsApp number (change this to your actual number)
    const phoneNumber = '+5355145384'

    // Build the message for this specific product
    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n'
    message += `1. ${product.name}${product.variantName ? ` (${product.variantName})` : ''}\n`
    message += `   Cantidad: ${quantity}\n`
    message += `   Precio unitario: ${formatPrice(product.price)}\n`
    message += `   Subtotal: ${formatPrice(product.price * quantity)}\n\n`
    message += `*Total: ${formatPrice(product.price * quantity)}*\n\n`
    message += 'Gracias!'

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Cantidad:</span>
        <div className="flex items-center border border-border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={decreaseQuantity}
            disabled={!inStock || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="h-10 w-16 flex items-center justify-center border-x border-border">
            <span className="font-semibold">{quantity}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={increaseQuantity}
            disabled={!inStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full bg-primary/70 hover:bg-primary/90 text-primary-foreground"
          disabled={!inStock}
          onClick={handleWhatsAppOrder}
        >
          <Send className="h-5 w-5 mr-2" />
          {inStock ? 'Ordenar' : 'Agotado'}
        </Button>
        <Button
          size="lg"
          variant="default"
          className="w-full"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  )
}
