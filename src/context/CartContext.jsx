import React, { createContext, useState, useEffect } from 'react'

// ✅ Create CartContext
export const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e)
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Add item to cart
  const addToCart = (book, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === book._id)
      if (existing) {
        return prev.map(item =>
          item._id === book._id ? { ...item, qty: item.qty + qty } : item
        )
      }
      return [...prev, { ...book, qty }]
    })
  }

  // Remove item from cart
  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item._id !== bookId))
  }

  // Clear cart
  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
