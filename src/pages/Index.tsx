import React from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from "lucide-react";
import Login from './Login';
import OrganizationSetupPage from './OrganizationSetupPage';
import Dashboard from './Dashboard';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}

const Index = () => {
  const { user, profile, organization, loading } = useAuth();

  console.log('INDEX DEBUG:', { user: !!user, profile: !!profile, organization: !!organization, loading });

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // STEP 1: Show login page if user is not authenticated
  if (!user) {
    console.log('INDEX: Showing Login page - no user');
    return <Login />;
  }

  // STEP 2: Show organization setup if user is authenticated but has no organization
  if (user && !organization) {
    console.log('INDEX: Showing OrganizationSetup page - user exists but no organization');
    return <OrganizationSetupPage />;
  }

  // STEP 3: Show main dashboard if user is authenticated and has organization
  if (user && organization) {
    console.log('INDEX: Showing Dashboard - user and organization exist');
    return <Dashboard />;
  }

  // Fallback to login
  console.log('INDEX: Fallback to Login page');
  return <Login />;
};

export default Index;
