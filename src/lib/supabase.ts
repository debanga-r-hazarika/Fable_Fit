import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          sizes: string[];
          condition: string;
          price: number;
          discount_price: number | null;
          stock_count: number;
          images: string[];
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          sizes?: string[];
          condition?: string;
          price: number;
          discount_price?: number | null;
          stock_count?: number;
          images?: string[];
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category_id?: string | null;
          sizes?: string[];
          condition?: string;
          price?: number;
          discount_price?: number | null;
          stock_count?: number;
          images?: string[];
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string | null;
          quantity: number;
          size: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          size?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          size?: string | null;
          created_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          total_amount: number;
          payment_status: string;
          shipping_status: string;
          shipping_address: any;
          order_items: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_amount: number;
          payment_status?: string;
          shipping_status?: string;
          shipping_address?: any;
          order_items: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_amount?: number;
          payment_status?: string;
          shipping_status?: string;
          shipping_address?: any;
          order_items?: any;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string | null;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          street: string;
          city: string;
          state: string;
          pincode: string;
          type: 'home' | 'work' | 'other';
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          street: string;
          city: string;
          state: string;
          pincode: string;
          type?: 'home' | 'work' | 'other';
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          street?: string;
          city?: string;
          state?: string;
          pincode?: string;
          type?: 'home' | 'work' | 'other';
          is_default?: boolean;
          created_at?: string;
        };
      };
    };
  };
};