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
