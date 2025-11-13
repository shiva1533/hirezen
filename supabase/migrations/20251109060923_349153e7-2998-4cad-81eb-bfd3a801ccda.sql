-- Add location hierarchy fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zone text,
ADD COLUMN IF NOT EXISTS branch text;

-- Add comments for clarity
COMMENT ON COLUMN public.jobs.state IS 'State selection from India states';
COMMENT ON COLUMN public.jobs.zone IS 'Zone/District based on selected state';
COMMENT ON COLUMN public.jobs.branch IS 'Branch/Village based on selected zone';
