-- ============================================
-- CREATE SECURE RLS POLICIES FOR ROLE-BASED ACCESS CONTROL
-- ============================================

-- ============================================
-- CANDIDATES TABLE
-- ============================================

-- Admins and recruiters can view all candidates
CREATE POLICY "Admins and recruiters can view all candidates" 
ON public.candidates 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Service role can insert candidates (for parse-resume edge function)
CREATE POLICY "Service role can insert candidates" 
ON public.candidates 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Admins and recruiters can update candidates
CREATE POLICY "Admins and recruiters can update candidates" 
ON public.candidates 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Only admins can delete candidates
CREATE POLICY "Admins can delete candidates" 
ON public.candidates 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- AI_INTERVIEWS TABLE
-- ============================================

-- Admins and recruiters can view all interviews
CREATE POLICY "Admins and recruiters can view all interviews" 
ON public.ai_interviews 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Service role can manage interviews (for edge functions)
CREATE POLICY "Service role can insert interviews" 
ON public.ai_interviews 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update interviews" 
ON public.ai_interviews 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- JOBS TABLE
-- ============================================

-- Public can view published jobs (for careers page)
CREATE POLICY "Public can view published jobs" 
ON public.jobs 
FOR SELECT 
TO anon, authenticated
USING (status = 'published');

-- Admins and recruiters can view all jobs
CREATE POLICY "Admins and recruiters can view all jobs" 
ON public.jobs 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Recruiters and admins can create jobs
CREATE POLICY "Recruiters and admins can create jobs" 
ON public.jobs 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Recruiters and admins can update jobs
CREATE POLICY "Recruiters and admins can update jobs" 
ON public.jobs 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Only admins can delete jobs
CREATE POLICY "Admins can delete jobs" 
ON public.jobs 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- JOB_TEMPLATES TABLE
-- ============================================

-- Admins and recruiters can view job templates
CREATE POLICY "Admins and recruiters can view job templates" 
ON public.job_templates 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Recruiters and admins can create templates
CREATE POLICY "Recruiters and admins can create templates" 
ON public.job_templates 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Recruiters and admins can update templates
CREATE POLICY "Recruiters and admins can update templates" 
ON public.job_templates 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Only admins can delete templates
CREATE POLICY "Admins can delete templates" 
ON public.job_templates 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- SUGGESTIONS TABLE
-- ============================================

-- All authenticated users can view suggestions
CREATE POLICY "Authenticated users can view suggestions" 
ON public.suggestions 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- All authenticated users can create suggestions
CREATE POLICY "Authenticated users can create suggestions" 
ON public.suggestions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update suggestions
CREATE POLICY "Admins can update suggestions" 
ON public.suggestions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete suggestions
CREATE POLICY "Admins can delete suggestions" 
ON public.suggestions 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CANDIDATE_STAGE_NOTES TABLE
-- ============================================

-- Admins and recruiters can view stage notes
CREATE POLICY "Admins and recruiters can view stage notes" 
ON public.candidate_stage_notes 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'recruiter'::app_role)
);

-- Authenticated users can create stage notes
CREATE POLICY "Authenticated users can create stage notes" 
ON public.candidate_stage_notes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update stage notes
CREATE POLICY "Users can update stage notes" 
ON public.candidate_stage_notes 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can delete stage notes
CREATE POLICY "Admins can delete stage notes" 
ON public.candidate_stage_notes 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));