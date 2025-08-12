import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  requireOrg: boolean;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, requireAuth, requireOrg }: ProtectedRouteProps) {
  const { user, organization, loading } = useAuth();

  console.log('PROTECTED ROUTE:', { 
    requireAuth, 
    requireOrg, 
    hasUser: !!user, 
    hasOrg: !!organization, 
    loading 
  });

  if (loading) {
    return <LoadingScreen />;
  }

  // If auth is required but user is not authenticated, redirect to login
  if (requireAuth && !user) {
    console.log('PROTECTED ROUTE: Redirecting to /login - no user');
    return <Navigate to="/login" replace />;
  }

  // DISABLED: Organization requirement causing infinite redirects
  // if (requireOrg && user && !organization) {
  //   console.log('PROTECTED ROUTE: Redirecting to /setup - no organization');
  //   return <Navigate to="/setup" replace />;
  // }

  // If user is authenticated but trying to access login, redirect to dashboard
  if (user && window.location.pathname === '/login') {
    console.log('PROTECTED ROUTE: Redirecting to /dashboard - user authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}