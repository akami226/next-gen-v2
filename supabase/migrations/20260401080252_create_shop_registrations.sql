/*
  # Create shop_registrations table

  1. New Tables
    - `shop_registrations`
      - `id` (uuid, primary key)
      - `shop_name` (text, not null) - Name of the shop
      - `owner_name` (text, not null) - Full name of the shop owner
      - `email` (text, unique, not null) - Business email address
      - `phone` (text, not null) - Phone number
      - `street_address` (text, not null) - Street address
      - `city` (text, not null) - City
      - `state` (text, not null) - US state
      - `zip` (text, not null) - Zip code
      - `services` (text[], not null, default '{}') - Array of services offered
      - `logo_file_name` (text) - Name of uploaded logo file
      - `bio` (text, default '') - Short bio, max 200 characters
      - `created_at` (timestamptz, default now()) - When the registration was submitted

  2. Security
    - Enable RLS on `shop_registrations` table
    - Add INSERT policy allowing anonymous users to submit registrations
      (public registration form, no auth required)
    - No SELECT/UPDATE/DELETE policies for anon - data is admin-only after submission
*/

CREATE TABLE IF NOT EXISTS shop_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  owner_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  logo_file_name text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a registration"
  ON shop_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);
