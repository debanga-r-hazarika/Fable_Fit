/*
  # Create Fable and Fits E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `sizes` (text array)
      - `condition` (text)
      - `price` (numeric)
      - `discount_price` (numeric, nullable)
      - `stock_count` (integer)
      - `images` (text array)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `size` (text)
      - `created_at` (timestamp)
    
    - `wishlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (numeric)
      - `payment_status` (text)
      - `shipping_status` (text)
      - `shipping_address` (jsonb)
      - `order_items` (jsonb)
      - `created_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamp)
    
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  sizes text[] DEFAULT '{}',
  condition text DEFAULT 'Good',
  price numeric NOT NULL,
  discount_price numeric,
  stock_count integer DEFAULT 0,
  images text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, size)
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  shipping_status text DEFAULT 'processing',
  shipping_address jsonb,
  order_items jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Cart items policies
CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_active_idx ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);

-- Insert sample categories
INSERT INTO categories (name, image_url) VALUES
  ('Dresses', 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg'),
  ('Kurtis', 'https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'),
  ('Tops', 'https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'),
  ('Skirts', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg'),
  ('Pants', 'https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg')
ON CONFLICT DO NOTHING;

-- Insert sample products
DO $$
DECLARE
  dress_cat_id uuid;
  kurti_cat_id uuid;
  top_cat_id uuid;
  skirt_cat_id uuid;
  pant_cat_id uuid;
BEGIN
  SELECT id INTO dress_cat_id FROM categories WHERE name = 'Dresses';
  SELECT id INTO kurti_cat_id FROM categories WHERE name = 'Kurtis';
  SELECT id INTO top_cat_id FROM categories WHERE name = 'Tops';
  SELECT id INTO skirt_cat_id FROM categories WHERE name = 'Skirts';
  SELECT id INTO pant_cat_id FROM categories WHERE name = 'Pants';

  INSERT INTO products (title, description, category_id, sizes, condition, price, discount_price, stock_count, images, is_featured, is_active) VALUES
    ('Floral Summer Dress', 'Beautiful floral print dress perfect for summer outings', dress_cat_id, ARRAY['XS', 'S', 'M', 'L'], 'Excellent', 1299.00, 999.00, 5, ARRAY['https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], true, true),
    ('Elegant Evening Dress', 'Sophisticated black dress for special occasions', dress_cat_id, ARRAY['S', 'M', 'L'], 'Good', 2199.00, 1799.00, 3, ARRAY['https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg'], true, true),
    ('Cotton Printed Kurti', 'Comfortable cotton kurti with traditional prints', kurti_cat_id, ARRAY['M', 'L', 'XL'], 'Very Good', 899.00, NULL, 8, ARRAY['https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'], false, true),
    ('Silk Fusion Kurti', 'Premium silk kurti with modern design', kurti_cat_id, ARRAY['S', 'M', 'L'], 'Excellent', 1599.00, 1299.00, 4, ARRAY['https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'], true, true),
    ('Casual Striped Top', 'Comfortable striped top for everyday wear', top_cat_id, ARRAY['XS', 'S', 'M'], 'Good', 599.00, NULL, 10, ARRAY['https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'], false, true),
    ('Chiffon Blouse', 'Elegant chiffon blouse perfect for office wear', top_cat_id, ARRAY['S', 'M', 'L'], 'Very Good', 799.00, 649.00, 6, ARRAY['https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'], false, true),
    ('A-Line Denim Skirt', 'Classic denim skirt with modern fit', skirt_cat_id, ARRAY['XS', 'S', 'M', 'L'], 'Good', 1099.00, 899.00, 7, ARRAY['https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg'], false, true),
    ('Pleated Midi Skirt', 'Elegant pleated skirt for formal occasions', skirt_cat_id, ARRAY['S', 'M', 'L'], 'Excellent', 1399.00, NULL, 5, ARRAY['https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg'], true, true),
    ('High-Waist Jeans', 'Trendy high-waist jeans in perfect condition', pant_cat_id, ARRAY['26', '28', '30', '32'], 'Very Good', 1799.00, 1499.00, 6, ARRAY['https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg'], false, true),
    ('Wide Leg Trousers', 'Comfortable wide leg trousers for office wear', pant_cat_id, ARRAY['S', 'M', 'L'], 'Good', 1299.00, NULL, 4, ARRAY['https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg'], false, true)
  ON CONFLICT DO NOTHING;
END $$;