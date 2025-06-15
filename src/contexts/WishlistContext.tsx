import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  product?: {
    title: string;
    price: number;
    discount_price: number | null;
    images: string[];
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('WishlistContext: User found, fetching wishlist items for:', user.id);
      fetchWishlistItems();
    } else {
      console.log('WishlistContext: No user found, clearing wishlist items');
      setItems([]);
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    if (!user) {
      console.log('WishlistContext: No user for fetching wishlist items');
      return;
    }

    setLoading(true);
    console.log('WishlistContext: Starting to fetch wishlist items for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(title, price, discount_price, images)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('WishlistContext: Error fetching wishlist items:', error);
        throw error;
      }
      
      console.log('WishlistContext: Successfully fetched wishlist items:', data);
      setItems(data || []);
    } catch (error) {
      console.error('WishlistContext: Failed to fetch wishlist items:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
      console.log('WishlistContext: Finished fetching wishlist items');
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      console.log('WishlistContext: User not authenticated, cannot add to wishlist');
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    console.log('WishlistContext: Adding to wishlist:', { productId, userId: user.id });

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) {
        console.error('WishlistContext: Error adding to wishlist:', error);
        throw error;
      }
      
      console.log('WishlistContext: Successfully added to wishlist');
      await fetchWishlistItems();
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('WishlistContext: Failed to add to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      console.log('WishlistContext: No user for removing from wishlist');
      return;
    }

    console.log('WishlistContext: Removing from wishlist:', { productId, userId: user.id });

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('WishlistContext: Error removing from wishlist:', error);
        throw error;
      }
      
      console.log('WishlistContext: Successfully removed from wishlist');
      await fetchWishlistItems();
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('WishlistContext: Failed to remove from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    const inWishlist = items.some(item => item.product_id === productId);
    console.log('WishlistContext: Checking if product is in wishlist:', { productId, inWishlist });
    return inWishlist;
  };

  const value = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}