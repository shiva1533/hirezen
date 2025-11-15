-- Enable real-time for candidates table so UI can receive updates when AI matching completes
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;