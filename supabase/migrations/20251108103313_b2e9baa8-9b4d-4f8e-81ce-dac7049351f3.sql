-- Update RLS policies to allow public access to jobs table
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins and HR staff can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins and HR staff can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins and HR staff can delete jobs" ON public.jobs;

-- Create new public access policies
CREATE POLICY "Public can view jobs"
ON public.jobs
FOR SELECT
USING (true);

CREATE POLICY "Public can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update jobs"
ON public.jobs
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete jobs"
ON public.jobs
FOR DELETE
USING (true);