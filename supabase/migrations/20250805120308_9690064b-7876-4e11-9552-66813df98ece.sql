-- Only enable RLS on the actual table (nods_page_section), skip views
ALTER TABLE public.nods_page_section ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tables that were missing them
CREATE POLICY "Allow public read access to nods_page_section" 
ON public.nods_page_section 
FOR SELECT 
USING (true);

-- Create policies for media_library
CREATE POLICY "Users can view public media" 
ON public.media_library 
FOR SELECT 
USING (is_public = true OR auth.uid() = uploaded_by);

CREATE POLICY "Users can upload media" 
ON public.media_library 
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Create policies for screens
CREATE POLICY "Allow public read access to screens" 
ON public.screens 
FOR SELECT 
USING (true);

-- Create policies for master_templates  
CREATE POLICY "Allow public read access to master_templates" 
ON public.master_templates 
FOR SELECT 
USING (true);

-- Fix search path for remaining functions
CREATE OR REPLACE FUNCTION public.analyze_message_formatting(p_message_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  message_text TEXT;
  word_count INT;
  char_count INT;
  emoji_count INT;
  link_count INT;
  format_count INT;
  section_data JSONB;
  patterns JSONB;
  readability JSONB;
  result JSONB;
  action_record RECORD;
  density FLOAT;
  emoji_density_val FLOAT;
  link_density_val FLOAT;
  paragraph_count INT;
  avg_section_length FLOAT;
  sentence_count INT;
  avg_sentence_length FLOAT;
  avg_word_length FLOAT;
  flesch_score FLOAT;
BEGIN
  -- Get the most recent message content from actions
  SELECT message_content INTO action_record
  FROM public.message_actions
  WHERE message_id = p_message_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If we found a message, analyze it
  IF action_record IS NOT NULL AND action_record.message_content IS NOT NULL THEN
    message_text := action_record.message_content;
    
    -- Basic counts
    word_count := LENGTH(message_text) - LENGTH(REPLACE(message_text, ' ', '')) + 1;
    char_count := LENGTH(message_text);
    emoji_count := (LENGTH(message_text) - LENGTH(REPLACE(message_text, '😀', ''))) / 2;
    link_count := (LENGTH(LOWER(message_text)) - LENGTH(REPLACE(LOWER(message_text), 'http', ''))) / 4;
    
    -- Skip analysis if no content
    IF char_count = 0 THEN
      RETURN jsonb_build_object('error', 'Empty message content');
    END IF;
    
    -- Count formatting characters
    format_count := 
      (LENGTH(message_text) - LENGTH(REPLACE(message_text, '*', ''))) +
      (LENGTH(message_text) - LENGTH(REPLACE(message_text, '_', ''))) +
      (LENGTH(message_text) - LENGTH(REPLACE(message_text, '`', '')));
    
    -- Calculate densities
    density := (format_count::FLOAT / char_count) * 100;
    emoji_density_val := (emoji_count::FLOAT / GREATEST(1, word_count)) * 100;
    link_density_val := (link_count::FLOAT / GREATEST(1, word_count)) * 100;
    paragraph_count := (LENGTH(message_text) - LENGTH(REPLACE(message_text, '\n\n', ''))) / 2 + 1;
    avg_section_length := word_count::FLOAT / GREATEST(1, paragraph_count);
    sentence_count := GREATEST(1, LENGTH(message_text) - LENGTH(REPLACE(message_text, '.', '')));
    avg_sentence_length := word_count::FLOAT / sentence_count;
    avg_word_length := char_count::FLOAT / GREATEST(1, word_count);
    flesch_score := 206.835 - (1.015 * avg_sentence_length) - (84.6 * (avg_word_length / 100));

    -- Section variation analysis
    section_data := jsonb_build_object(
      'paragraph_count', paragraph_count,
      'line_breaks', LENGTH(message_text) - LENGTH(REPLACE(message_text, '\n', '')),
      'avg_section_length', avg_section_length
    );

    -- Detect formatting patterns
    SELECT jsonb_agg(pattern) INTO patterns
    FROM (
      SELECT unnest(ARRAY[
        CASE WHEN message_text ~ '^# .+' THEN 'heading' END,
        CASE WHEN message_text ~ '\*.*\*' THEN 'bold' END,
        CASE WHEN message_text ~ '_.*_' THEN 'italic' END,
        CASE WHEN message_text ~ '`.*`' THEN 'code' END,
        CASE WHEN message_text ~ '^- ' THEN 'bullet_list' END,
        CASE WHEN message_text ~ '^[0-9]+\. ' THEN 'numbered_list' END
      ]) AS pattern
    ) subq
    WHERE pattern IS NOT NULL;

    -- Calculate readability metrics
    readability := jsonb_build_object(
      'avg_sentence_length', avg_sentence_length,
      'avg_word_length', avg_word_length,
      'flesch_reading_ease', flesch_score,
      'word_count', word_count,
      'character_count', char_count
    );

    -- Update the message metadata
    UPDATE public.message_metadata
    SET 
      formatting_density = density,
      emoji_density = emoji_density_val,
      link_density = link_density_val,
      section_variation = section_data,
      formatting_patterns = COALESCE(patterns, '[]'::jsonb),
      readability_metrics = readability,
      updated_at = NOW()
    WHERE message_id = p_message_id;

    -- Return the analysis
    result := jsonb_build_object(
      'formatting_density', density,
      'emoji_density', emoji_density_val,
      'link_density', link_density_val,
      'section_analysis', section_data,
      'detected_patterns', COALESCE(patterns, '[]'::jsonb),
      'readability', readability
    );
  ELSE
    result := jsonb_build_object('error', 'No message content found for analysis');
  END IF;

  RETURN COALESCE(result, '{"error": "No analysis performed"}'::jsonb);
END;
$function$;