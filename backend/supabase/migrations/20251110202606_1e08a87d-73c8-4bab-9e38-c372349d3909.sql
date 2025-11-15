-- Add video analysis field to ai_interviews table
ALTER TABLE ai_interviews 
ADD COLUMN IF NOT EXISTS video_analysis jsonb;