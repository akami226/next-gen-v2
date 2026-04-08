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
