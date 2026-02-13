-- Migration: Backfill profiles for auth.users without a profile
-- Fixes users who signed up before the trigger existed or when trigger failed

-- Insert profiles for any auth.users that don't have one (runs as migration user, bypasses RLS)
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url',
  'student'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
