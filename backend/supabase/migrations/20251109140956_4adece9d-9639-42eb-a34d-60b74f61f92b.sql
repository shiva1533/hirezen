-- Add 'recruiter' role to the app_role enum
-- This must be done in a separate migration before using it in policies
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'recruiter';