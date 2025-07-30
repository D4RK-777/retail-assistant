-- Fix remaining RLS issues - enable RLS on all remaining public tables
ALTER TABLE public.nods_page_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_formatting_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables that were missing them
CREATE POLICY "Allow public read access to nods_page_section" 
ON public.nods_page_section 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to view message analytics" 
ON public.message_analytics 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view message formatting analysis" 
ON public.message_formatting_analysis 
FOR SELECT 
USING (auth.role() = 'authenticated');

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

-- Fix search path for all functions that need it
CREATE OR REPLACE FUNCTION public.copy_template_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.copy_template_update_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.copy_template_delete_to_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;