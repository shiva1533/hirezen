-- Add other information fields to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS segments TEXT,
ADD COLUMN IF NOT EXISTS priority_level TEXT,
ADD COLUMN IF NOT EXISTS billing_rate TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS salary_min TEXT,
ADD COLUMN IF NOT EXISTS salary_max TEXT,
ADD COLUMN IF NOT EXISTS expected_qualification TEXT,
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS mode_of_work TEXT;