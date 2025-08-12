import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { OrganizationSetup } from '@/components/auth/OrganizationSetup';

export default function OrganizationSetupPage() {
  const navigate = useNavigate();
  const { user, organization, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('SETUP: No user, redirecting to login');
        navigate('/login', { replace: true });
      } else if (user && organization) {
        console.log('SETUP: Organization exists, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, organization, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <OrganizationSetup />
    </div>
  );
}