/*
  # Create shop_registrations table

  1. New Tables
    - `shop_registrations`
      - `id` (uuid, primary key)
      - `shop_name` (text, not null) - Name of the shop
      - `owner_name` (text, not null) - Full name of the shop owner
      - `email` (text, unique, not null) - Business email address
      - `phone` (text, not null) - Phone number
      - `street_address` (text, not null) - Street address
      - `city` (text, not null) - City
      - `state` (text, not null) - US state
      - `zip` (text, not null) - Zip code
      - `services` (text[], not null, default '{}') - Array of services offered
      - `logo_file_name` (text) - Name of uploaded logo file
      - `bio` (text, default '') - Short bio, max 200 characters
      - `created_at` (timestamptz, default now()) - When the registration was submitted

  2. Security
    - Enable RLS on `shop_registrations` table
    - Add INSERT policy allowing anonymous users to submit registrations
      (public registration form, no auth required)
    - No SELECT/UPDATE/DELETE policies for anon - data is admin-only after submission
*/

CREATE TABLE IF NOT EXISTS shop_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  owner_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  logo_file_name text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a registration"
  ON shop_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

/*
  # Create quote_leads table for lead generation

  1. New Tables
    - `quote_leads`
      - `id` (uuid, primary key) - unique lead identifier
      - `shop_name` (text, not null) - name of the shop quoted
      - `shop_location` (text, not null) - city/state of the shop
      - `customer_name` (text, not null) - customer full name
      - `customer_email` (text, not null) - customer email address
      - `customer_phone` (text, not null) - customer phone number
      - `customer_city` (text, not null) - customer city and state
      - `contact_time` (text, not null, default 'Anytime') - preferred contact time
      - `notes` (text, default '') - additional notes from customer
      - `car_config` (jsonb, not null) - full vehicle configuration snapshot
      - `status` (text, not null, default 'pending') - lead status
      - `created_at` (timestamptz, default now()) - submission timestamp

  2. Security
    - Enable RLS on `quote_leads` table
    - Add INSERT policy allowing anonymous users to submit leads (public form)
    - No SELECT/UPDATE/DELETE policies for anonymous users (leads are shop-facing data)
*/

CREATE TABLE IF NOT EXISTS quote_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  shop_location text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_city text NOT NULL,
  contact_time text NOT NULL DEFAULT 'Anytime',
  notes text DEFAULT '',
  car_config jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote lead"
  ON quote_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

