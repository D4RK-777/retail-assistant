-- Update content chunks to have proper categories and content types
UPDATE content_chunks 
SET 
  category = CASE 
    WHEN content ILIKE '%whatsapp%' OR title ILIKE '%whatsapp%' THEN 'whatsapp_business'
    WHEN content ILIKE '%template%' OR title ILIKE '%template%' THEN 'message_templates' 
    WHEN content ILIKE '%campaign%' OR title ILIKE '%campaign%' THEN 'campaigns'
    WHEN content ILIKE '%contact%' OR title ILIKE '%contact%' THEN 'contact_management'
    WHEN content ILIKE '%analytics%' OR title ILIKE '%analytics%' THEN 'analytics'
    WHEN content ILIKE '%API%' OR title ILIKE '%API%' THEN 'api_documentation'
    WHEN content ILIKE '%broadcast%' OR title ILIKE '%broadcast%' THEN 'broadcasting'
    WHEN content ILIKE '%flex%' OR title ILIKE '%flex%' THEN 'flex_platform'
    ELSE 'general'
  END,
  content_type = CASE
    WHEN title ILIKE '%.md' OR title ILIKE '%transcription%' THEN 'video_transcript'
    WHEN content ILIKE '%### %' THEN 'documentation'
    WHEN content ILIKE '%**%' THEN 'formatted_text'
    ELSE content_type
  END,
  importance_score = CASE
    WHEN content ILIKE '%character%' AND content ILIKE '%limit%' THEN 10
    WHEN content ILIKE '%header%' AND content ILIKE '%60%' THEN 10
    WHEN content ILIKE '%message%' AND content ILIKE '%limit%' THEN 10
    WHEN content ILIKE '%API%' THEN 9
    WHEN content ILIKE '%error%' OR content ILIKE '%code%' THEN 8
    ELSE importance_score
  END,
  tags = CASE
    WHEN content ILIKE '%whatsapp%' THEN 
      ARRAY['whatsapp_business'] || 
      CASE WHEN content ILIKE '%API%' THEN ARRAY['api'] ELSE ARRAY[]::text[] END ||
      CASE WHEN content ILIKE '%limit%' THEN ARRAY['message_limits'] ELSE ARRAY[]::text[] END ||
      CASE WHEN content ILIKE '%template%' THEN ARRAY['templates'] ELSE ARRAY[]::text[] END
    WHEN content ILIKE '%flex%' THEN ARRAY['flex_platform']
    WHEN content ILIKE '%campaign%' THEN ARRAY['campaigns', 'broadcasting']
    ELSE ARRAY['general']::text[]
  END
WHERE category = 'general' OR tags IS NULL OR tags = '{}'::text[]