
-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('signalements-audio', 'signalements-audio', false) ON CONFLICT (id) DO NOTHING;

-- RLS policies for audio bucket
CREATE POLICY "Users can upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signalements-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'signalements-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'signalements-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Founders can view all audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'signalements-audio' AND public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Admins can view all audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'signalements-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution users can view audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'signalements-audio' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND institution IS NOT NULL));
