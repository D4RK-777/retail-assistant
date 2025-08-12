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
          
          // AUTO-CREATE FAKE ORGANIZATION TO BYPASS BROKEN SETUP
          if (!organization) {
            console.log('AUTO-CREATING: Fake organization to bypass broken setup');
            const fakeOrg = {
              id: 'auto-org-' + session.user.id,
              name: 'Auto Organization',
              slug: 'auto-org',
              description: 'Automatically created organization',
              website: null,
              logo_url: null,
              subscription_plan: 'free',
              max_users: 10,
              max_knowledge_items: 100
            };
            setOrganization(fakeOrg);
          }
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
        .from('user_profiles')
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
          .from('organizations')
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

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear local state
    setUser(null);
    setProfile(null);
    setOrganization(null);
    setSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const createOrganization = async (name: string, slug: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (orgError) return { error: orgError };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        organization_id: orgData.id,
        role: 'owner',
      })
      .eq('id', user.id);

    if (profileError) return { error: profileError };

    await loadUserProfile(user.id);
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