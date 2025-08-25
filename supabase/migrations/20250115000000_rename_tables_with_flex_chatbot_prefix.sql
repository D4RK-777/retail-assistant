-- Rename all existing tables to use flex_chatbot_ prefix
-- This migration ensures database safety and clarity

-- Rename core tables
ALTER TABLE IF EXISTS ai_training_sessions RENAME TO flex_chatbot_ai_training_sessions;
ALTER TABLE IF EXISTS content_chunks RENAME TO flex_chatbot_content_chunks;
ALTER TABLE IF EXISTS scraped_pages RENAME TO flex_chatbot_scraped_pages;
ALTER TABLE IF EXISTS uploaded_files RENAME TO flex_chatbot_uploaded_files;
ALTER TABLE IF EXISTS master_knowledge_base RENAME TO flex_chatbot_master_knowledge_base;
ALTER TABLE IF EXISTS content_topic_mapping RENAME TO flex_chatbot_content_topic_mapping;
ALTER TABLE IF EXISTS knowledge_topics RENAME TO flex_chatbot_knowledge_topics;

-- Update foreign key constraints for content_topic_mapping
ALTER TABLE flex_chatbot_content_topic_mapping 
DROP CONSTRAINT IF EXISTS content_topic_mapping_content_chunk_id_fkey;

ALTER TABLE flex_chatbot_content_topic_mapping 
ADD CONSTRAINT flex_chatbot_content_topic_mapping_content_chunk_id_fkey 
FOREIGN KEY (content_chunk_id) REFERENCES flex_chatbot_content_chunks(id);

ALTER TABLE flex_chatbot_content_topic_mapping 
DROP CONSTRAINT IF EXISTS content_topic_mapping_topic_id_fkey;

ALTER TABLE flex_chatbot_content_topic_mapping 
ADD CONSTRAINT flex_chatbot_content_topic_mapping_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES flex_chatbot_knowledge_topics(id);

-- Update any other foreign key constraints that reference the old table names
ALTER TABLE flex_chatbot_content_chunks 
DROP CONSTRAINT IF EXISTS content_chunks_source_id_fkey;

ALTER TABLE flex_chatbot_content_chunks 
ADD CONSTRAINT flex_chatbot_content_chunks_source_id_fkey 
FOREIGN KEY (source_id) REFERENCES flex_chatbot_scraped_pages(id) ON DELETE CASCADE;

-- Update RLS policies to use new table names
DROP POLICY IF EXISTS "Allow read access to master knowledge base" ON flex_chatbot_master_knowledge_base;
CREATE POLICY "Allow read access to flex chatbot master knowledge base" 
ON flex_chatbot_master_knowledge_base 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert access to master knowledge base" ON flex_chatbot_master_knowledge_base;
CREATE POLICY "Allow insert access to flex chatbot master knowledge base" 
ON flex_chatbot_master_knowledge_base 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to master knowledge base" ON flex_chatbot_master_knowledge_base;
CREATE POLICY "Allow update access to flex chatbot master knowledge base" 
ON flex_chatbot_master_knowledge_base 
FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow delete access to master knowledge base" ON flex_chatbot_master_knowledge_base;
CREATE POLICY "Allow delete access to flex chatbot master knowledge base" 
ON flex_chatbot_master_knowledge_base 
FOR DELETE 
USING (true);

-- Update other table policies
DROP POLICY IF EXISTS "Anyone can view training sessions" ON flex_chatbot_ai_training_sessions;
CREATE POLICY "Anyone can view flex chatbot training sessions" 
ON flex_chatbot_ai_training_sessions 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can create training sessions" ON flex_chatbot_ai_training_sessions;
CREATE POLICY "Anyone can create flex chatbot training sessions" 
ON flex_chatbot_ai_training_sessions 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update training sessions" ON flex_chatbot_ai_training_sessions;
CREATE POLICY "Anyone can update flex chatbot training sessions" 
ON flex_chatbot_ai_training_sessions 
FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Anyone can view content chunks" ON flex_chatbot_content_chunks;
CREATE POLICY "Anyone can view flex chatbot content chunks" 
ON flex_chatbot_content_chunks 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can create content chunks" ON flex_chatbot_content_chunks;
CREATE POLICY "Anyone can create flex chatbot content chunks" 
ON flex_chatbot_content_chunks 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update content chunks" ON flex_chatbot_content_chunks;
CREATE POLICY "Anyone can update flex chatbot content chunks" 
ON flex_chatbot_content_chunks 
FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Anyone can delete content chunks" ON flex_chatbot_content_chunks;
CREATE POLICY "Anyone can delete flex chatbot content chunks" 
ON flex_chatbot_content_chunks 
FOR DELETE 
USING (true);

-- Update indexes to use new table names
DROP INDEX IF EXISTS idx_master_knowledge_base_search;
CREATE INDEX idx_flex_chatbot_master_knowledge_base_search 
ON flex_chatbot_master_knowledge_base 
USING gin(to_tsvector('english', 
    title || ' ' || 
    content || ' ' || 
    COALESCE(primary_category, '') || ' ' || 
    COALESCE(sub_category, '') || ' ' || 
    COALESCE(content_type, '') || ' ' || 
    COALESCE(feature_area, '') || ' ' || 
    array_to_string(relevance_tags, ' ') || ' ' || 
    array_to_string(keywords, ' ')
  )
);

-- Add comment to track migration
COMMENT ON SCHEMA public IS 'Tables renamed with flex_chatbot_ prefix for database safety and clarity';