-- Update RLS policy to allow all authenticated users to view job templates
DROP POLICY IF EXISTS "Admins and recruiters can view job templates" ON job_templates;

CREATE POLICY "Authenticated users can view job templates"
  ON job_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Keep the existing insert/update/delete policies for admins and recruiters
-- These remain unchanged and still require proper roles