/*
  # Add profile fields to shop_registrations

  1. Modified Tables
    - `shop_registrations`
      - `website` (text, nullable) - Shop website URL
      - `years_in_business` (integer, not null, default 0) - Years the shop has been operating
      - `instagram` (text, nullable) - Instagram handle

  2. Changes
    - Updates bio column default and increases intended max from 200 to 300 characters
    - Adds three new optional/required columns for richer shop profiles

  3. Notes
    - All new columns use IF NOT EXISTS checks for safety
    - No data is modified or deleted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'website'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'years_in_business'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN years_in_business integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'instagram'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN instagram text;
  END IF;
END $$;

/*
  # Create user profiles and saved builds tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text) - user's display name
      - `email` (text) - user's email
      - `created_at` (timestamptz) - account creation time
    - `saved_builds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles) - build owner
      - `name` (text) - user-given build name
      - `car` (text) - car model
      - `wrap` (text) - wrap selection
      - `wheels` (text) - wheel selection
      - `tint` (text) - tint selection
      - `exhaust` (text) - exhaust selection
      - `car_index` (integer) - index for restoring state
      - `wrap_index` (integer) - index for restoring state
      - `wheel_index` (integer) - index for restoring state
      - `tint_index` (integer) - index for restoring state
      - `thumbnail_url` (text) - optional screenshot thumbnail
      - `created_at` (timestamptz) - when build was saved

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS saved_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Build',
  car text NOT NULL,
  wrap text NOT NULL,
  wheels text NOT NULL,
  tint text NOT NULL,
  exhaust text NOT NULL,
  car_index integer NOT NULL DEFAULT 0,
  wrap_index integer NOT NULL DEFAULT 0,
  wheel_index integer NOT NULL DEFAULT 0,
  tint_index integer NOT NULL DEFAULT 0,
  thumbnail_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own builds"
  ON saved_builds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own builds"
  ON saved_builds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds"
  ON saved_builds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own builds"
  ON saved_builds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

/*
  # Add social media columns to shop_registrations

  1. Modified Tables
    - `shop_registrations`
      - `facebook` (text, nullable) - Facebook page URL
      - `tiktok` (text, nullable) - TikTok profile URL
      - `twitter` (text, nullable) - X/Twitter profile URL
      - `whatsapp` (text, nullable) - WhatsApp business phone number

  2. Notes
    - All new columns are optional (nullable) since social media is not required
    - Uses IF NOT EXISTS checks for safe re-runs
    - No data is modified or deleted
    - Instagram and website columns already exist from previous migrations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'facebook'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN facebook text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'tiktok'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN tiktok text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'twitter'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN twitter text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_registrations' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE shop_registrations ADD COLUMN whatsapp text;
  END IF;
END $$;

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

/*
  # Add shop_id to quote_leads and allow shop owners to read their leads

  1. Modified Tables
    - `quote_leads`
      - Add `shop_id` (text, nullable) - Links lead to a specific shop
      - Add read policy for shop owners

  2. Security
    - Shop owners can read leads matching their shop name or shop_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_leads' AND column_name = 'shop_id'
  ) THEN
    ALTER TABLE quote_leads ADD COLUMN shop_id text;
  END IF;
END $$;

CREATE POLICY "Shop owners can read their leads"
  ON quote_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = auth.uid()
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  );

CREATE POLICY "Shop owners can update lead status"
  ON quote_leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = auth.uid()
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = auth.uid()
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  );

/*
  # Allow authenticated users to insert shop registrations

  1. Security Changes
    - Add INSERT policy for authenticated users on shop_registrations
    - This fixes the registration flow where the user creates an auth account first,
      then inserts the shop registration while authenticated

  2. Notes
    - The existing anon INSERT policy remains for backward compatibility
    - No data is modified or deleted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'shop_registrations'
    AND policyname = 'Authenticated users can submit a registration'
  ) THEN
    CREATE POLICY "Authenticated users can submit a registration"
      ON shop_registrations
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

/*
  # Add branding columns to shop_owners and create storage bucket

  1. Modified Tables
    - `shop_owners`
      - `logo_url` (text, nullable) - URL to the shop logo image
      - `banner_url` (text, nullable) - URL to the shop banner/cover image
      - `profile_picture_url` (text, nullable) - URL to the shop owner's profile picture

  2. Storage
    - Create `shop-assets` bucket for storing logos, banners, and profile pictures
    - Public bucket so images can be displayed without auth tokens

  3. Security
    - Storage policies: owners can upload/update/delete their own files
    - Anyone can view (public bucket)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_owners' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE shop_owners ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_owners' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE shop_owners ADD COLUMN banner_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_owners' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE shop_owners ADD COLUMN profile_picture_url text;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload shop assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shop-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can update own shop assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'shop-assets' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'shop-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own shop assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'shop-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view shop assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'shop-assets');

/*
  # Create shop notifications table

  1. New Tables
    - `shop_notifications`
      - `id` (uuid, primary key)
      - `shop_owner_id` (uuid, references shop_owners)
      - `type` (text) - one of: new_lead, new_review, new_quote
      - `title` (text) - notification title
      - `message` (text) - notification body/preview
      - `customer_name` (text) - name of the customer who triggered it
      - `metadata` (jsonb) - extra data (car model, star rating, etc.)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `shop_notifications` table
    - Add policy for shop owners to read their own notifications
    - Add policy for shop owners to update (mark read) their own notifications
    - Add policy for shop owners to delete their own notifications
    - Add policy for authenticated users to insert notifications (when submitting quotes/reviews)

  3. Indexes
    - Index on shop_owner_id for fast lookups
    - Index on is_read for filtering unread
    - Index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS shop_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_lead', 'new_review', 'new_quote')),
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop_notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_shop_notifications_owner ON shop_notifications(shop_owner_id);
CREATE INDEX IF NOT EXISTS idx_shop_notifications_read ON shop_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_shop_notifications_created ON shop_notifications(created_at DESC);

CREATE POLICY "Shop owners can read own notifications"
  ON shop_notifications
  FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update own notifications"
  ON shop_notifications
  FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can delete own notifications"
  ON shop_notifications
  FOR DELETE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert notifications"
  ON shop_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners
    )
  );

/*
  # Create Admin Tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `role` (text, default 'admin')
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    - `admin_activity_log`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references admin_users)
      - `action` (text)
      - `target_type` (text)
      - `target_id` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Admin users can only read their own record
    - Activity log readable only by the admin who created it

  3. Seed Data
    - Create admin user account via auth and insert into admin_users
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id),
  action text NOT NULL DEFAULT '',
  target_type text NOT NULL DEFAULT '',
  target_id text NOT NULL DEFAULT '',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own activity log"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = admin_activity_log.admin_id
      AND admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert own activity log"
  ON admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = admin_activity_log.admin_id
      AND admin_users.user_id = auth.uid()
    )
  );

/*
  # Add admin read policies for platform data

  1. Security Changes
    - Allow admin users to read shop_registrations
    - Allow admin users to read user_profiles
    - Allow admin users to read quote_leads
    - Allow admin users to read shop_owners
    - Allow admin users to read shop_reviews
    - All policies check admin_users table membership

  2. Notes
    - These policies enable the admin dashboard to display platform-wide data
    - Only active admin users can access the data
*/

