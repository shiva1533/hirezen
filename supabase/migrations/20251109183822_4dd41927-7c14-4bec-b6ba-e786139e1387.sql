-- Create trigger to log candidate stage changes
CREATE TRIGGER on_candidate_status_change
  AFTER UPDATE OF status ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.log_candidate_stage_change();