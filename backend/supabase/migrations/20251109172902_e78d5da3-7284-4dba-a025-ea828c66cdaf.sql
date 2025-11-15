-- Drop any conflicting policies first
DROP POLICY IF EXISTS "temp_allow_candidate_inserts_dev" ON candidates;
DROP POLICY IF EXISTS "Service role can insert candidates" ON candidates;

-- Create new permissive policy for development that allows anyone to insert
CREATE POLICY "allow_anon_insert_candidates_dev"
ON candidates
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users
CREATE POLICY "allow_authenticated_insert_candidates_dev"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (true);