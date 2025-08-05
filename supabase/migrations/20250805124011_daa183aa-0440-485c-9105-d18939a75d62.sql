-- Fix the "RLS Enabled No Policy" issue by adding basic policies to tables that need them

-- Add policies for tables that have RLS enabled but no policies
-- First, let's add policies for the analytics table (already has some but might need more)

-- Add policies for nods_page (was just enabled, needs policies)
CREATE POLICY "Allow public read access to nods_page" ON public.nods_page
FOR SELECT USING (true);

-- Add policies for qr_codes (was just enabled, needs policies) 
CREATE POLICY "Allow public read access to qr_codes" ON public.qr_codes
FOR SELECT USING (true);

-- Add policies for modules (was just enabled, needs policies)
CREATE POLICY "Allow public read access to modules" ON public.modules  
FOR SELECT USING (true);

-- Add policies for experiences (was just enabled, needs policies)
CREATE POLICY "Allow public read access to experiences" ON public.experiences
FOR SELECT USING (true);

-- Add any missing policies for other tables that might need them
-- Check if fingerprints needs more policies
CREATE POLICY "Allow public read fingerprints" ON public.fingerprints
FOR SELECT USING (true);

CREATE POLICY "Allow public insert fingerprints" ON public.fingerprints  
FOR INSERT WITH CHECK (true);

-- Check if urls needs more policies  
CREATE POLICY "Allow public read urls" ON public.urls
FOR SELECT USING (true);

CREATE POLICY "Allow public insert urls" ON public.urls
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update urls" ON public.urls
FOR UPDATE USING (true) WITH CHECK (true);

-- Check if visits needs more policies
CREATE POLICY "Allow public read visits" ON public.visits
FOR SELECT USING (true);

CREATE POLICY "Allow public insert visits" ON public.visits
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update visits" ON public.visits
FOR UPDATE USING (true) WITH CHECK (true);