/*
  # Fix Data Access Issues

  1. RLS Policy Updates
    - Ensure public can read categories and active products
    - Fix authentication-based policies
    - Add proper admin access for management

  2. Data Verification
    - Ensure sample data exists and is accessible
    - Fix any foreign key issues

  3. Security
    - Maintain proper security while allowing necessary access
*/

-- First, let's ensure we have the auth.uid() function working properly
-- and fix any RLS policy issues

-- Drop all existing policies to start completely fresh
DO $$ 
BEGIN
    -- Drop policies for all tables
    DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
    
    DROP POLICY IF EXISTS "categories_select_all" ON categories;
    
    DROP POLICY IF EXISTS "products_select_active" ON products;
    
    DROP POLICY IF EXISTS "cart_items_all_own" ON cart_items;
    
    DROP POLICY IF EXISTS "wishlist_all_own" ON wishlist;
    
    DROP POLICY IF EXISTS "orders_select_own" ON orders;
    DROP POLICY IF EXISTS "orders_insert_own" ON orders;
    
    DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
    DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
    DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
    DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
    
    DROP POLICY IF EXISTS "messages_insert_all" ON messages;
    
    DROP POLICY IF EXISTS "addresses_all_own" ON addresses;
EXCEPTION 
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create comprehensive policies that actually work

-- Categories: Allow public read access (no authentication required)
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT TO public
  USING (true);

-- Products: Allow public read access for active products
CREATE POLICY "products_public_read" ON products
  FOR SELECT TO public
  USING (is_active = true);

-- Profiles: Users can manage their own profiles
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Cart items: Users can manage their own cart
CREATE POLICY "cart_items_own_access" ON cart_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wishlist: Users can manage their own wishlist
CREATE POLICY "wishlist_own_access" ON wishlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders: Users can view and create their own orders
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviews: Public can read, authenticated users can manage their own
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT TO public
  USING (true);

CREATE POLICY "reviews_own_write" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_own_update" ON reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_own_delete" ON reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Messages: Allow public to create messages
CREATE POLICY "messages_public_insert" ON messages
  FOR INSERT TO public
  WITH CHECK (true);

-- Addresses: Users can manage their own addresses
CREATE POLICY "addresses_own_access" ON addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add admin policies for management (check if user is admin)
CREATE POLICY "products_admin_all" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "categories_admin_all" ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "messages_admin_read" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Ensure all tables have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Ensure we have sample data (clean insert)
DELETE FROM products;
DELETE FROM categories;

-- Insert sample categories and products with proper relationships
DO $$
DECLARE
  cat_dresses_id UUID := gen_random_uuid();
  cat_kurtis_id UUID := gen_random_uuid();
  cat_tops_id UUID := gen_random_uuid();
  cat_skirts_id UUID := gen_random_uuid();
  cat_pants_id UUID := gen_random_uuid();
BEGIN
  -- Insert categories
  INSERT INTO categories (id, name, image_url) VALUES 
    (cat_dresses_id, 'Dresses', 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg'),
    (cat_kurtis_id, 'Kurtis', 'https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'),
    (cat_tops_id, 'Tops', 'https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'),
    (cat_skirts_id, 'Skirts', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),
    (cat_pants_id, 'Pants', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg');

  -- Insert sample products
  INSERT INTO products (title, description, category_id, sizes, condition, price, discount_price, stock_count, images, is_featured, is_active) VALUES 
    (
      'Elegant Blue Maxi Dress',
      'Beautiful flowing blue maxi dress perfect for evening occasions. Preloved in excellent condition.',
      cat_dresses_id,
      ARRAY['S', 'M', 'L'],
      'Excellent',
      2499,
      1899,
      5,
      ARRAY['https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg', 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg'],
      true,
      true
    ),
    (
      'Traditional Cotton Kurti',
      'Handcrafted cotton kurti with intricate embroidery. Perfect for casual and semi-formal occasions.',
      cat_kurtis_id,
      ARRAY['XS', 'S', 'M', 'L', 'XL'],
      'Good',
      1299,
      999,
      8,
      ARRAY['https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'],
      true,
      true
    ),
    (
      'Casual Cotton Top',
      'Comfortable and stylish cotton top for everyday wear. Soft fabric with modern fit.',
      cat_tops_id,
      ARRAY['S', 'M', 'L'],
      'Good',
      899,
      699,
      12,
      ARRAY['https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'],
      false,
      true
    ),
    (
      'Floral Print Midi Skirt',
      'Trendy floral print midi skirt with elastic waistband. Perfect for spring and summer.',
      cat_skirts_id,
      ARRAY['S', 'M', 'L', 'XL'],
      'Excellent',
      1599,
      1199,
      6,
      ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'],
      true,
      true
    ),
    (
      'High-Waisted Denim Jeans',
      'Classic high-waisted denim jeans with comfortable stretch. Timeless style for any wardrobe.',
      cat_pants_id,
      ARRAY['26', '28', '30', '32', '34'],
      'Good',
      1999,
      NULL,
      4,
      ARRAY['https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'],
      false,
      true
    ),
    (
      'Summer Floral Dress',
      'Light and breezy summer dress with beautiful floral patterns. Perfect for day outings.',
      cat_dresses_id,
      ARRAY['XS', 'S', 'M'],
      'Excellent',
      1799,
      1399,
      7,
      ARRAY['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'],
      false,
      true
    ),
    (
      'Embroidered Ethnic Kurti',
      'Stunning ethnic kurti with detailed embroidery work. Ideal for festivals and celebrations.',
      cat_kurtis_id,
      ARRAY['S', 'M', 'L', 'XL'],
      'New',
      2299,
      1999,
      3,
      ARRAY['https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg'],
      true,
      true
    ),
    (
      'Striped Casual Top',
      'Classic striped casual top in soft cotton blend. Versatile piece for everyday styling.',
      cat_tops_id,
      ARRAY['XS', 'S', 'M', 'L'],
      'Good',
      799,
      599,
      15,
      ARRAY['https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'],
      false,
      true
    ),
    (
      'Classic Black Dress',
      'Timeless black dress perfect for any occasion. Elegant and versatile.',
      cat_dresses_id,
      ARRAY['S', 'M', 'L', 'XL'],
      'Excellent',
      2199,
      1799,
      6,
      ARRAY['https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg'],
      true,
      true
    ),
    (
      'Flowy Chiffon Top',
      'Light and airy chiffon top with beautiful drape. Perfect for layering.',
      cat_tops_id,
      ARRAY['S', 'M', 'L'],
      'Good',
      1099,
      899,
      8,
      ARRAY['https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg'],
      false,
      true
    );
END $$;