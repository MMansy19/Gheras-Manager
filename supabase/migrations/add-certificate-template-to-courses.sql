-- Add certificate_template_url column to courses table
-- This allows each course to have its own certificate template PDF

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS certificate_template_url TEXT;

-- Add comment
COMMENT ON COLUMN courses.certificate_template_url IS 'URL to the certificate template PDF file stored in Supabase Storage';

-- Optional: Set a default template for existing courses
-- UPDATE courses SET certificate_template_url = '/certificate.pdf' WHERE certificate_template_url IS NULL;
