-- Fix RLS policies for enrollments table to allow student registration
-- This allows both anon (for duplicate checks) and authenticated users (for creating enrollments)

-- Drop ALL existing enrollment policies dynamically
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enrollments') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON enrollments', r.policyname);
    END LOOP;
END $$;

-- Create new policies that allow both anon and authenticated users
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

-- Verify RLS is enabled
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Display current policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'enrollments';
