-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add institution column to user_roles to identify which institution a user represents
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS institution TEXT;

-- Create index for faster institution lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_institution ON public.user_roles(institution);

-- Update RLS policies for signalements to allow institution users to view their signalements
CREATE POLICY "Institution users can view their signalements" 
ON public.signalements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.institution = signalements.category
  )
);

-- Update RLS policies for signalements to allow institution users to update status
CREATE POLICY "Institution users can update their signalements status" 
ON public.signalements 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.institution = signalements.category
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.institution = signalements.category
  )
);

-- Allow founders to view all signalements
CREATE POLICY "Founders can view all signalements"
ON public.signalements
FOR SELECT
USING (has_role(auth.uid(), 'founder'));

-- Allow founders to update all signalements
CREATE POLICY "Founders can update all signalements"
ON public.signalements
FOR UPDATE
USING (has_role(auth.uid(), 'founder'));

-- Add storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatar uploads
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);