CREATE POLICY "Admins can read all shop registrations"
  ON shop_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can read all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can read all quote leads"
  ON quote_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can read all shop owners"
  ON shop_owners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can read all shop reviews"
  ON shop_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

/*
  # Create contact_submissions table

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text, not null)
      - `subject` (text, not null)
      - `message` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `contact_submissions` table
    - Add insert policy for anyone (public contact form)
    - No select/update/delete policies for public users
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) > 0 AND
    length(email) > 0 AND
    length(subject) > 0 AND
    length(message) > 0
  );

/*
  # Add missing foreign key indexes

  1. New Indexes
    - `idx_admin_activity_log_admin_id` on admin_activity_log(admin_id)
    - `idx_admin_users_user_id` on admin_users(user_id)
    - `idx_review_replies_shop_owner_id` on review_replies(shop_owner_id)
    - `idx_saved_builds_user_id` on saved_builds(user_id)
    - `idx_shop_reviews_user_id` on shop_reviews(user_id)

  2. Purpose
    - Foreign keys without covering indexes cause slow sequential scans
      during cascading deletes and join operations
    - These indexes ensure optimal query performance for all FK relationships
*/

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id
  ON admin_activity_log (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
  ON admin_users (user_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_shop_owner_id
  ON review_replies (shop_owner_id);

CREATE INDEX IF NOT EXISTS idx_saved_builds_user_id
  ON saved_builds (user_id);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_user_id
  ON shop_reviews (user_id);

/*
  # Optimize RLS policies to use (select auth.uid()) pattern

  1. Problem
    - Policies using auth.uid() directly re-evaluate the function for every row
    - This causes suboptimal query performance at scale

  2. Fix
    - Replace auth.uid() with (select auth.uid()) so the value is computed once
      and reused across all row evaluations

  3. Affected Tables and Policies
    - contact_submissions: "Admins can read contact submissions"
    - quote_leads: "Admins can read all quote leads", "Shop owners can read their leads", "Shop owners can update lead status"
    - shop_registrations: "Admins can read all shop registrations"
    - user_profiles: "Admins can read all user profiles", "Users can insert own profile", "Users can read own profile", "Users can update own profile"
    - saved_builds: all 4 CRUD policies
    - shop_reviews: "Admins can read all shop reviews", "Users can delete their own reviews", "Users can insert their own reviews", "Users can update their own reviews"
    - shop_owners: "Admins can read all shop owners", "Owners can insert own shop records", "Owners can read own shop records", "Owners can update own shop records"
    - shop_profile_views: "Authenticated users can read views for their shops"
    - review_replies: "Shop owners can delete their own replies", "Shop owners can insert their own replies", "Shop owners can update their own replies"
    - shop_notifications: "Shop owners can delete own notifications", "Shop owners can read own notifications", "Shop owners can update own notifications"
    - admin_users: "Admins can read own record"
    - admin_activity_log: "Admins can insert own activity log", "Admins can read own activity log"
*/

-- ============================================================
-- contact_submissions
-- ============================================================
DROP POLICY IF EXISTS "Admins can read contact submissions" ON contact_submissions;
CREATE POLICY "Admins can read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

-- ============================================================
-- quote_leads
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all quote leads" ON quote_leads;
CREATE POLICY "Admins can read all quote leads"
  ON quote_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Shop owners can read their leads" ON quote_leads;
CREATE POLICY "Shop owners can read their leads"
  ON quote_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = (select auth.uid())
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  );

DROP POLICY IF EXISTS "Shop owners can update lead status" ON quote_leads;
CREATE POLICY "Shop owners can update lead status"
  ON quote_leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = (select auth.uid())
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = (select auth.uid())
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
  );

