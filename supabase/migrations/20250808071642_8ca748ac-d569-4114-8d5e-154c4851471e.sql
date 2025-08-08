-- Drop foreign key constraint on content_chunks if it exists
ALTER TABLE IF EXISTS content_chunks 
DROP CONSTRAINT IF EXISTS content_chunks_source_id_fkey;

-- Drop foreign key constraint variations that might exist
ALTER TABLE IF EXISTS content_chunks 
DROP CONSTRAINT IF EXISTS fk_content_chunks_source_id;

ALTER TABLE IF EXISTS content_chunks 
DROP CONSTRAINT IF EXISTS content_chunks_source_id_fkey1;

-- Make sure source_id can accept any UUID without foreign key constraint
-- This allows both scraped_pages and uploaded_files IDs to be stored
COMMENT ON COLUMN content_chunks.source_id IS 'References either scraped_pages.id or uploaded_files.id - no FK constraint for flexibility';

-- Ensure content_chunks has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_chunks_source_id ON content_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding ON content_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);