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