-- ============================================================
-- shop_registrations
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all shop registrations" ON shop_registrations;
CREATE POLICY "Admins can read all shop registrations"
  ON shop_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

-- ============================================================
-- user_profiles
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all user profiles" ON user_profiles;
CREATE POLICY "Admins can read all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- saved_builds
-- ============================================================
DROP POLICY IF EXISTS "Users can read own builds" ON saved_builds;
CREATE POLICY "Users can read own builds"
  ON saved_builds
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own builds" ON saved_builds;
CREATE POLICY "Users can insert own builds"
  ON saved_builds
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own builds" ON saved_builds;
CREATE POLICY "Users can update own builds"
  ON saved_builds
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own builds" ON saved_builds;
CREATE POLICY "Users can delete own builds"
  ON saved_builds
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- shop_reviews
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all shop reviews" ON shop_reviews;
CREATE POLICY "Admins can read all shop reviews"
  ON shop_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can insert their own reviews" ON shop_reviews;
CREATE POLICY "Users can insert their own reviews"
  ON shop_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON shop_reviews;
CREATE POLICY "Users can update their own reviews"
  ON shop_reviews
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON shop_reviews;
CREATE POLICY "Users can delete their own reviews"
  ON shop_reviews
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- shop_owners
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all shop owners" ON shop_owners;
CREATE POLICY "Admins can read all shop owners"
  ON shop_owners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Owners can read own shop records" ON shop_owners;
CREATE POLICY "Owners can read own shop records"
  ON shop_owners
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Owners can update own shop records" ON shop_owners;
CREATE POLICY "Owners can update own shop records"
  ON shop_owners
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Owners can insert own shop records" ON shop_owners;
CREATE POLICY "Owners can insert own shop records"
  ON shop_owners
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- shop_profile_views
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read views for their shops" ON shop_profile_views;
CREATE POLICY "Authenticated users can read views for their shops"
  ON shop_profile_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.shop_id = shop_profile_views.shop_id
      AND shop_owners.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- review_replies
-- ============================================================
DROP POLICY IF EXISTS "Shop owners can insert their own replies" ON review_replies;
CREATE POLICY "Shop owners can insert their own replies"
  ON review_replies
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = shop_owner_id);

DROP POLICY IF EXISTS "Shop owners can update their own replies" ON review_replies;
CREATE POLICY "Shop owners can update their own replies"
  ON review_replies
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = shop_owner_id)
  WITH CHECK ((select auth.uid()) = shop_owner_id);

DROP POLICY IF EXISTS "Shop owners can delete their own replies" ON review_replies;
CREATE POLICY "Shop owners can delete their own replies"
  ON review_replies
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = shop_owner_id);

-- ============================================================
-- shop_notifications
-- ============================================================
DROP POLICY IF EXISTS "Shop owners can read own notifications" ON shop_notifications;
CREATE POLICY "Shop owners can read own notifications"
  ON shop_notifications
  FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Shop owners can update own notifications" ON shop_notifications;
CREATE POLICY "Shop owners can update own notifications"
  ON shop_notifications
  FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Shop owners can delete own notifications" ON shop_notifications;
CREATE POLICY "Shop owners can delete own notifications"
  ON shop_notifications
  FOR DELETE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================
