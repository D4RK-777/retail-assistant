import { useContext, createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  organization: Organization | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  createOrganization: (name: string, slug: string, description: string, website: string) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}