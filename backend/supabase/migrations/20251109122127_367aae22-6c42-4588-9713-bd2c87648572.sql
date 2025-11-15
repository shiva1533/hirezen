-- Add interview_questions column to jobs table to store custom uploaded questions
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS interview_questions jsonb;