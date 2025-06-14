
-- Create storage bucket for eco action photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('eco-photos', 'eco-photos', true);

-- Create storage bucket for eco action audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('eco-audio', 'eco-audio', true);

-- Create RLS policies for eco-photos bucket
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'eco-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'eco-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view eco photos" ON storage.objects
FOR SELECT USING (bucket_id = 'eco-photos');

-- Create RLS policies for eco-audio bucket
CREATE POLICY "Users can upload their own audio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'eco-audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'eco-audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view eco audio" ON storage.objects
FOR SELECT USING (bucket_id = 'eco-audio');

-- Update eco_actions table to store file URLs
ALTER TABLE eco_actions 
ADD COLUMN photo_url TEXT,
ADD COLUMN audio_url TEXT;
