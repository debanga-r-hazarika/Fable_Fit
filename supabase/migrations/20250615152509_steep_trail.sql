/*
  # Create addresses table

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `phone` (text)
      - `street` (text)
      - `city` (text)
      - `state` (text)
      - `pincode` (text)
      - `type` (text) - home, work, other
      - `is_default` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `addresses` table
    - Add policy for users to manage their own addresses
*/

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  type text DEFAULT 'home' CHECK (type IN ('home', 'work', 'other')),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for user lookups
CREATE INDEX addresses_user_id_idx ON addresses(user_id);
CREATE INDEX addresses_default_idx ON addresses(user_id, is_default) WHERE is_default = true;