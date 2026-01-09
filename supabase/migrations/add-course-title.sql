-- ================================================
-- ADD COURSE TITLE FIELD
-- ================================================
-- Run this in Supabase SQL Editor
-- ================================================

-- Add title column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add a default value for existing courses
UPDATE courses 
SET title = 'دورة غراس لمدة 10 أيام'
WHERE title IS NULL;

-- Make title NOT NULL after setting defaults
ALTER TABLE courses 
ALTER COLUMN title SET NOT NULL;

-- Add comment
COMMENT ON COLUMN courses.title IS 'عنوان الدورة';

-- Verify the change
SELECT id, title, start_date, end_date, active 
FROM courses 
ORDER BY created_at DESC;
