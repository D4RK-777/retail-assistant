-- Create Assistant tables for AI Personalities project
-- This creates duplicate tables with "Assistant" prefix for clear separation
-- from existing training data while keeping everything in the same database

-- Create AssistantScrapedPages table (duplicate of scraped_pages)
CREATE TABLE IF NOT EXISTS public.assistant_scraped_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  description TEXT,
  links TEXT[],
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AssistantContentChunks table (duplicate of content_chunks)
CREATE TABLE IF NOT EXISTS public.assistant_content_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID, -- Flexible reference to assistant_scraped_pages or other sources
  content TEXT,
  title TEXT,
  url TEXT,
  embedding VECTOR(768), -- Gemini text-embedding-004 uses 768 dimensions
  chunk_index INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'general',
  importance_score FLOAT DEFAULT 1.0,
  tags TEXT[],
  category TEXT,
  knowledge_level TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AssistantAiTrainingSessions table (duplicate of ai_training_sessions)
CREATE TABLE IF NOT EXISTS public.assistant_ai_training_sessions (
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

-- Create AssistantUserInteractions table (for AI personality chat logging)
CREATE TABLE IF NOT EXISTS public.assistant_user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_message TEXT,
  ai_response TEXT,
  personality_used TEXT,
  response_quality INTEGER CHECK (response_quality >= 1 AND response_quality <= 5),
  context_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all Assistant tables
ALTER TABLE public.assistant_scraped_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_ai_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_user_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Assistant tables (public access for AI personalities)
CREATE POLICY "Allow public read access to assistant_scraped_pages" 
ON public.assistant_scraped_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to assistant_scraped_pages" 
ON public.assistant_scraped_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to assistant_scraped_pages" 
ON public.assistant_scraped_pages 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow read access to assistant_content_chunks" 
ON public.assistant_content_chunks
FOR SELECT 
USING (true);

CREATE POLICY "Allow system to manage assistant_content_chunks" 
ON public.assistant_content_chunks
FOR ALL 
USING (true);

CREATE POLICY "Anyone can view assistant_ai_training_sessions" 
ON public.assistant_ai_training_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create assistant_ai_training_sessions" 
ON public.assistant_ai_training_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update assistant_ai_training_sessions" 
ON public.assistant_ai_training_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public access to assistant_user_interactions" 
ON public.assistant_user_interactions 
FOR ALL 
USING (true);

-- Create indexes for performance on Assistant tables
CREATE INDEX IF NOT EXISTS idx_assistant_content_chunks_source_id ON public.assistant_content_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_assistant_content_chunks_embedding ON public.assistant_content_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_assistant_content_chunks_category ON public.assistant_content_chunks(category);
CREATE INDEX IF NOT EXISTS idx_assistant_user_interactions_session ON public.assistant_user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_user_interactions_personality ON public.assistant_user_interactions(personality_used);
CREATE INDEX IF NOT EXISTS idx_assistant_scraped_pages_url ON public.assistant_scraped_pages(url);
CREATE INDEX IF NOT EXISTS idx_assistant_scraped_pages_created_at ON public.assistant_scraped_pages(created_at);

-- Add helpful comments
COMMENT ON TABLE public.assistant_scraped_pages IS 'Assistant version: Stores web content scraped for AI personalities (separate from training data)';
COMMENT ON TABLE public.assistant_content_chunks IS 'Assistant version: Stores processed content chunks with embeddings for AI personality retrieval';
COMMENT ON TABLE public.assistant_ai_training_sessions IS 'Assistant version: Tracks AI personality training session progress and status';
COMMENT ON TABLE public.assistant_user_interactions IS 'Assistant version: Logs user interactions with AI personalities for analysis';
COMMENT ON COLUMN public.assistant_content_chunks.source_id IS 'References assistant_scraped_pages.id or other assistant sources - no FK constraint for flexibility';
COMMENT ON COLUMN public.assistant_content_chunks.embedding IS 'Vector embedding for semantic search (768 dimensions for Gemini)';
COMMENT ON COLUMN public.assistant_user_interactions.personality_used IS 'Which AI personality was used for this interaction (The Mentor, The Catalyst, etc.)';