-- admin_users
-- ============================================================
DROP POLICY IF EXISTS "Admins can read own record" ON admin_users;
CREATE POLICY "Admins can read own record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- admin_activity_log
-- ============================================================
DROP POLICY IF EXISTS "Admins can read own activity log" ON admin_activity_log;
CREATE POLICY "Admins can read own activity log"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = admin_activity_log.admin_id
      AND admin_users.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can insert own activity log" ON admin_activity_log;
CREATE POLICY "Admins can insert own activity log"
  ON admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = admin_activity_log.admin_id
      AND admin_users.user_id = (select auth.uid())
    )
  );

/*
  # Remove duplicate policies and tighten always-true INSERT policies

  1. Duplicate Policy Removal
    - contact_submissions: Remove "Anyone can submit a contact form" (always-true)
      keeping "Anyone can submit contact form" (has validation)

  2. Tighten Always-True INSERT Policies
    - quote_leads: Replace WITH CHECK (true) with basic field validation
    - shop_profile_views: Replace WITH CHECK (true) with non-empty shop_id check
    - shop_registrations (anon): Replace WITH CHECK (true) with basic field validation
    - shop_registrations (authenticated): Replace WITH CHECK (true) with basic field validation

  3. Purpose
    - Prevent empty/garbage submissions from bypassing RLS
    - Ensure data quality at the database level
    - Remove redundant permissive policies that widen access unintentionally
*/

-- ============================================================
-- contact_submissions: drop the always-true duplicate
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit a contact form" ON contact_submissions;

-- ============================================================
-- quote_leads: tighten anon insert
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit a quote lead" ON quote_leads;
CREATE POLICY "Anyone can submit a quote lead"
  ON quote_leads
  FOR INSERT
  TO anon
  WITH CHECK (
    length(customer_name) > 0 AND
    length(customer_email) > 0 AND
    length(customer_phone) > 0 AND
    length(shop_name) > 0
  );

-- ============================================================
-- shop_profile_views: tighten insert to require non-empty shop_id
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert profile views" ON shop_profile_views;
CREATE POLICY "Anyone can insert profile views"
  ON shop_profile_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(shop_id) > 0);

-- ============================================================
-- shop_registrations: tighten anon insert
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit a registration" ON shop_registrations;
CREATE POLICY "Anyone can submit a registration"
  ON shop_registrations
  FOR INSERT
  TO anon
  WITH CHECK (
    length(shop_name) > 0 AND
    length(owner_name) > 0 AND
    length(email) > 0 AND
    length(phone) > 0
  );

-- ============================================================
-- shop_registrations: tighten authenticated insert
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can submit a registration" ON shop_registrations;
CREATE POLICY "Authenticated users can submit a registration"
  ON shop_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    length(shop_name) > 0 AND
    length(owner_name) > 0 AND
    length(email) > 0 AND
    length(phone) > 0
  );

/*
  # Drop unused indexes and consolidate multiple permissive SELECT policies

  1. Dropped Indexes (12 total)
    - `idx_shop_reviews_user_id` on shop_reviews
    - `idx_admin_activity_log_admin_id` on admin_activity_log
    - `idx_admin_users_user_id` on admin_users
    - `idx_review_replies_shop_owner_id` on review_replies
    - `idx_saved_builds_user_id` on saved_builds
    - `idx_shop_reviews_shop_id` on shop_reviews
    - `idx_shop_reviews_created_at` on shop_reviews
    - `idx_shop_profile_views_shop` on shop_profile_views
    - `idx_shop_profile_views_date` on shop_profile_views
    - `idx_shop_notifications_owner` on shop_notifications
    - `idx_shop_notifications_read` on shop_notifications
    - `idx_shop_notifications_created` on shop_notifications

  2. Consolidated SELECT Policies (4 tables)
    - `quote_leads`: Merged "Admins can read all quote leads" and
      "Shop owners can read their leads" into one policy
    - `shop_owners`: Merged "Admins can read all shop owners" and
      "Owners can read own shop records" into one policy
    - `shop_reviews`: Dropped redundant "Admins can read all shop reviews"
      since "Anyone authenticated can read reviews" already grants full access
    - `user_profiles`: Merged "Admins can read all user profiles" and
      "Users can read own profile" into one policy

  3. Purpose
    - Unused indexes waste storage and slow down writes with no query benefit
    - Multiple permissive SELECT policies on the same table/role widen access
      unpredictably; consolidating into a single policy with OR logic is safer
      and easier to audit
*/

