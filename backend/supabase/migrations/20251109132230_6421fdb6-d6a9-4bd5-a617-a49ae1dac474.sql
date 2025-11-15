-- Allow anonymous clients (candidates) to upload/select/update only within the interview-videos bucket
CREATE POLICY "Anon can upload interview videos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'interview-videos');

CREATE POLICY "Anon can read interview videos"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'interview-videos');

CREATE POLICY "Anon can update interview videos"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'interview-videos');