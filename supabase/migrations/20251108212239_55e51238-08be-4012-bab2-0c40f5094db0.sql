-- Create suggestions table
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for suggestions
CREATE POLICY "Anyone can view suggestions" 
ON public.suggestions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create suggestions" 
ON public.suggestions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update suggestions" 
ON public.suggestions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete suggestions" 
ON public.suggestions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_suggestions_updated_at
BEFORE UPDATE ON public.suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_suggestions_status ON public.suggestions(status);
CREATE INDEX idx_suggestions_created_at ON public.suggestions(created_at DESC);