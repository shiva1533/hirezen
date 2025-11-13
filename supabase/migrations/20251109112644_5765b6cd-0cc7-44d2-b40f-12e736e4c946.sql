-- Add archived field to ai_interviews table
ALTER TABLE public.ai_interviews 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster filtering
CREATE INDEX idx_ai_interviews_archived ON public.ai_interviews(archived);