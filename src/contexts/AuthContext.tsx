import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './useAuth';

interface UserProfile {
  id: string;
  organization_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_active: boolean | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  subscription_plan: string | null;
  max_users: number | null;
  max_knowledge_items: number | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // EMERGENCY: Force loading to stop after 3 seconds
   useEffect(() => {
     const emergencyTimeout = setTimeout(() => {
       console.warn('EMERGENCY: Forcing loading to false after 3 seconds');
       setLoading(false);
     }, 3000);
     return () => clearTimeout(emergencyTimeout);
   }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('assistants_user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('assistants_organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData);
        } else {
          setOrganization(null);
        }
      } else {
        setOrganization(null);
      }
    } catch (error) {
      setProfile(null);
      setOrganization(null);
    }
    
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = () => {
    console.log('Attempting to sign out...');
    
    // IMMEDIATE redirect - don't wait for anything
    window.location.href = '/login';
    
    // Clear everything in background (won't block redirect)
    setUser(null);
    setProfile(null);
    setOrganization(null);
    setSession(null);
    localStorage.clear();
    sessionStorage.clear();
    
    // Async cleanup without blocking
    supabase.auth.signOut({ scope: 'local' }).catch(console.error);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('assistants_user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const createOrganization = async (name: string, slug: string, description?: string, website?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const orgInsert: any = { name, slug };
    if (description) orgInsert.description = description;
    if (website) orgInsert.website = website;

    console.log('Attempting to insert organization:', orgInsert);
    const { data: orgData, error: orgError } = await supabase
      .from('assistants_organizations')
      .insert(orgInsert)
      .select()
      .single();

    if (orgError) {
      console.error('Error inserting organization:', orgError);
      return { error: orgError };
    }
    console.log('Organization inserted successfully:', orgData);

    console.log('Attempting to update user profile with organization_id:', orgData.id);
    const { error: profileError } = await supabase
      .from('assistants_user_profiles')
      .update({
        organization_id: orgData.id,
        role: 'owner',
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return { error: profileError };
    }
    console.log('User profile updated successfully.');

    console.log('Loading user profile...');
    await loadUserProfile(user.id);
    setOrganization(orgData);
    console.log('User profile loaded.');
    return { error: null };
  };

  const value = {
    user,
    profile,
    organization,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}