INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'report-images');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');

alter publication supabase_realtime add table storage.objects;