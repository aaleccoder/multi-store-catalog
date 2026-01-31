'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { ShoppingCart, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { QuantityPicker } from '../ui/quantity-picker'
import { openWhatsApp } from '@/lib/whatsapp'
import { type Currency } from '@/lib/currency-client'



interface AddToCartButtonProps {
  product: {
    id: number | string
    name: string
    price: number
    image: string
    slug: string
    variantName?: string
    currency?: Currency | string | null
  }
  inStock?: boolean
}

export const AddToCartButton = ({ product, inStock = true }: AddToCartButtonProps) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)



  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    setQuantity(1)
  }

  const handleWhatsAppOrder = () => {
    openWhatsApp([{
      name: product.name,
      quantity: quantity,
      price: product.price,
      currency: product.currency,
      variantName: product.variantName
    }], product.price * quantity, product.currency)
  }



  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-foreground">Cantidad:</span>
        <div className="w-32">
          <QuantityPicker
            value={quantity}
            onChange={setQuantity}
            min={1}
            className="bg-transparent shadow-sm text-foreground"
            disabled={!inStock}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!inStock}
          onClick={handleWhatsAppOrder}
        >
          <Send className="h-5 w-5 mr-2" />
          {inStock ? 'Ordenar por Whatsapp' : 'Agotado'}
        </Button>
        <Button
          size="lg"
          variant="default"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
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
