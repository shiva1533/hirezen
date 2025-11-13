-- Remove temporary development policies that allow unrestricted access
DROP POLICY IF EXISTS "allow_anon_insert_candidates_dev" ON candidates;
DROP POLICY IF EXISTS "allow_authenticated_insert_candidates_dev" ON candidates;
DROP POLICY IF EXISTS "Service role can insert templates for testing" ON job_templates;

-- Keep only the secure production policies:
-- 1. Admins and recruiters can view all candidates (already exists)
-- 2. Admins and recruiters can update candidates (already exists)
-- 3. Admins can delete candidates (already exists)

-- Add secure INSERT policy: Only users with admin or recruiter roles can insert candidates
CREATE POLICY "admins_recruiters_can_insert_candidates"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recruiter'::app_role)
);

-- Remove the temporary policy from job_templates too
DROP POLICY IF EXISTS "temp_allow_candidate_inserts_dev" ON candidates;