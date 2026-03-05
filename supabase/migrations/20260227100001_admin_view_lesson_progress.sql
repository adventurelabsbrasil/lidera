-- Allow admins to view all lesson_progress (for access/analytics page)
DROP POLICY IF EXISTS "Admins can view all lesson progress" ON lesson_progress;
CREATE POLICY "Admins can view all lesson progress"
    ON lesson_progress FOR SELECT
    TO authenticated
    USING (is_admin());
