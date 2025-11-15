-- Add skills column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS skills text;