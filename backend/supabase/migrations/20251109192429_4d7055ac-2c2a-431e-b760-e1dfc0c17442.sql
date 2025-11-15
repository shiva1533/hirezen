-- Disable Row Level Security on job_templates table
-- WARNING: This makes the table publicly accessible to anyone
ALTER TABLE job_templates DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view job templates" ON job_templates;
DROP POLICY IF EXISTS "Recruiters and admins can create templates" ON job_templates;
DROP POLICY IF EXISTS "Recruiters and admins can update templates" ON job_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON job_templates;