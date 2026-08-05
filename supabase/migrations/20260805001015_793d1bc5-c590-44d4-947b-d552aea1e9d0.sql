CREATE POLICY "Users manage own prestataire docs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'prestataire-docs' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'prestataire-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read prestataire docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prestataire-docs' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder')));