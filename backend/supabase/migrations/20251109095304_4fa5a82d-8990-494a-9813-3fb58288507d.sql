-- Create pipeline activity log table
CREATE TABLE public.pipeline_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_position TEXT,
  old_stage TEXT,
  new_stage TEXT NOT NULL,
  old_stage_label TEXT,
  new_stage_label TEXT,
  changed_by UUID,
  changed_by_name TEXT DEFAULT 'System',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view activity logs
CREATE POLICY "Activity logs are viewable by everyone"
ON public.pipeline_activity_logs
FOR SELECT
USING (true);

-- System can create activity logs
CREATE POLICY "System can create activity logs"
ON public.pipeline_activity_logs
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_pipeline_activity_logs_created_at ON public.pipeline_activity_logs(created_at DESC);
CREATE INDEX idx_pipeline_activity_logs_candidate_id ON public.pipeline_activity_logs(candidate_id);

-- Create function to log candidate stage changes
CREATE OR REPLACE FUNCTION public.log_candidate_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_position_var TEXT;
  old_stage_label_var TEXT;
  new_stage_label_var TEXT;
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get job position
    SELECT position INTO job_position_var
    FROM public.jobs
    WHERE id = NEW.job_id;
    
    -- Get stage labels using the existing function
    old_stage_label_var := get_stage_label(OLD.status);
    new_stage_label_var := get_stage_label(NEW.status);
    
    -- Insert activity log
    INSERT INTO public.pipeline_activity_logs (
      candidate_id,
      candidate_name,
      job_id,
      job_position,
      old_stage,
      new_stage,
      old_stage_label,
      new_stage_label,
      changed_by_name
    ) VALUES (
      NEW.id,
      NEW.full_name,
      NEW.job_id,
      job_position_var,
      OLD.status,
      NEW.status,
      old_stage_label_var,
      new_stage_label_var,
      'System'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for logging stage changes
CREATE TRIGGER log_candidate_stage_change_trigger
AFTER UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.log_candidate_stage_change();