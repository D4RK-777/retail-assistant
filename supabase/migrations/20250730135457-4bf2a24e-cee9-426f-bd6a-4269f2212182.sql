-- Create scraped_pages table with proper RLS
CREATE TABLE public.scraped_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  description TEXT,
  links TEXT[],
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scraped_pages
ALTER TABLE public.scraped_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for scraped_pages (public read access for knowledge base)
CREATE POLICY "Allow public read access to scraped_pages" 
ON public.scraped_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to scraped_pages" 
ON public.scraped_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to scraped_pages" 
ON public.scraped_pages 
FOR UPDATE 
USING (true);

-- Fix critical RLS issues on existing tables
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for user-specific tables
CREATE POLICY "Users can manage their own templates" 
ON public.templates 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" 
ON public.templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own profile" 
ON public.users 
FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "Users can manage their own events" 
ON public.user_events 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own template events" 
ON public.template_events 
FOR ALL 
USING (auth.uid() = user_id);

-- Fix database functions security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Add updated_at trigger to scraped_pages
CREATE TRIGGER update_scraped_pages_updated_at
  BEFORE UPDATE ON public.scraped_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table properly if it doesn't have the right structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;