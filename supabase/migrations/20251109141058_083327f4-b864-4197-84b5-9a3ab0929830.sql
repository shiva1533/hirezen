-- ============================================
-- CLEAN UP ALL EXISTING RLS POLICIES
-- ============================================

-- CANDIDATES TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Candidates are viewable by everyone" ON public.candidates;
DROP POLICY IF EXISTS "Anyone can create candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anyone can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anyone can delete candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admins and recruiters can view all candidates" ON public.candidates;
DROP POLICY IF EXISTS "Service role can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admins and recruiters can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admins can delete candidates" ON public.candidates;

-- AI_INTERVIEWS TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view interview by token" ON public.ai_interviews;
DROP POLICY IF EXISTS "Anyone can update interview by token" ON public.ai_interviews;
DROP POLICY IF EXISTS "Authenticated users can insert interviews" ON public.ai_interviews;
DROP POLICY IF EXISTS "Admins and recruiters can view all interviews" ON public.ai_interviews;
DROP POLICY IF EXISTS "Service role can insert interviews" ON public.ai_interviews;
DROP POLICY IF EXISTS "Service role can update interviews" ON public.ai_interviews;

-- JOBS TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Public can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can view published jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins and recruiters can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters and admins can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters and admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;

-- JOB_TEMPLATES TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Job templates are viewable by everyone" ON public.job_templates;
DROP POLICY IF EXISTS "Anyone can create job templates" ON public.job_templates;
DROP POLICY IF EXISTS "Anyone can update job templates" ON public.job_templates;
DROP POLICY IF EXISTS "Anyone can delete job templates" ON public.job_templates;
DROP POLICY IF EXISTS "Admins and recruiters can view job templates" ON public.job_templates;
DROP POLICY IF EXISTS "Recruiters and admins can create templates" ON public.job_templates;
DROP POLICY IF EXISTS "Recruiters and admins can update templates" ON public.job_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON public.job_templates;

-- SUGGESTIONS TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Anyone can create suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Anyone can update suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Anyone can delete suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Authenticated users can view suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Authenticated users can create suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Admins can delete suggestions" ON public.suggestions;

-- CANDIDATE_STAGE_NOTES TABLE - Drop all existing policies
DROP POLICY IF EXISTS "Stage notes are viewable by everyone" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Anyone can create stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Anyone can update stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Anyone can delete stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Admins and recruiters can view stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Authenticated users can create stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Users can update stage notes" ON public.candidate_stage_notes;
DROP POLICY IF EXISTS "Admins can delete stage notes" ON public.candidate_stage_notes;