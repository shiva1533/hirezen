-- ============================================
-- FORCE DROP ALL RLS POLICIES DYNAMICALLY
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from candidates table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'candidates' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.candidates';
    END LOOP;

    -- Drop all policies from ai_interviews table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'ai_interviews' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.ai_interviews';
    END LOOP;

    -- Drop all policies from jobs table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'jobs' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.jobs';
    END LOOP;

    -- Drop all policies from job_templates table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'job_templates' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.job_templates';
    END LOOP;

    -- Drop all policies from suggestions table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'suggestions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.suggestions';
    END LOOP;

    -- Drop all policies from candidate_stage_notes table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'candidate_stage_notes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.candidate_stage_notes';
    END LOOP;
END $$;

-- ============================================
-- CREATE SECURE RLS POLICIES
-- ============================================

-- CANDIDATES TABLE
CREATE POLICY "Admins and recruiters can view all candidates" 
ON public.candidates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Service role can insert candidates" 
ON public.candidates FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Admins and recruiters can update candidates" 
ON public.candidates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Admins can delete candidates" 
ON public.candidates FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- AI_INTERVIEWS TABLE
CREATE POLICY "Admins and recruiters can view all interviews" 
ON public.ai_interviews FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Service role can insert interviews" 
ON public.ai_interviews FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update interviews" 
ON public.ai_interviews FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

-- JOBS TABLE
CREATE POLICY "Public can view published jobs" 
ON public.jobs FOR SELECT TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admins and recruiters can view all jobs" 
ON public.jobs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters and admins can create jobs" 
ON public.jobs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters and admins can update jobs" 
ON public.jobs FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Admins can delete jobs" 
ON public.jobs FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- JOB_TEMPLATES TABLE
CREATE POLICY "Admins and recruiters can view job templates" 
ON public.job_templates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters and admins can create templates" 
ON public.job_templates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Recruiters and admins can update templates" 
ON public.job_templates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Admins can delete templates" 
ON public.job_templates FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- SUGGESTIONS TABLE
CREATE POLICY "Authenticated users can view suggestions" 
ON public.suggestions FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create suggestions" 
ON public.suggestions FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update suggestions" 
ON public.suggestions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete suggestions" 
ON public.suggestions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- CANDIDATE_STAGE_NOTES TABLE
CREATE POLICY "Admins and recruiters can view stage notes" 
ON public.candidate_stage_notes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'recruiter'::app_role));

CREATE POLICY "Authenticated users can create stage notes" 
ON public.candidate_stage_notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update stage notes" 
ON public.candidate_stage_notes FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete stage notes" 
ON public.candidate_stage_notes FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));