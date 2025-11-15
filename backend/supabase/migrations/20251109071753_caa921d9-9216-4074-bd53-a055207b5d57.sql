-- Create job_templates table
CREATE TABLE public.job_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  experience TEXT,
  role_experience TEXT,
  job_description TEXT,
  pipeline_template TEXT,
  placement_template TEXT,
  document_template TEXT,
  language TEXT DEFAULT 'english',
  sector TEXT,
  segments TEXT,
  priority_level TEXT,
  billing_rate TEXT,
  currency TEXT DEFAULT 'INR',
  salary_min TEXT,
  salary_max TEXT,
  expected_qualification TEXT,
  job_type TEXT,
  mode_of_work TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for job templates
CREATE POLICY "Job templates are viewable by everyone" 
ON public.job_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create job templates" 
ON public.job_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update job templates" 
ON public.job_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete job templates" 
ON public.job_templates 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_templates_updated_at
BEFORE UPDATE ON public.job_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();