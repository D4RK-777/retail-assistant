-- Final security fixes - address remaining function search path issues

-- Fix the remaining functions that still have mutable search paths
CREATE OR REPLACE FUNCTION public.get_smart_url_analytics_summary(smart_url_id_param integer)
RETURNS TABLE(endpoint_id integer, endpoint_url text, total_visits bigint, total_clicks bigint, total_scans bigint, unique_visitors bigint, conversion_rate numeric, last_visit timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id as endpoint_id,
    se.url as endpoint_url,
    COUNT(sev.id) as total_visits,
    COUNT(CASE WHEN sev.access_method = 'click' THEN 1 END) as total_clicks,
    COUNT(CASE WHEN sev.access_method = 'scan' THEN 1 END) as total_scans,
    COUNT(DISTINCT sev.fingerprint_id) as unique_visitors,
    COALESCE(AVG(sea.conversion_rate), 0.0) as conversion_rate,
    MAX(sev.timestamp) as last_visit
  FROM smart_endpoints se
  LEFT JOIN smart_endpoint_visits sev ON se.id = sev.smart_endpoint_id
  LEFT JOIN smart_endpoint_analytics sea ON se.id = sea.smart_endpoint_id
  WHERE se.smart_url_id = smart_url_id_param
  GROUP BY se.id, se.url;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_message_stats(p_message_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'message_id', p_message_id,
    'likes', (SELECT COUNT(*) FROM public.message_actions 
              WHERE message_id = p_message_id AND action_type = 'like'),
    'dislikes', (SELECT COUNT(*) FROM public.message_actions 
                WHERE message_id = p_message_id AND action_type = 'dislike'),
    'copies', (SELECT COUNT(*) FROM public.message_actions 
              WHERE message_id = p_message_id AND action_type = 'copy'),
    'feedback_count', (SELECT COUNT(*) FROM public.message_feedback 
                      WHERE message_id = p_message_id),
    'last_updated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_page_parents(page_id bigint)
RETURNS TABLE(id bigint, parent_page_id bigint, path text, meta jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  with recursive chain as (
    select *
    from nods_page
    where id = page_id

    union all

    select child.*
      from nods_page as child
      join chain on chain.parent_page_id = child.id
  )
  select id, parent_page_id, path, meta
  from chain;
$$;

CREATE OR REPLACE FUNCTION public.match_page_sections(embedding vector, match_threshold double precision, match_count integer, min_content_length integer)
RETURNS TABLE(id bigint, page_id bigint, slug text, heading text, content text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
#variable_conflict use_variable
begin
  return query
  select
    nods_page_section.id,
    nods_page_section.page_id,
    nods_page_section.slug,
    nods_page_section.heading,
    nods_page_section.content,
    (nods_page_section.embedding <#> embedding) * -1 as similarity
  from nods_page_section

  -- We only care about sections that have a useful amount of content
  where length(nods_page_section.content) >= min_content_length

  -- The dot product is negative because of a Postgres limitation, so we negate it
  and (nods_page_section.embedding <#> embedding) * -1 > match_threshold

  -- OpenAI embeddings are normalized to length 1, so
  -- cosine similarity and dot product will produce the same results.
  -- Using dot product which can be computed slightly faster.
  --
  -- For the different syntaxes, see https://github.com/pgvector/pgvector
  order by nods_page_section.embedding <#> embedding

  limit match_count;
end;
$$;