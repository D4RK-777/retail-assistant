-- Fix security issues from previous migration

-- Fix function search path for update_content_importance
CREATE OR REPLACE FUNCTION update_content_importance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Increase importance of content chunks that help answer user questions
  UPDATE content_chunks 
  SET importance_score = LEAST(importance_score + 1, 10)
  WHERE content ILIKE '%' || substring(NEW.question, 1, 20) || '%';
  
  RETURN NEW;
END;
$$;