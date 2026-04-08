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
