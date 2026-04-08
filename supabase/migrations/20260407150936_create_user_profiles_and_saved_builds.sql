/*
  # Create user profiles and saved builds tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text) - user's display name
      - `email` (text) - user's email
      - `created_at` (timestamptz) - account creation time
    - `saved_builds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles) - build owner
      - `name` (text) - user-given build name
      - `car` (text) - car model
      - `wrap` (text) - wrap selection
      - `wheels` (text) - wheel selection
      - `tint` (text) - tint selection
      - `exhaust` (text) - exhaust selection
      - `car_index` (integer) - index for restoring state
      - `wrap_index` (integer) - index for restoring state
      - `wheel_index` (integer) - index for restoring state
      - `tint_index` (integer) - index for restoring state
      - `thumbnail_url` (text) - optional screenshot thumbnail
      - `created_at` (timestamptz) - when build was saved

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS saved_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Build',
  car text NOT NULL,
  wrap text NOT NULL,
  wheels text NOT NULL,
  tint text NOT NULL,
  exhaust text NOT NULL,
  car_index integer NOT NULL DEFAULT 0,
  wrap_index integer NOT NULL DEFAULT 0,
  wheel_index integer NOT NULL DEFAULT 0,
  tint_index integer NOT NULL DEFAULT 0,
  thumbnail_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own builds"
  ON saved_builds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own builds"
  ON saved_builds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds"
  ON saved_builds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own builds"
  ON saved_builds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
