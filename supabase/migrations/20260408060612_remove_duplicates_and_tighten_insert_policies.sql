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
