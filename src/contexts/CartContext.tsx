import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  product?: {
    title: string;
    price: number;
    discount_price: number | null;
    images: string[];
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('CartContext: User found, fetching cart items for:', user.id);
      fetchCartItems();
    } else {
      console.log('CartContext: No user found, clearing cart items');
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) {
      console.log('CartContext: No user for fetching cart items');
      return;
    }

    setLoading(true);
    console.log('CartContext: Starting to fetch cart items for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(title, price, discount_price, images)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('CartContext: Error fetching cart items:', error);
        throw error;
      }
      
      console.log('CartContext: Successfully fetched cart items:', data);
      setItems(data || []);
    } catch (error) {
      console.error('CartContext: Failed to fetch cart items:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
      console.log('CartContext: Finished fetching cart items');
    }
  };

  const addToCart = async (productId: string, size?: string) => {
    if (!user) {
      console.log('CartContext: User not authenticated, cannot add to cart');
      toast.error('Please sign in to add items to cart');
      return;
    }

    console.log('CartContext: Adding to cart:', { productId, size, userId: user.id });

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          size: size || null,
          quantity: 1,
        }, {
          onConflict: 'user_id,product_id,size'
        });

      if (error) {
        console.error('CartContext: Error adding to cart:', error);
        throw error;
      }
      
      console.log('CartContext: Successfully added to cart');
      await fetchCartItems();
      toast.success('Added to cart');
    } catch (error) {
      console.error('CartContext: Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    console.log('CartContext: Updating quantity:', { itemId, quantity });
    
    if (quantity <= 0) {
      console.log('CartContext: Quantity is 0 or less, removing item');
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error('CartContext: Error updating quantity:', error);
        throw error;
      }
      
      console.log('CartContext: Successfully updated quantity');
      await fetchCartItems();
    } catch (error) {
      console.error('CartContext: Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    console.log('CartContext: Removing from cart:', itemId);
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('CartContext: Error removing from cart:', error);
        throw error;
      }
      
      console.log('CartContext: Successfully removed from cart');
      await fetchCartItems();
      toast.success('Removed from cart');
    } catch (error) {
      console.error('CartContext: Failed to remove from cart:', error);
      toast.error('Failed to remove from cart');
    }
  };

  const clearCart = async () => {
    if (!user) {
      console.log('CartContext: No user for clearing cart');
      return;
    }

    console.log('CartContext: Clearing cart for user:', user.id);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('CartContext: Error clearing cart:', error);
        throw error;
      }
      
      console.log('CartContext: Successfully cleared cart');
      setItems([]);
    } catch (error) {
      console.error('CartContext: Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getTotalItems = () => {
    const total = items.reduce((total, item) => total + item.quantity, 0);
    console.log('CartContext: Total items:', total);
    return total;
  };

  const getTotalPrice = () => {
    const total = items.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
    console.log('CartContext: Total price:', total);
    return total;
  };

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}