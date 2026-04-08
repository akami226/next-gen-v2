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
