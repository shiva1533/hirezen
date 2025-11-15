-- Create candidate change logs table for audit trail
CREATE TABLE IF NOT EXISTS public.candidate_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  source TEXT NOT NULL DEFAULT 'upload',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_candidate_change_logs_candidate_id ON public.candidate_change_logs(candidate_id);
CREATE INDEX idx_candidate_change_logs_created_at ON public.candidate_change_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.candidate_change_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins and recruiters to view change logs
CREATE POLICY "admins_recruiters_can_view_change_logs"
ON public.candidate_change_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recruiter'::app_role)
);

-- System can insert change logs
CREATE POLICY "system_can_insert_change_logs"
ON public.candidate_change_logs
FOR INSERT
WITH CHECK (true);