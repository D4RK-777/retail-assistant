-- Create the missing tables for AI training
CREATE TABLE IF NOT EXISTS public.ai_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  total_content INTEGER DEFAULT 0,
  processed_content INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.content_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.scraped_pages(id) ON DELETE CASCADE,
  content TEXT,
  title TEXT,
  url TEXT,
  embedding VECTOR(768), -- Gemini text-embedding-004 uses 768 dimensions
  chunk_index INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.ai_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Anyone can view training sessions" 
ON public.ai_training_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create training sessions" 
ON public.ai_training_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update training sessions" 
ON public.ai_training_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view content chunks" 
ON public.content_chunks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create content chunks" 
ON public.content_chunks 
FOR INSERT 
WITH CHECK (true);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS content_chunks_embedding_idx ON public.content_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);