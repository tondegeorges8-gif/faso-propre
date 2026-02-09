
-- =============================================
-- SECURE STORAGE BUCKETS: signalements-photos & avatars
-- =============================================

-- 1. Make signalements-photos bucket PRIVATE
UPDATE storage.buckets SET public = false WHERE id = 'signalements-photos';

-- 2. Drop permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- 3. Users can view their own signalement photos
CREATE POLICY "Users can view own signalement photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signalements-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Collectors can view all paid signalement photos
CREATE POLICY "Collectors can view paid signalement photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signalements-photos' AND
    public.has_role(auth.uid(), 'collector'::app_role)
  );

-- 5. Admins and founders can view all photos
CREATE POLICY "Admins and founders can view all photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signalements-photos' AND
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'founder'::app_role))
  );

-- 6. Institution users can view photos from their category signalements
CREATE POLICY "Institution users can view their category photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signalements-photos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.institution IS NOT NULL
    )
  );

-- =============================================
-- SECURE AVATARS BUCKET
-- =============================================

-- 7. Make avatars bucket PRIVATE
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- 8. Drop permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 9. All authenticated users can view avatars
CREATE POLICY "Authenticated users can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');
