-- Create storage bucket for interview videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-videos',
  'interview-videos',
  false,
  52428800, -- 50MB limit
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
);

-- Create RLS policies for interview videos bucket
-- Allow authenticated users to upload their own interview videos
CREATE POLICY "Allow interview video uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'interview-videos');

-- Allow authenticated users to read interview videos
CREATE POLICY "Allow reading interview videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'interview-videos');

-- Allow system to update interview videos
CREATE POLICY "Allow updating interview videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'interview-videos');