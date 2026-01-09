-- ================================================
-- Ghras Course Enrollment System - Database Setup
-- ================================================
-- Run this entire script in Supabase SQL Editor
-- Created: January 9, 2026
-- ================================================

-- ================================================
-- 1. CREATE TABLES
-- ================================================

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Daily Attendances Table
CREATE TABLE IF NOT EXISTS daily_attendances (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 10),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, day_number)
);

-- ================================================
-- 2. CREATE INDEXES
-- ================================================

-- Courses Indexes
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_courses_dates ON courses(start_date, end_date);

-- Enrollments Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);

-- Daily Attendances Indexes
CREATE INDEX IF NOT EXISTS idx_daily_attendances_enrollment ON daily_attendances(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendances_day ON daily_attendances(day_number);

-- ================================================
-- 3. ADD COMMENTS
-- ================================================

-- Courses Comments
COMMENT ON TABLE courses IS 'غراس 10-day courses';
COMMENT ON COLUMN courses.start_date IS 'Course start date (Day 1)';
COMMENT ON COLUMN courses.end_date IS 'Course end date (Day 10)';
COMMENT ON COLUMN courses.active IS 'Only one course should be active at a time';

-- Enrollments Comments
COMMENT ON TABLE enrollments IS 'Student enrollments for courses';
COMMENT ON COLUMN enrollments.user_id IS 'Supabase Auth user ID';
COMMENT ON COLUMN enrollments.full_name IS 'Student full name in Arabic';

-- Daily Attendances Comments
COMMENT ON TABLE daily_attendances IS 'Daily attendance records for enrolled students';
COMMENT ON COLUMN daily_attendances.day_number IS 'Day number (1-10)';
COMMENT ON COLUMN daily_attendances.signed_at IS 'Timestamp when student signed attendance';

-- ================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendances ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 5. CREATE RLS POLICIES - COURSES
-- ================================================

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;

-- Allow everyone to view courses
CREATE POLICY "Anyone can view active courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to manage courses (customize for admin-only later)
CREATE POLICY "Admins can manage courses"
ON courses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 6. CREATE RLS POLICIES - ENROLLMENTS
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollment" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own enrollment
CREATE POLICY "Users can create their own enrollment"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow admins/system to view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (true);

-- ================================================
-- 7. CREATE RLS POLICIES - DAILY ATTENDANCES
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own attendance" ON daily_attendances;
DROP POLICY IF EXISTS "Users can sign their own attendance" ON daily_attendances;
DROP POLICY IF EXISTS "Admins can view all attendances" ON daily_attendances;

-- Users can view their own attendance
CREATE POLICY "Users can view their own attendance"
ON daily_attendances FOR SELECT
TO authenticated
USING (
    enrollment_id IN (
        SELECT id FROM enrollments WHERE user_id = auth.uid()
    )
);

-- Users can sign their own attendance
CREATE POLICY "Users can sign their own attendance"
ON daily_attendances FOR INSERT
TO authenticated
WITH CHECK (
    enrollment_id IN (
        SELECT id FROM enrollments WHERE user_id = auth.uid()
    )
);

-- Allow admins to view all attendances
CREATE POLICY "Admins can view all attendances"
ON daily_attendances FOR SELECT
TO authenticated
USING (true);

-- ================================================
-- 8. VERIFICATION QUERIES (Optional - for testing)
-- ================================================

-- Uncomment to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Uncomment to verify indexes were created:
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Uncomment to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- Next steps:
-- 1. Verify all tables appear in Supabase Table Editor
-- 2. Check Authentication > Providers: Enable Email
-- 3. Update .env file with your Supabase credentials
-- 4. Run: pnpm dev
-- 5. Test the application!
-- ================================================
