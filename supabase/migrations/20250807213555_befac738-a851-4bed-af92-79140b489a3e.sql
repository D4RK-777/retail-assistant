-- Create a table for uploaded files similar to scraped_pages
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  content TEXT, -- Extracted text content for AI training
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching scraped_pages pattern)
CREATE POLICY "Allow public insert to uploaded_files" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to uploaded_files" 
ON public.uploaded_files 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public update to uploaded_files" 
ON public.uploaded_files 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to uploaded_files" 
ON public.uploaded_files 
FOR DELETE 
USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Create storage policies
CREATE POLICY "Public can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Public can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public can update documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents');

CREATE POLICY "Public can delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');