'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: number | string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number | string) => void
  updateQuantity: (id: number | string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shopping-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id)

      if (existingItem) {
        return currentItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }

      return [...currentItems, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: number | string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
