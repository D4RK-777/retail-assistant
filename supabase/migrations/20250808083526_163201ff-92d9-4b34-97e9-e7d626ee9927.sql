-- Force retrain LEXI with ALL uploaded flEX content
DELETE FROM content_chunks WHERE source_id IN (
  SELECT id FROM uploaded_files WHERE file_name ILIKE '%flex%' OR content ILIKE '%flex%'
);

-- Clear existing training session to force fresh processing
UPDATE ai_training_sessions SET status = 'pending' WHERE id = (
  SELECT id FROM ai_training_sessions ORDER BY created_at DESC LIMIT 1
);