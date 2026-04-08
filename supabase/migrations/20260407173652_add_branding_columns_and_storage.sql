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
