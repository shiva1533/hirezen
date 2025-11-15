-- Temporary policy to allow candidate inserts during development
-- TODO: Replace with proper authentication and role-based access control
CREATE POLICY "temp_allow_candidate_inserts_dev"
ON candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Fix experience_years column to accept decimal values (0.25 years = 3 months, etc.)
ALTER TABLE candidates 
ALTER COLUMN experience_years TYPE numeric USING experience_years::numeric;