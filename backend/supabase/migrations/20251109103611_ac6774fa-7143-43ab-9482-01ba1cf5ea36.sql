-- Create function to send email when candidate stage changes
CREATE OR REPLACE FUNCTION public.send_stage_change_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  job_position_var TEXT;
  supabase_url_var TEXT;
  supabase_key_var TEXT;
BEGIN
  -- Only send email if status actually changed and new status is not null
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IS NOT NULL THEN
    -- Get job position if available
    SELECT position INTO job_position_var
    FROM public.jobs
    WHERE id = NEW.job_id;
    
    -- Get Supabase URL and key from environment
    supabase_url_var := current_setting('app.settings.supabase_url', true);
    supabase_key_var := current_setting('app.settings.supabase_service_role_key', true);
    
    -- Call edge function asynchronously via pg_net (if available)
    -- For now, we'll log the email request
    -- The actual email sending will be triggered from the application layer
    RAISE LOG 'Stage change email needed for candidate % from % to %', NEW.id, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send emails on stage change
DROP TRIGGER IF EXISTS trigger_send_stage_change_email ON public.candidates;
CREATE TRIGGER trigger_send_stage_change_email
AFTER UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.send_stage_change_email();