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
