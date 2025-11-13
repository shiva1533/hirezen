-- Add new fields to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS primary_locations TEXT,
ADD COLUMN IF NOT EXISTS secondary_locations TEXT,
ADD COLUMN IF NOT EXISTS reference_no TEXT,
ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closing_time TEXT;