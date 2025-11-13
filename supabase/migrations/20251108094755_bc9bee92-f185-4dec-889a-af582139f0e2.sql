-- Create jobs table to store job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position TEXT NOT NULL,
  vacancies INTEGER NOT NULL DEFAULT 1,
  experience TEXT,
  role_experience TEXT,
  department TEXT,
  pipeline_template TEXT,
  placement_template TEXT,
  job_description TEXT,
  language TEXT DEFAULT 'english',
  document_template TEXT,
  hod_approvers TEXT,
  management_approvers TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view jobs (for applicants)
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to create jobs (will be restricted when auth is added)
CREATE POLICY "Anyone can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update jobs (will be restricted when auth is added)
CREATE POLICY "Anyone can update jobs" 
ON public.jobs 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to delete jobs (will be restricted when auth is added)
CREATE POLICY "Anyone can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();