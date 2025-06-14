
-- Drop existing storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view eco photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view eco audio" ON storage.objects;

-- Create storage policies for eco-photos bucket
CREATE POLICY "Users can upload eco photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'eco-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view eco photos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'eco-photos');

CREATE POLICY "Users can update eco photos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'eco-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete eco photos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'eco-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for eco-audio bucket
CREATE POLICY "Users can upload eco audio" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'eco-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view eco audio" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'eco-audio');

CREATE POLICY "Users can update eco audio" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'eco-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete eco audio" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'eco-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
