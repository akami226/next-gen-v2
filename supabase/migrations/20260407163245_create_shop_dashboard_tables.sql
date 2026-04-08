/*
  # Create shop dashboard tables

  1. New Tables
    - `shop_owners`
      - `id` (uuid, primary key) - Unique owner record
      - `user_id` (uuid, not null) - References auth.users
      - `shop_id` (text, not null) - References the shop (demo or future shop entity)
      - `shop_name` (text, not null) - Shop display name
      - `plan` (text, default 'starter') - Subscription plan name
      - `plan_price` (integer, default 0) - Monthly price in cents
      - `next_billing_date` (date) - Next billing cycle date
      - `created_at` (timestamptz, default now())

    - `shop_profile_views`
      - `id` (uuid, primary key) - Unique view record
      - `shop_id` (text, not null) - The shop viewed
      - `viewed_at` (timestamptz, default now()) - Timestamp of the view

    - `review_replies`
      - `id` (uuid, primary key) - Unique reply record
      - `review_id` (uuid, not null) - References shop_reviews
      - `shop_owner_id` (uuid, not null) - References auth.users (the shop owner)
      - `reply_text` (text, not null) - The reply content
      - `created_at` (timestamptz, default now())

  2. Security
    - RLS enabled on all tables
    - shop_owners: owners can read/update their own records
    - shop_profile_views: owners can read views for their shop, anon can insert
    - review_replies: owners can CRUD their own replies, authenticated can read all
*/

-- Shop Owners table
CREATE TABLE IF NOT EXISTS shop_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id text NOT NULL,
  shop_name text NOT NULL,
  plan text NOT NULL DEFAULT 'starter',
  plan_price integer NOT NULL DEFAULT 0,
  next_billing_date date,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_owners_user_shop
  ON shop_owners (user_id, shop_id);

ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read own shop records"
  ON shop_owners
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can update own shop records"
  ON shop_owners
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can insert own shop records"
  ON shop_owners
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Shop Profile Views table
CREATE TABLE IF NOT EXISTS shop_profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_profile_views_shop
  ON shop_profile_views (shop_id);

CREATE INDEX IF NOT EXISTS idx_shop_profile_views_date
  ON shop_profile_views (viewed_at DESC);

ALTER TABLE shop_profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read views for their shops"
  ON shop_profile_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.shop_id = shop_profile_views.shop_id
      AND shop_owners.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert profile views"
  ON shop_profile_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Review Replies table
CREATE TABLE IF NOT EXISTS review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  shop_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_review_replies_review
  ON review_replies (review_id);

ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read review replies"
  ON review_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Shop owners can insert their own replies"
  ON review_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shop_owner_id);

CREATE POLICY "Shop owners can update their own replies"
  ON review_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = shop_owner_id)
  WITH CHECK (auth.uid() = shop_owner_id);

CREATE POLICY "Shop owners can delete their own replies"
  ON review_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = shop_owner_id);
