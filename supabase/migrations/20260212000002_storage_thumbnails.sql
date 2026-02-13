-- Migration: Storage bucket for course thumbnails
-- Public bucket for cover images; tenant/admin can upload

-- Create course-thumbnails bucket (public read, 5MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow tenant/admin to upload to course-thumbnails
CREATE POLICY "Tenants and admins can upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND public.is_tenant_or_admin()
);

-- Allow tenant/admin to update their uploads
CREATE POLICY "Tenants and admins can update thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND public.is_tenant_or_admin()
);

-- Allow tenant/admin to delete thumbnails
CREATE POLICY "Tenants and admins can delete thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND public.is_tenant_or_admin()
);
