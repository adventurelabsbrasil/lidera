-- Setup admin profile for Lidera Learning Platform
-- Run in Supabase SQL Editor after user has signed up

-- Option 1: Update by email (replace with your email)
UPDATE profiles
SET role = 'admin', org_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@adventurelabs.com.br';

-- Option 2: Update by user ID (replace with your profile id from auth.users)
-- UPDATE profiles
-- SET role = 'admin', org_id = '00000000-0000-0000-0000-000000000001'
-- WHERE id = 'YOUR_USER_ID_HERE';
