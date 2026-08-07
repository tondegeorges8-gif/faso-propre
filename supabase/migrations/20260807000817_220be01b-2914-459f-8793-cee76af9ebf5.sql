CREATE POLICY "Marketplace photos are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-photos');

CREATE POLICY "Owners upload marketplace photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'marketplace-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners update marketplace photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'marketplace-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners delete marketplace photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'marketplace-photos' AND (storage.foldername(name))[1] = auth.uid()::text);