'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface WishlistItem {
  id: number | string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: number | string) => void
  isInWishlist: (id: number | string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error loading wishlist:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (item: WishlistItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      if (prevItems.some((i) => i.id === item.id)) {
        return prevItems
      }
      return [...prevItems, item]
    })
  }

  const removeItem = (id: number | string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: number | string) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
