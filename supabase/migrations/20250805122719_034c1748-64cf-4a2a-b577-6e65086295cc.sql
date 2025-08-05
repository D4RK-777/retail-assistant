-- Fix remaining critical RLS security issues

-- The linter is still showing ERROR cases for "RLS Disabled in Public"
-- and "Policy Exists RLS Disabled" - need to enable RLS on remaining tables

-- Enable RLS on all remaining public tables that don't have it
ALTER TABLE public.nods_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Fix the remaining search_path issues for functions that still have mutable search paths
CREATE OR REPLACE FUNCTION public.copy_template_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO master_templates (
    template_id,
    user_id,
    original_text,
    formatted_text,
    formatting_types,
    formatting_density,
    character_count,
    is_public,
    is_private,
    name,
    created_at,
    source,
    audit_timestamp
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.original_text,
    NEW.formatted_text,
    NEW.formatting_types,
    NEW.formatting_density,
    NEW.character_count,
    NEW.is_public,
    NEW.is_private,
    NEW.name,
    NEW.created_at,
    'trigger',
    timezone('utc', now())
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.copy_template_update_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO master_templates (
    template_id,
    user_id,
    original_text,
    formatted_text,
    formatting_types,
    formatting_density,
    character_count,
    is_public,
    is_private,
    name,
    created_at,
    source,
    audit_timestamp
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.original_text,
    NEW.formatted_text,
    NEW.formatting_types,
    NEW.formatting_density,
    NEW.character_count,
    NEW.is_public,
    NEW.is_private,
    NEW.name,
    NEW.created_at,
    'update',
    timezone('utc', now())
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.copy_template_delete_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO master_templates (
    template_id,
    user_id,
    original_text,
    formatted_text,
    formatting_types,
    formatting_density,
    character_count,
    is_public,
    is_private,
    name,
    created_at,
    source,
    audit_timestamp
  ) VALUES (
    OLD.id,
    OLD.user_id,
    OLD.original_text,
    OLD.formatted_text,
    OLD.formatting_types,
    OLD.formatting_density,
    OLD.character_count,
    OLD.is_public,
    OLD.is_private,
    OLD.name,
    OLD.created_at,
    'delete',
    timezone('utc', now())
  );
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_smart_endpoint_clicks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update current_clicks in smart_endpoints table
  IF NEW.smart_endpoint_id IS NOT NULL THEN
    UPDATE smart_endpoints 
    SET current_clicks = current_clicks + 1
    WHERE id = NEW.smart_endpoint_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_smart_endpoint_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert or update analytics for the smart endpoint
    INSERT INTO smart_endpoint_analytics (
        smart_endpoint_id,
        date,
        total_clicks,
        total_scans
    )
    VALUES (
        NEW.smart_endpoint_id,
        CURRENT_DATE,
        CASE WHEN NEW.access_method = 'click' THEN 1 ELSE 0 END,
        CASE WHEN NEW.access_method = 'scan' THEN 1 ELSE 0 END
    )
    ON CONFLICT (smart_endpoint_id, date)
    DO UPDATE SET
        total_clicks = smart_endpoint_analytics.total_clicks + 
            CASE WHEN NEW.access_method = 'click' THEN 1 ELSE 0 END,
        total_scans = smart_endpoint_analytics.total_scans + 
            CASE WHEN NEW.access_method = 'scan' THEN 1 ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_analyze_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.analyze_message_formatting(NEW.message_id);
  RETURN NEW;
END;
$$;