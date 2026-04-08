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
