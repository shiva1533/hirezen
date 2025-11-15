-- Add new fields to pipeline_activity_logs for enhanced journey tracking
ALTER TABLE public.pipeline_activity_logs
ADD COLUMN IF NOT EXISTS candidate_email TEXT,
ADD COLUMN IF NOT EXISTS interview_score INTEGER,
ADD COLUMN IF NOT EXISTS interview_details JSONB;

-- Create index for email searches
CREATE INDEX IF NOT EXISTS idx_pipeline_activity_logs_candidate_email ON public.pipeline_activity_logs(candidate_email);
CREATE INDEX IF NOT EXISTS idx_pipeline_activity_logs_interview_score ON public.pipeline_activity_logs(interview_score);

-- Update RLS policy to allow reading the new fields
DROP POLICY IF EXISTS "Activity logs are viewable by everyone" ON public.pipeline_activity_logs;
CREATE POLICY "Activity logs are viewable by everyone"
ON public.pipeline_activity_logs
FOR SELECT
USING (true);