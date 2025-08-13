-- Fix organization creation by adding missing INSERT policy
-- This allows authenticated users to create organizations

CREATE POLICY "Authenticated users can create organizations"
ON public.assistants_organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure users can insert their own profile (needed for organization creation flow)
CREATE POLICY "Users can insert their own profile"
ON public.assistants_user_profiles
FOR INSERT
WITH CHECK (id = auth.uid());