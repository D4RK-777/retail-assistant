-- Setup Authentication System for Retail Store Clients
-- This creates a multi-tenant system where retail stores can manage their own knowledge bases

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table (for retail stores)
CREATE TABLE IF NOT EXISTS public.assistants_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
  max_users INTEGER DEFAULT 5,
  max_knowledge_items INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.assistants_user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES public.assistants_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization invitations table
CREATE TABLE IF NOT EXISTS public.assistants_organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.assistants_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to assistant tables for multi-tenancy
ALTER TABLE public.assistant_scraped_pages 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.assistants_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.assistant_content_chunks 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.assistants_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.assistant_ai_training_sessions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.assistants_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.assistant_user_interactions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.assistants_organizations(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assistants_user_profiles_organization_id ON public.assistants_user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_assistants_user_profiles_email ON public.assistants_user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_assistants_organization_invitations_token ON public.assistants_organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_assistants_organization_invitations_email ON public.assistants_organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_assistant_scraped_pages_org ON public.assistant_scraped_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_assistant_content_chunks_org ON public.assistant_content_chunks(organization_id);
CREATE INDEX IF NOT EXISTS idx_assistant_ai_training_sessions_org ON public.assistant_ai_training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_assistant_user_interactions_org ON public.assistant_user_interactions(organization_id);

-- Enable RLS on all tables
ALTER TABLE public.assistants_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants_organization_invitations ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for assistant tables to include organization filtering
DROP POLICY IF EXISTS "Allow public read access to assistant_scraped_pages" ON public.assistant_scraped_pages;
DROP POLICY IF EXISTS "Allow public insert to assistant_scraped_pages" ON public.assistant_scraped_pages;
DROP POLICY IF EXISTS "Allow public update to assistant_scraped_pages" ON public.assistant_scraped_pages;
DROP POLICY IF EXISTS "Allow read access to assistant_content_chunks" ON public.assistant_content_chunks;
DROP POLICY IF EXISTS "Allow system to manage assistant_content_chunks" ON public.assistant_content_chunks;
DROP POLICY IF EXISTS "Anyone can view assistant_ai_training_sessions" ON public.assistant_ai_training_sessions;
DROP POLICY IF EXISTS "Anyone can create assistant_ai_training_sessions" ON public.assistant_ai_training_sessions;
DROP POLICY IF EXISTS "Anyone can update assistant_ai_training_sessions" ON public.assistant_ai_training_sessions;
DROP POLICY IF EXISTS "Allow public access to assistant_user_interactions" ON public.assistant_user_interactions;

-- Create RLS policies for organizations
CREATE POLICY "Users can view their organization"
ON public.assistants_organizations
FOR SELECT
USING (id = (SELECT public.get_user_organization()));

CREATE POLICY "Organization owners can update their organization"
ON public.assistants_organizations
FOR UPDATE
USING (id = (SELECT public.get_user_organization()) AND (SELECT public.is_user_admin()));

-- Create RLS policies for user profiles
CREATE POLICY "Users can view their own profile"
ON public.assistants_user_profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization"
ON public.assistants_user_profiles
FOR SELECT
USING (organization_id = (SELECT public.get_user_organization()));

CREATE POLICY "Users can update their own profile"
ON public.assistants_user_profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization"
ON public.assistants_user_profiles
FOR ALL
USING (
  organization_id = (SELECT public.get_user_organization())
  AND
  (SELECT public.is_user_admin())
);

-- Create RLS policies for organization invitations
CREATE POLICY "Users can view invitations for their organization"
ON public.assistants_organization_invitations
FOR SELECT
USING (
  organization_id = (SELECT public.get_user_organization())
  AND
  (SELECT public.is_user_admin())
);

CREATE POLICY "Admins can manage invitations for their organization"
ON public.assistants_organization_invitations
FOR ALL
USING (
  organization_id = (SELECT public.get_user_organization())
  AND
  (SELECT public.is_user_admin())
);

-- Create new RLS policies for assistant tables with organization filtering
CREATE POLICY "Users can access assistant_scraped_pages for their organization"
ON public.assistant_scraped_pages
FOR ALL
USING (organization_id = (SELECT public.get_user_organization()));

CREATE POLICY "Users can access assistant_content_chunks for their organization"
ON public.assistant_content_chunks
FOR ALL
USING (organization_id = (SELECT public.get_user_organization()));

CREATE POLICY "Users can access assistant_ai_training_sessions for their organization"
ON public.assistant_ai_training_sessions
FOR ALL
USING (organization_id = (SELECT public.get_user_organization()));

CREATE POLICY "Users can access assistant_user_interactions for their organization"
ON public.assistant_user_interactions
FOR ALL
USING (organization_id = (SELECT public.get_user_organization()));

-- Create functions for user management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.assistants_user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.assistants_user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('owner', 'admin')
    FROM public.assistants_user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE public.assistants_organizations IS 'Retail store organizations that use the AI assistant platform';
COMMENT ON TABLE public.assistants_user_profiles IS 'Extended user profiles linked to auth.users with organization membership';
COMMENT ON TABLE public.assistants_organization_invitations IS 'Pending invitations for users to join organizations';
COMMENT ON COLUMN public.assistants_organizations.subscription_plan IS 'Subscription tier: free, basic, premium, enterprise';
COMMENT ON COLUMN public.assistants_user_profiles.role IS 'User role within organization: owner, admin, member, viewer';
COMMENT ON FUNCTION public.get_user_organization() IS 'Returns the organization ID for the current authenticated user';
COMMENT ON FUNCTION public.is_user_admin() IS 'Returns true if the current user is an owner or admin';