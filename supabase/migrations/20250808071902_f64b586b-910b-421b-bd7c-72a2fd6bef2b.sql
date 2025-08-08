-- Fix security issues from previous migration

-- 1. Add RLS policies for content_chunks table
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;

-- Allow reading content chunks for content search functionality
CREATE POLICY "Allow read access to content chunks" ON content_chunks
    FOR SELECT USING (true);

-- Only allow system/service to insert/update content chunks
CREATE POLICY "Allow system to manage content chunks" ON content_chunks
    FOR ALL USING (false) WITH CHECK (false);

-- 2. Add RLS policies for ai_training_sessions table
ALTER TABLE ai_training_sessions ENABLE ROW LEVEL SECURITY;

-- Allow reading training sessions (for UI display)
CREATE POLICY "Allow read access to training sessions" ON ai_training_sessions
    FOR SELECT USING (true);

-- Only allow system/service to create training sessions
CREATE POLICY "Allow system to create training sessions" ON ai_training_sessions
    FOR INSERT WITH CHECK (true);

-- Only allow system/service to update training sessions  
CREATE POLICY "Allow system to update training sessions" ON ai_training_sessions
    FOR UPDATE USING (true);