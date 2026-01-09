-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update certificate templates" ON storage.objects;

-- Policy 1: Allow public read access to certificate templates
CREATE POLICY "Public read access for certificate templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificate-templates');

-- Policy 2: Allow authenticated users to upload certificate templates
CREATE POLICY "Authenticated users can upload certificate templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificate-templates');

-- Policy 3: Allow authenticated users to delete certificate templates
CREATE POLICY "Authenticated users can delete certificate templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificate-templates');

-- Policy 4: Allow authenticated users to update certificate templates
CREATE POLICY "Authenticated users can update certificate templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificate-templates')
WITH CHECK (bucket_id = 'certificate-templates');

-- Note: The admin panel uses password authentication (VITE_ADMIN_PASSWORD in .env)
-- Anyone authenticated via the admin password can upload/manage templates