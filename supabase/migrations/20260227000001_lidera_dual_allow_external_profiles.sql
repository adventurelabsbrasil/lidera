-- Optional: run this migration only on the Lidera project when using dual Supabase
-- (Adventure = Auth, Lidera = Database). Allows inserting profiles for user IDs
-- that exist in Adventure auth but not in Lidera auth.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
