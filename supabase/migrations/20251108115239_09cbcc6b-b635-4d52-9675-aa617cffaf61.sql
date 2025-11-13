-- Make job_id nullable in candidates table to allow uploading candidates without immediate job assignment
ALTER TABLE public.candidates
ALTER COLUMN job_id DROP NOT NULL;

-- Add a comment explaining this design decision
COMMENT ON COLUMN public.candidates.job_id IS 'Optional reference to a job position. Candidates can be uploaded without a job assignment and matched later.';