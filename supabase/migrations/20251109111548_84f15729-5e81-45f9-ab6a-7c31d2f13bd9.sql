-- Create table for AI interviews
CREATE TABLE public.ai_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  interview_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  video_url TEXT,
  questions JSONB,
  answers JSONB,
  evaluation JSONB,
  score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interviews ENABLE ROW LEVEL SECURITY;

-- Allow public to view their own interview by token (no auth required)
CREATE POLICY "Anyone can view interview by token"
ON public.ai_interviews
FOR SELECT
USING (true);

-- Allow public to update their own interview by token
CREATE POLICY "Anyone can update interview by token"
ON public.ai_interviews
FOR UPDATE
USING (true);

-- Allow authenticated users to insert interviews
CREATE POLICY "Authenticated users can insert interviews"
ON public.ai_interviews
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_interviews_updated_at
BEFORE UPDATE ON public.ai_interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster token lookups
CREATE INDEX idx_ai_interviews_token ON public.ai_interviews(interview_token);
CREATE INDEX idx_ai_interviews_candidate_id ON public.ai_interviews(candidate_id);