
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Dish } from '@/types/restaurant';

interface CartContextType {
  cart: CartItem[];
  addToCart: (dish: Dish, restaurantId: string, spiceLevel?: number) => void;
  removeFromCart: (dishId: number, spiceLevel?: number) => void;
  updateQuantity: (dishId: number, quantity: number, spiceLevel?: number) => void;
  updateSpiceLevel: (dishId: number, spiceLevel: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getItemQuantityInCart: (dishId: number, spiceLevel?: number) => number;
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
      // Find existing item with SAME dish ID AND SAME spice level
      // Items with different spice levels are treated as separate items
      const existingItem = prevCart.find((item) => 
        item.dish.id === dish.id && 
        (item.spiceLevel || 0) === (spiceLevel || 0)
      );
      
      if (existingItem) {
        console.log('Item already in cart, incrementing quantity');
        return prevCart.map((item) =>
          item.dish.id === dish.id && (item.spiceLevel || 0) === (spiceLevel || 0)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      console.log('Adding new item to cart');
      return [...prevCart, { dish, quantity: 1, restaurantId, spiceLevel: spiceLevel || 0 }];
    });
  }, [currentRestaurantId]);

  const removeFromCart = useCallback((dishId: number, spiceLevel?: number) => {
    console.log('Removing from cart:', dishId, 'spice level:', spiceLevel);
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => 
        !(item.dish.id === dishId && (item.spiceLevel || 0) === (spiceLevel || 0))
      );
      if (newCart.length === 0) {
        setCurrentRestaurantId(null);
      }
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((dishId: number, quantity: number, spiceLevel?: number) => {
    console.log('Updating quantity:', dishId, quantity, 'spice level:', spiceLevel);
    if (quantity <= 0) {
      removeFromCart(dishId, spiceLevel);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.dish.id === dishId && (item.spiceLevel || 0) === (spiceLevel || 0)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const updateSpiceLevel = useCallback((dishId: number, spiceLevel: number) => {
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

  // Get quantity for a specific dish with a specific spice level
  const getItemQuantityInCart = useCallback((dishId: number, spiceLevel?: number) => {
    const item = cart.find((item) => 
      item.dish.id === dishId && 
      (item.spiceLevel || 0) === (spiceLevel || 0)
    );
    return item ? item.quantity : 0;
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
        getItemQuantityInCart,
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
