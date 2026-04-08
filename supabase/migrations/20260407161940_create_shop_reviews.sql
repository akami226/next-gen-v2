/*
  # Create shop_reviews table for user-submitted reviews

  1. New Tables
    - `shop_reviews`
      - `id` (uuid, primary key) - Unique review identifier
      - `shop_id` (text, not null) - References the shop being reviewed (demo shop ID or future FK)
      - `user_id` (uuid, not null) - References auth.users, the reviewer
      - `display_name` (text, not null) - Reviewer display name at time of review
      - `rating` (integer, not null) - Star rating from 1 to 5
      - `comment` (text, not null, default '') - Written review text
      - `photos` (text[], default '{}') - Array of photo URLs attached to the review
      - `created_at` (timestamptz, default now()) - When the review was posted

  2. Indexes
    - Index on `shop_id` for fast lookups by shop
    - Index on `user_id` for fast lookups by user
    - Index on `created_at` for sorting

  3. Constraints
    - Rating must be between 1 and 5
    - One review per user per shop (unique constraint)

  4. Security
    - RLS enabled
    - Authenticated users can read all reviews
    - Authenticated users can insert their own reviews
    - Authenticated users can update their own reviews
    - Authenticated users can delete their own reviews
*/

CREATE TABLE IF NOT EXISTS shop_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  display_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_reviews_user_shop
  ON shop_reviews (shop_id, user_id);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop_id
  ON shop_reviews (shop_id);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_created_at
  ON shop_reviews (created_at DESC);

ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read reviews"
  ON shop_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON shop_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON shop_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON shop_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
