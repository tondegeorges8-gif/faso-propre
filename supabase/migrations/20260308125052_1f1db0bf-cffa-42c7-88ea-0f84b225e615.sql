
-- Add audio_url column to signalements
ALTER TABLE public.signalements ADD COLUMN IF NOT EXISTS audio_url text DEFAULT NULL;

-- Enable realtime for signalements table
ALTER PUBLICATION supabase_realtime ADD TABLE public.signalements;
