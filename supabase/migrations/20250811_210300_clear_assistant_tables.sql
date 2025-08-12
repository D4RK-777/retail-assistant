-- Clear all data from Assistant tables to ensure clean start for AI Personalities
-- This ensures complete separation from any existing training data

-- Clear assistant_user_interactions (chat logs)
DELETE FROM public.assistant_user_interactions;

-- Clear assistant_content_chunks (embeddings and content)
DELETE FROM public.assistant_content_chunks;

-- Clear assistant_ai_training_sessions (training sessions)
DELETE FROM public.assistant_ai_training_sessions;

-- Clear assistant_scraped_pages (scraped content)
DELETE FROM public.assistant_scraped_pages;

-- Reset sequences if needed (optional, but ensures clean IDs)
-- Note: UUIDs don't use sequences, but this is here for completeness

-- Add verification queries to confirm tables are empty
DO $$
BEGIN
    -- Check if tables are empty and log results
    IF (SELECT COUNT(*) FROM public.assistant_scraped_pages) = 0 THEN
        RAISE NOTICE 'assistant_scraped_pages is now empty ✓';
    ELSE
        RAISE WARNING 'assistant_scraped_pages still contains data!';
    END IF;
    
    IF (SELECT COUNT(*) FROM public.assistant_content_chunks) = 0 THEN
        RAISE NOTICE 'assistant_content_chunks is now empty ✓';
    ELSE
        RAISE WARNING 'assistant_content_chunks still contains data!';
    END IF;
    
    IF (SELECT COUNT(*) FROM public.assistant_ai_training_sessions) = 0 THEN
        RAISE NOTICE 'assistant_ai_training_sessions is now empty ✓';
    ELSE
        RAISE WARNING 'assistant_ai_training_sessions still contains data!';
    END IF;
    
    IF (SELECT COUNT(*) FROM public.assistant_user_interactions) = 0 THEN
        RAISE NOTICE 'assistant_user_interactions is now empty ✓';
    ELSE
        RAISE WARNING 'assistant_user_interactions still contains data!';
    END IF;
    
    RAISE NOTICE 'Assistant tables cleanup completed. AI Personalities now have clean data environment.';
END $$;

-- Add comments to document the cleanup
COMMENT ON TABLE public.assistant_scraped_pages IS 'Assistant version: Clean table for AI personalities (cleared of training data)';
COMMENT ON TABLE public.assistant_content_chunks IS 'Assistant version: Clean embeddings for AI personalities (cleared of training data)';
COMMENT ON TABLE public.assistant_ai_training_sessions IS 'Assistant version: Clean training sessions for AI personalities';
COMMENT ON TABLE public.assistant_user_interactions IS 'Assistant version: Clean interaction logs for AI personalities';