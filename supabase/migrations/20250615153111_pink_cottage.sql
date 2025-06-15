/*
  # Fix RLS Policies and Add Sample Data

  1. Security Updates
    - Remove all existing conflicting policies
    - Create simple, non-recursive RLS policies
    - Fix infinite recursion issues

  2. Sample Data
    - Add sample categories with proper UUIDs
    - Add sample products with proper relationships
    - Ensure all foreign key relationships are valid

  3. Policy Structure
    - Users can only access their own data (profiles, cart, wishlist, orders, addresses)
    - Public can view active products, categories, and reviews
    - Service role has full access for admin operations
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Service role can manage products" ON products;
DROP POLICY IF EXISTS "Service role can view all products" ON products;

DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

DROP POLICY IF EXISTS "Anyone can create messages" ON messages;
DROP POLICY IF EXISTS "Service role can view all messages" ON messages;

DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create simple, non-recursive policies

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT TO public
  USING (true);

-- Products policies (public read for active products)
CREATE POLICY "products_select_active" ON products
  FOR SELECT TO public
  USING (is_active = true);

-- Cart items policies
CREATE POLICY "cart_items_all_own" ON cart_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "wishlist_all_own" ON wishlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT TO public
  USING (true);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "messages_insert_all" ON messages
  FOR INSERT TO public
  WITH CHECK (true);

-- Addresses policies
CREATE POLICY "addresses_all_own" ON addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Clear existing sample data to avoid conflicts
DELETE FROM products WHERE title IN (
  'Elegant Blue Maxi Dress',
  'Traditional Cotton Kurti', 
  'Casual Cotton Top',
  'Floral Print Midi Skirt',
  'High-Waisted Denim Jeans',
  'Summer Floral Dress',
  'Embroidered Ethnic Kurti',
  'Striped Casual Top'
);

DELETE FROM categories WHERE name IN ('Dresses', 'Kurtis', 'Tops', 'Skirts', 'Pants');

-- Add sample categories with proper UUIDs
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

  -- Insert sample products with proper category relationships
  INSERT INTO products (id, title, description, category_id, sizes, condition, price, discount_price, stock_count, images, is_featured, is_active) VALUES 
    (
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
      gen_random_uuid(),
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
    );
END $$;