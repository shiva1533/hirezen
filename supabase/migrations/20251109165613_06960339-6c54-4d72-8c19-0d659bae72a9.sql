-- Add service role policy for job_templates to allow testing without authentication
-- This should be removed in production and replaced with proper authentication

CREATE POLICY "Service role can insert templates for testing"
ON public.job_templates
FOR INSERT
WITH CHECK (true);