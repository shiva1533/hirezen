-- Create RLS policies for interview-videos bucket
CREATE POLICY "Anyone can upload interview videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'interview-videos');

CREATE POLICY "Users can view their interview videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'interview-videos');

CREATE POLICY "Users can update their interview videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'interview-videos');