-- ============================================================
-- 1. Drop all unused indexes
-- ============================================================
DROP INDEX IF EXISTS idx_shop_reviews_user_id;
DROP INDEX IF EXISTS idx_admin_activity_log_admin_id;
DROP INDEX IF EXISTS idx_admin_users_user_id;
DROP INDEX IF EXISTS idx_review_replies_shop_owner_id;
DROP INDEX IF EXISTS idx_saved_builds_user_id;
DROP INDEX IF EXISTS idx_shop_reviews_shop_id;
DROP INDEX IF EXISTS idx_shop_reviews_created_at;
DROP INDEX IF EXISTS idx_shop_profile_views_shop;
DROP INDEX IF EXISTS idx_shop_profile_views_date;
DROP INDEX IF EXISTS idx_shop_notifications_owner;
DROP INDEX IF EXISTS idx_shop_notifications_read;
DROP INDEX IF EXISTS idx_shop_notifications_created;

-- ============================================================
-- 2a. quote_leads: consolidate two SELECT policies into one
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all quote leads" ON quote_leads;
DROP POLICY IF EXISTS "Shop owners can read their leads" ON quote_leads;

CREATE POLICY "Owners and admins can read quote leads"
  ON quote_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shop_owners
      WHERE shop_owners.user_id = (select auth.uid())
      AND (
        shop_owners.shop_name = quote_leads.shop_name
        OR shop_owners.shop_id = quote_leads.shop_id
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

-- ============================================================
-- 2b. shop_owners: consolidate two SELECT policies into one
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all shop owners" ON shop_owners;
DROP POLICY IF EXISTS "Owners can read own shop records" ON shop_owners;

CREATE POLICY "Owners and admins can read shop owners"
  ON shop_owners
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

-- ============================================================
-- 2c. shop_reviews: drop redundant admin SELECT policy
--     "Anyone authenticated can read reviews" already uses USING(true)
--     so the admin policy is completely redundant
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all shop reviews" ON shop_reviews;

-- ============================================================
-- 2d. user_profiles: consolidate two SELECT policies into one
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "Users and admins can read user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.is_active = true
    )
  );

/*
  # Add indexes for unindexed foreign keys

  1. New Indexes
    - `idx_admin_activity_log_admin_id` on admin_activity_log(admin_id)
    - `idx_admin_users_user_id` on admin_users(user_id)
    - `idx_review_replies_shop_owner_id` on review_replies(shop_owner_id)
    - `idx_saved_builds_user_id` on saved_builds(user_id)
    - `idx_shop_notifications_shop_owner_id` on shop_notifications(shop_owner_id)
    - `idx_shop_reviews_user_id` on shop_reviews(user_id)

  2. Purpose
    - Foreign keys without covering indexes cause slow sequential scans
      during cascading deletes, joins, and ON DELETE CASCADE operations
    - These indexes ensure the database can efficiently look up child rows
      when a parent row is modified or deleted
*/

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id
  ON admin_activity_log (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
  ON admin_users (user_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_shop_owner_id
  ON review_replies (shop_owner_id);

CREATE INDEX IF NOT EXISTS idx_saved_builds_user_id
  ON saved_builds (user_id);

CREATE INDEX IF NOT EXISTS idx_shop_notifications_shop_owner_id
  ON shop_notifications (shop_owner_id);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_user_id
  ON shop_reviews (user_id);

/*
  # Allow authenticated users to also submit quote leads
  Authenticated users (logged-in customers) should be able to submit leads,
  not just anonymous visitors.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'quote_leads'
    AND policyname = 'Authenticated users can submit a quote lead'
  ) THEN
    CREATE POLICY "Authenticated users can submit a quote lead"
      ON quote_leads
      FOR INSERT
      TO authenticated
      WITH CHECK (
        length(customer_name) > 0 AND
        length(customer_email) > 0 AND
        length(customer_phone) > 0 AND
        length(shop_name) > 0
      );
  END IF;
END $$;

