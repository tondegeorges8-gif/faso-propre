
-- Allow users to delete their own signalements
CREATE POLICY "Users can delete own signalements" ON public.signalements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow users to delete own photos
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'signalements-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
