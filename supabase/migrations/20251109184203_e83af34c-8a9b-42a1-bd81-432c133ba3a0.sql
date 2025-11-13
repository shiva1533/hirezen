-- Enable realtime for pipeline_activity_logs table
ALTER TABLE public.pipeline_activity_logs REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_activity_logs;