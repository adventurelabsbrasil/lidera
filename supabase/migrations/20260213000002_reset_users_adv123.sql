-- Migration: Remove all users and recreate with initial password adv123
-- Users can change password later via email (reset password flow)

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================
-- 1. DELETE user-related data (respecting FK order)
-- ============================================
DELETE FROM public.task_completions;
DELETE FROM public.lesson_progress;
DELETE FROM public.notes;
DELETE FROM public.enrollments;
DELETE FROM public.pending_invites;
DELETE FROM public.profiles;
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- ============================================
-- 2. RECREATE users (senha inicial: adv123)
-- Trigger handle_new_user creates profiles automatically
-- ============================================

-- Admin (token columns must be '' not NULL - see supabase/auth#1940)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Lidera"}', NOW(), NOW(), '', '', '', '');

-- Tenant Lidera
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('b98c8ed9-74ee-5e4b-9780-58540240696e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lidera@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Gestor Lidera"}', NOW(), NOW(), '', '', '', '');

-- Alunos (seed)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('c09d9fe0-85ff-6f5c-a891-696513517a7f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aluno@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aluno Demo"}', NOW(), NOW(), '', '', '', ''),
('d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maria.silva@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Silva"}', NOW(), NOW(), '', '', '', ''),
('e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'joao.santos@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Joao Santos"}', NOW(), NOW(), '', '', '', ''),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.oliveira@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Oliveira"}', NOW(), NOW(), '', '', '', ''),
('a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pedro.costa@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pedro Costa"}', NOW(), NOW(), '', '', '', ''),
('b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carla.lima@adventurelabs.com.br', extensions.crypt('adv123', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carla Lima"}', NOW(), NOW(), '', '', '', '');

-- Identities
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', 'a87b7dc8-63dd-4d3a-8679-4743f13f585d', 'admin@adventurelabs.com.br', '{"sub":"a87b7dc8-63dd-4d3a-8679-4743f13f585d","email":"admin@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('b98c8ed9-74ee-5e4b-9780-58540240696e', 'b98c8ed9-74ee-5e4b-9780-58540240696e', 'lidera@adventurelabs.com.br', '{"sub":"b98c8ed9-74ee-5e4b-9780-58540240696e","email":"lidera@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('c09d9fe0-85ff-6f5c-a891-696513517a7f', 'c09d9fe0-85ff-6f5c-a891-696513517a7f', 'aluno@adventurelabs.com.br', '{"sub":"c09d9fe0-85ff-6f5c-a891-696513517a7f","email":"aluno@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', 'd1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', 'maria.silva@adventurelabs.com.br', '{"sub":"d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80","email":"maria.silva@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91', 'e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91', 'joao.santos@adventurelabs.com.br', '{"sub":"e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91","email":"joao.santos@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', 'f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', 'ana.oliveira@adventurelabs.com.br', '{"sub":"f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02","email":"ana.oliveira@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13', 'a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13', 'pedro.costa@adventurelabs.com.br', '{"sub":"a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13","email":"pedro.costa@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW()),
('b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24', 'b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24', 'carla.lima@adventurelabs.com.br', '{"sub":"b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24","email":"carla.lima@adventurelabs.com.br"}', 'email', NOW(), NOW(), NOW());

-- Update profiles (trigger created them with role=student)
UPDATE public.profiles SET role = 'admin', org_id = '00000000-0000-0000-0000-000000000001' WHERE id = 'a87b7dc8-63dd-4d3a-8679-4743f13f585d';
UPDATE public.profiles SET role = 'tenant', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'b98c8ed9-74ee-5e4b-9780-58540240696e';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'c09d9fe0-85ff-6f5c-a891-696513517a7f';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'd1a0a0f1-96a0-7a6d-a9a2-7a7624628b80';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13';
UPDATE public.profiles SET role = 'student', org_id = '00000000-0000-0000-0000-000000000002' WHERE id = 'b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24';

-- Enrollments
INSERT INTO public.enrollments (user_id, course_id, status) VALUES
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000001', 'active'),
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000002', 'active'),
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000003', 'active'),
('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000004', 'active'),
('c09d9fe0-85ff-6f5c-a891-696513517a7f', '00000000-0000-0000-0001-000000000001', 'active'),
('c09d9fe0-85ff-6f5c-a891-696513517a7f', '00000000-0000-0000-0001-000000000002', 'active'),
('c09d9fe0-85ff-6f5c-a891-696513517a7f', '00000000-0000-0000-0001-000000000003', 'active'),
('c09d9fe0-85ff-6f5c-a891-696513517a7f', '00000000-0000-0000-0001-000000000004', 'active'),
('d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', '00000000-0000-0000-0001-000000000001', 'active'),
('d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', '00000000-0000-0000-0001-000000000002', 'active'),
('d1a0a0f1-96a0-7a6d-a9a2-7a7624628b80', '00000000-0000-0000-0001-000000000003', 'active'),
('e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91', '00000000-0000-0000-0001-000000000001', 'active'),
('e2b1b1a2-a7b1-8b7e-b0b3-8b8735739c91', '00000000-0000-0000-0001-000000000004', 'active'),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', '00000000-0000-0000-0001-000000000001', 'active'),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', '00000000-0000-0000-0001-000000000002', 'active'),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', '00000000-0000-0000-0001-000000000003', 'active'),
('f3c2c2b3-b8c2-9c8f-c1c4-9c984684ad02', '00000000-0000-0000-0001-000000000004', 'active'),
('a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13', '00000000-0000-0000-0001-000000000002', 'active'),
('a4d3d3c4-c9d3-0d9a-d2d5-0da95795be13', '00000000-0000-0000-0001-000000000003', 'active'),
('b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24', '00000000-0000-0000-0001-000000000001', 'active'),
('b5e4e4d5-d0e4-1e0b-e3e6-1eba6086cf24', '00000000-0000-0000-0001-000000000004', 'active');
