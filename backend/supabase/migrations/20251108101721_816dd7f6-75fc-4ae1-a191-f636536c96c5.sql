-- Add include_other_locations field to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS include_other_locations BOOLEAN DEFAULT false;