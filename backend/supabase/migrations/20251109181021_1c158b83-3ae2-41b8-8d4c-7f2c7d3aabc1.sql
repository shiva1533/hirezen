-- Allow public read access to candidates table
DROP POLICY IF EXISTS "Admins and recruiters can view all candidates" ON public.candidates;

CREATE POLICY "Anyone can view candidates"
ON public.candidates
FOR SELECT
USING (true);

-- Allow public read access to jobs table
DROP POLICY IF EXISTS "Public can view published jobs" ON public.jobs;

CREATE POLICY "Public can view all jobs"
ON public.jobs
FOR SELECT
USING (true);

-- Allow public read access to candidate_change_logs
DROP POLICY IF EXISTS "admins_recruiters_can_view_change_logs" ON public.candidate_change_logs;

CREATE POLICY "Anyone can view change logs"
ON public.candidate_change_logs
FOR SELECT
USING (true);

-- Allow public read access to pipeline_activity_logs (already has public access)
-- No changes needed for pipeline_activity_logs

-- Allow public read access to AI interviews
DROP POLICY IF EXISTS "Admins and recruiters can view all interviews" ON public.ai_interviews;

CREATE POLICY "Anyone can view interviews"
ON public.ai_interviews
FOR SELECT
USING (true);