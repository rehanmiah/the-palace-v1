
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Dish } from '@/types/restaurant';

interface CartContextType {
  cart: CartItem[];
  addToCart: (dish: Dish, restaurantId: string, spiceLevel?: number) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateSpiceLevel: (dishId: string, spiceLevel: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  currentRestaurantId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);

  const addToCart = useCallback((dish: Dish, restaurantId: string, spiceLevel?: number) => {
    console.log('Adding to cart:', dish.name, 'from restaurant:', restaurantId, 'spice level:', spiceLevel);
    
    // If cart has items from different restaurant, clear it
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      console.log('Clearing cart - different restaurant');
      setCart([]);
    }
    
    setCurrentRestaurantId(restaurantId);
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => 
        item.dish.id === dish.id && item.spiceLevel === spiceLevel
      );
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.dish.id === dish.id && item.spiceLevel === spiceLevel
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { dish, quantity: 1, restaurantId, spiceLevel }];
    });
  }, [currentRestaurantId]);

  const removeFromCart = useCallback((dishId: string) => {
    console.log('Removing from cart:', dishId);
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.dish.id !== dishId);
      if (newCart.length === 0) {
        setCurrentRestaurantId(null);
      }
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    console.log('Updating quantity:', dishId, quantity);
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const updateSpiceLevel = useCallback((dishId: string, spiceLevel: number) => {
    console.log('Updating spice level:', dishId, spiceLevel);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.dish.id === dishId ? { ...item, spiceLevel } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    console.log('Clearing cart');
    setCart([]);
    setCurrentRestaurantId(null);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.dish.price * item.quantity, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSpiceLevel,
        clearCart,
        getCartTotal,
        getCartItemCount,
        currentRestaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
