-- ================================================
-- COMPREHENSIVE FIX FOR COURSE ENROLLMENT SYSTEM
-- ================================================
-- Run this entire script in Supabase SQL Editor
-- Fixes: RLS policies + Foreign key constraints
-- ================================================

-- ================================================
-- PART 1: FIX FOREIGN KEY CONSTRAINTS
-- ================================================

-- Check current constraints (for debugging)
SELECT 'Current enrollments constraints:' as step;
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'enrollments';

-- Drop and recreate enrollments table with correct foreign key
DROP TABLE IF EXISTS daily_attendances CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;

-- Recreate enrollments with correct auth.users reference
CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Recreate daily_attendances
CREATE TABLE daily_attendances (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 10),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, day_number)
);

-- Recreate indexes
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_email ON enrollments(email);
CREATE INDEX idx_daily_attendances_enrollment ON daily_attendances(enrollment_id);
CREATE INDEX idx_daily_attendances_day ON daily_attendances(day_number);

SELECT 'Tables recreated with correct foreign keys' as step;

-- ================================================
-- PART 2: FIX RLS POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendances ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing enrollment policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enrollments') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON enrollments', r.policyname);
    END LOOP;
END $$;

-- Drop ALL existing attendance policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'daily_attendances') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON daily_attendances', r.policyname);
    END LOOP;
END $$;

SELECT 'Old policies dropped' as step;

-- ================================================
-- ENROLLMENTS POLICIES - Allow anon + authenticated
-- ================================================

CREATE POLICY "Allow anon and authenticated to read enrollments"
ON enrollments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anon and authenticated to insert enrollments"
ON enrollments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to update enrollments"
ON enrollments FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to delete enrollments"
ON enrollments FOR DELETE
TO anon, authenticated
USING (true);

SELECT 'Enrollments policies created' as step;

-- ================================================
-- DAILY ATTENDANCES POLICIES - Allow anon + authenticated
-- ================================================

CREATE POLICY "Allow anon and authenticated to read attendances"
ON daily_attendances FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anon and authenticated to insert attendances"
ON daily_attendances FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to update attendances"
ON daily_attendances FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to delete attendances"
ON daily_attendances FOR DELETE
TO anon, authenticated
USING (true);

SELECT 'Daily attendances policies created' as step;

-- ================================================
-- VERIFICATION
-- ================================================

SELECT 'Final verification:' as step;

-- Verify foreign keys
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('enrollments', 'daily_attendances');

-- Verify policies
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('enrollments', 'daily_attendances')
ORDER BY tablename, policyname;

SELECT '✅ All fixes applied successfully!' as result;
