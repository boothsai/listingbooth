-- 1. Create OR Alter User Profiles Table
CREATE TABLE IF NOT EXISTS core_logic.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely append ListingBooth-specific fields to the preexisting CRM table
ALTER TABLE core_logic.user_profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS vow_terms_accepted_at TIMESTAMPTZ;

-- 2. Configure RLS (Row Level Security)
ALTER TABLE core_logic.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON core_logic.user_profiles;
CREATE POLICY "Users can view own profile" 
ON core_logic.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (e.g. accepting VOW terms)
DROP POLICY IF EXISTS "Users can update own profile" ON core_logic.user_profiles;
CREATE POLICY "Users can update own profile" 
ON core_logic.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow the backend service role to bypass RLS (auto-inserted by Trigger)
DROP POLICY IF EXISTS "Service Role can bypass RLS" ON core_logic.user_profiles;
CREATE POLICY "Service Role can bypass RLS"
ON core_logic.user_profiles FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO core_logic.user_profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
