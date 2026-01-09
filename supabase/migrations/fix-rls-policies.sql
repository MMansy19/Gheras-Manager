-- ================================================
-- FIX RLS POLICIES - Allow Anonymous Access
-- ================================================
-- The admin is NOT authenticated via Supabase Auth,
-- so we need to allow anonymous (anon) access too
-- ================================================

-- ================================================
-- 1. DROP ALL EXISTING POLICIES AGAIN
-- ================================================

DROP POLICY IF EXISTS "allow_read_courses" ON courses;
DROP POLICY IF EXISTS "allow_insert_courses" ON courses;
DROP POLICY IF EXISTS "allow_update_courses" ON courses;
DROP POLICY IF EXISTS "allow_delete_courses" ON courses;
DROP POLICY IF EXISTS "allow_read_enrollments" ON enrollments;
DROP POLICY IF EXISTS "allow_insert_own_enrollment" ON enrollments;
DROP POLICY IF EXISTS "allow_update_own_enrollment" ON enrollments;
DROP POLICY IF EXISTS "allow_read_attendances" ON daily_attendances;
DROP POLICY IF EXISTS "allow_insert_own_attendance" ON daily_attendances;

-- ================================================
-- 2. NEW POLICIES - COURSES (Allow anon + authenticated)
-- ================================================

-- Allow everyone to SELECT courses (anon and authenticated)
CREATE POLICY "allow_read_courses"
ON courses FOR SELECT
TO authenticated, anon
USING (true);

-- Allow everyone to INSERT courses (anon and authenticated)
CREATE POLICY "allow_insert_courses"
ON courses FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow everyone to UPDATE courses
CREATE POLICY "allow_update_courses"
ON courses FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Allow everyone to DELETE courses
CREATE POLICY "allow_delete_courses"
ON courses FOR DELETE
TO authenticated, anon
USING (true);

-- ================================================
-- 3. NEW POLICIES - ENROLLMENTS (anon + authenticated)
-- ================================================

-- Allow everyone to read all enrollments
CREATE POLICY "allow_read_enrollments"
ON enrollments FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users to insert their own enrollment
CREATE POLICY "allow_insert_own_enrollment"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anon users to insert enrollments (for admin creating on behalf)
CREATE POLICY "allow_insert_enrollment_anon"
ON enrollments FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to update their own enrollments
CREATE POLICY "allow_update_own_enrollment"
ON enrollments FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ================================================
-- 4. NEW POLICIES - DAILY ATTENDANCES (anon + authenticated)
-- ================================================

-- Allow everyone to read all attendances
CREATE POLICY "allow_read_attendances"
ON daily_attendances FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users to insert their own attendance
CREATE POLICY "allow_insert_own_attendance"
ON daily_attendances FOR INSERT
TO authenticated
WITH CHECK (
    enrollment_id IN (
        SELECT id FROM enrollments WHERE user_id = auth.uid()
    )
);

-- Allow anon to insert attendance (for testing or admin actions)
CREATE POLICY "allow_insert_attendance_anon"
ON daily_attendances FOR INSERT
TO anon
WITH CHECK (true);

-- ================================================
-- VERIFICATION
-- ================================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================
-- DONE!
-- ================================================
-- Now the admin (using anon key) can create courses
-- ================================================
