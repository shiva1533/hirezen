-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain']
);

-- RLS policies for resumes bucket
CREATE POLICY "Anyone can view resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can update resumes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resumes');

CREATE POLICY "Anyone can delete resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes');