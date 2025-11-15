-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience_years INTEGER,
  resume_url TEXT,
  resume_text TEXT,
  ai_match_score INTEGER,
  ai_match_analysis JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Candidates are viewable by everyone" 
ON public.candidates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete candidates" 
ON public.candidates 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for job_id lookups
CREATE INDEX idx_candidates_job_id ON public.candidates(job_id);

-- Create index for ai_match_score for ranking
CREATE INDEX idx_candidates_match_score ON public.candidates(ai_match_score DESC);