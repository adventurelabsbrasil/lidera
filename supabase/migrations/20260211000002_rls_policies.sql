-- Migration: Row Level Security Policies
-- Multi-tenant access control for Lidera Learning Platform

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS get_user_org_id();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_tenant_or_admin();

-- Get current user's role
CREATE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is tenant or admin
CREATE OR REPLACE FUNCTION is_tenant_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'tenant')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Admins can see all organizations
CREATE POLICY "Admins can view all organizations"
    ON organizations FOR SELECT
    TO authenticated
    USING (is_admin());

-- Tenants and students can see their own organization
CREATE POLICY "Users can view their organization"
    ON organizations FOR SELECT
    TO authenticated
    USING (id = get_user_org_id());

-- Only admins can create organizations
CREATE POLICY "Admins can create organizations"
    ON organizations FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Only admins can update organizations
CREATE POLICY "Admins can update organizations"
    ON organizations FOR UPDATE
    TO authenticated
    USING (is_admin());

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin());

-- Tenants can view profiles in their org
CREATE POLICY "Tenants can view org profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        org_id = get_user_org_id() 
        AND get_user_role() IN ('admin', 'tenant')
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND (role = (SELECT role FROM profiles WHERE id = auth.uid()) OR is_admin())
    );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (is_admin() OR id = auth.uid());

-- Tenants can insert student profiles in their org
CREATE POLICY "Tenants can insert student profiles"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (
        is_tenant_or_admin()
        AND org_id = get_user_org_id()
        AND role = 'student'
    );

-- ============================================
-- COURSES POLICIES
-- ============================================

-- Students can view published courses they're enrolled in
CREATE POLICY "Students can view enrolled courses"
    ON courses FOR SELECT
    TO authenticated
    USING (
        published = true 
        AND EXISTS (
            SELECT 1 FROM enrollments 
            WHERE enrollments.course_id = courses.id 
            AND enrollments.user_id = auth.uid()
            AND enrollments.status = 'active'
        )
    );

-- Tenants can view all courses in their org
CREATE POLICY "Tenants can view org courses"
    ON courses FOR SELECT
    TO authenticated
    USING (
        org_id = get_user_org_id() 
        AND get_user_role() IN ('admin', 'tenant')
    );

-- Admins can view all courses
CREATE POLICY "Admins can view all courses"
    ON courses FOR SELECT
    TO authenticated
    USING (is_admin());

-- Tenants can create courses in their org
CREATE POLICY "Tenants can create courses"
    ON courses FOR INSERT
    TO authenticated
    WITH CHECK (
        is_tenant_or_admin()
        AND (org_id = get_user_org_id() OR is_admin())
    );

-- Tenants can update courses in their org
CREATE POLICY "Tenants can update courses"
    ON courses FOR UPDATE
    TO authenticated
    USING (
        org_id = get_user_org_id() 
        AND is_tenant_or_admin()
    );

-- Tenants can delete courses in their org
CREATE POLICY "Tenants can delete courses"
    ON courses FOR DELETE
    TO authenticated
    USING (
        org_id = get_user_org_id() 
        AND is_tenant_or_admin()
    );

-- ============================================
-- MODULES POLICIES
-- ============================================

-- Users can view modules of courses they have access to
CREATE POLICY "Users can view accessible modules"
    ON modules FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = modules.course_id
            AND (
                -- Is enrolled
                EXISTS (
                    SELECT 1 FROM enrollments 
                    WHERE enrollments.course_id = courses.id 
                    AND enrollments.user_id = auth.uid()
                    AND enrollments.status = 'active'
                )
                -- Or is tenant/admin of the org
                OR (courses.org_id = get_user_org_id() AND is_tenant_or_admin())
                -- Or is global admin
                OR is_admin()
            )
        )
    );

-- Tenants can manage modules
CREATE POLICY "Tenants can manage modules"
    ON modules FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = modules.course_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- LESSONS POLICIES
-- ============================================

-- Users can view lessons of courses they have access to
CREATE POLICY "Users can view accessible lessons"
    ON lessons FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM modules
            JOIN courses ON courses.id = modules.course_id
            WHERE modules.id = lessons.module_id
            AND (
                EXISTS (
                    SELECT 1 FROM enrollments 
                    WHERE enrollments.course_id = courses.id 
                    AND enrollments.user_id = auth.uid()
                    AND enrollments.status = 'active'
                )
                OR (courses.org_id = get_user_org_id() AND is_tenant_or_admin())
                OR is_admin()
            )
        )
    );

-- Tenants can manage lessons
CREATE POLICY "Tenants can manage lessons"
    ON lessons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM modules
            JOIN courses ON courses.id = modules.course_id
            WHERE modules.id = lessons.module_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- RESOURCES POLICIES
-- ============================================

-- Users can view resources of accessible lessons
CREATE POLICY "Users can view accessible resources"
    ON resources FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE lessons.id = resources.lesson_id
            AND (
                EXISTS (
                    SELECT 1 FROM enrollments 
                    WHERE enrollments.course_id = courses.id 
                    AND enrollments.user_id = auth.uid()
                    AND enrollments.status = 'active'
                )
                OR (courses.org_id = get_user_org_id() AND is_tenant_or_admin())
                OR is_admin()
            )
        )
    );

-- Tenants can manage resources
CREATE POLICY "Tenants can manage resources"
    ON resources FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE lessons.id = resources.lesson_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Similar to resources
CREATE POLICY "Users can view accessible tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE lessons.id = tasks.lesson_id
            AND (
                EXISTS (
                    SELECT 1 FROM enrollments 
                    WHERE enrollments.course_id = courses.id 
                    AND enrollments.user_id = auth.uid()
                    AND enrollments.status = 'active'
                )
                OR (courses.org_id = get_user_org_id() AND is_tenant_or_admin())
                OR is_admin()
            )
        )
    );

CREATE POLICY "Tenants can manage tasks"
    ON tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE lessons.id = tasks.lesson_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- ENROLLMENTS POLICIES
-- ============================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Tenants can view enrollments for their courses
CREATE POLICY "Tenants can view course enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = enrollments.course_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (is_admin());

-- Tenants can manage enrollments for their courses
CREATE POLICY "Tenants can manage enrollments"
    ON enrollments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = enrollments.course_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- TASK COMPLETIONS POLICIES
-- ============================================

-- Users can view and manage their own completions
CREATE POLICY "Users can manage own task completions"
    ON task_completions FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Tenants can view completions in their courses
CREATE POLICY "Tenants can view task completions"
    ON task_completions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN lessons ON lessons.id = tasks.lesson_id
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE tasks.id = task_completions.task_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- LESSON PROGRESS POLICIES
-- ============================================

-- Users can manage their own progress
CREATE POLICY "Users can manage own lesson progress"
    ON lesson_progress FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Tenants can view progress in their courses
CREATE POLICY "Tenants can view lesson progress"
    ON lesson_progress FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN courses ON courses.id = modules.course_id
            WHERE lessons.id = lesson_progress.lesson_id
            AND courses.org_id = get_user_org_id()
            AND is_tenant_or_admin()
        )
    );

-- ============================================
-- NOTES POLICIES
-- ============================================

-- Users can manage their own notes
CREATE POLICY "Users can manage own notes"
    ON notes FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
