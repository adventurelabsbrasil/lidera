-- Migration: Pending invites and helper functions
-- Allows tenants to invite users by email before they sign up

-- ============================================
-- PENDING INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pending_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    course_ids UUID[] NOT NULL DEFAULT '{}',
    full_name VARCHAR(255),
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON pending_invites(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_pending_invites_org ON pending_invites(org_id);

-- RLS
ALTER TABLE pending_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants can manage pending invites for their org" ON pending_invites;
CREATE POLICY "Tenants can manage pending invites for their org"
    ON pending_invites FOR ALL
    TO authenticated
    USING (
        org_id = get_user_org_id()
        AND is_tenant_or_admin()
    )
    WITH CHECK (
        org_id = get_user_org_id()
        AND is_tenant_or_admin()
    );

-- Tenants can update student profiles when enrolling (set org_id, full_name)
DROP POLICY IF EXISTS "Tenants can update student profiles on enroll" ON profiles;
CREATE POLICY "Tenants can update student profiles on enroll"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        role = 'student'
        AND (org_id IS NULL OR org_id = get_user_org_id())
        AND is_tenant_or_admin()
    )
    WITH CHECK (
        org_id = get_user_org_id()
        AND role = 'student'
    );

-- ============================================
-- HELPER: Find user id by email (for enrollment)
-- Returns id if profile exists, null otherwise.
-- Only callable by tenant/admin.
-- ============================================
CREATE OR REPLACE FUNCTION find_user_id_by_email(p_email TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF NOT is_tenant_or_admin() THEN
        RETURN NULL;
    END IF;

    SELECT id INTO v_user_id
    FROM profiles
    WHERE LOWER(email) = LOWER(TRIM(p_email))
    LIMIT 1;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Process pending invites when user signs up
-- Call with the new user's id. Matches by email.
-- ============================================
CREATE OR REPLACE FUNCTION process_pending_invites(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_email TEXT;
    v_invite RECORD;
BEGIN
    -- Get user email from profile (just created by trigger)
    SELECT email INTO v_email
    FROM profiles
    WHERE id = p_user_id;

    IF v_email IS NULL THEN
        RETURN;
    END IF;

    -- Process each matching invite
    FOR v_invite IN
        SELECT id, org_id, course_ids, full_name
        FROM pending_invites
        WHERE LOWER(email) = LOWER(v_email)
    LOOP
        -- Update profile with org_id and full_name if provided
        UPDATE profiles
        SET org_id = v_invite.org_id,
            full_name = COALESCE(NULLIF(TRIM(profiles.full_name), ''), v_invite.full_name)
        WHERE id = p_user_id;

        -- Create enrollments
        INSERT INTO enrollments (user_id, course_id, status)
        SELECT p_user_id, unnest(v_invite.course_ids), 'active'
        ON CONFLICT (user_id, course_id) DO NOTHING;

        -- Remove processed invite
        DELETE FROM pending_invites WHERE id = v_invite.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
