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
