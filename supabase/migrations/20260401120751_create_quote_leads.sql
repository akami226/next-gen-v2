/*
  # Create quote_leads table for lead generation

  1. New Tables
    - `quote_leads`
      - `id` (uuid, primary key) - unique lead identifier
      - `shop_name` (text, not null) - name of the shop quoted
      - `shop_location` (text, not null) - city/state of the shop
      - `customer_name` (text, not null) - customer full name
      - `customer_email` (text, not null) - customer email address
      - `customer_phone` (text, not null) - customer phone number
      - `customer_city` (text, not null) - customer city and state
      - `contact_time` (text, not null, default 'Anytime') - preferred contact time
      - `notes` (text, default '') - additional notes from customer
      - `car_config` (jsonb, not null) - full vehicle configuration snapshot
      - `status` (text, not null, default 'pending') - lead status
      - `created_at` (timestamptz, default now()) - submission timestamp

  2. Security
    - Enable RLS on `quote_leads` table
    - Add INSERT policy allowing anonymous users to submit leads (public form)
    - No SELECT/UPDATE/DELETE policies for anonymous users (leads are shop-facing data)
*/

CREATE TABLE IF NOT EXISTS quote_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  shop_location text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_city text NOT NULL,
  contact_time text NOT NULL DEFAULT 'Anytime',
  notes text DEFAULT '',
  car_config jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote lead"
  ON quote_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
