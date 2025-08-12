import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { OrganizationSetup } from '@/components/auth/OrganizationSetup';

export default function OrganizationSetupPage() {
  const navigate = useNavigate();
  const { user, organization, loading } = useAuth();

  useEffect(() => {
    console.log("OrganizationSetupPage useEffect triggered:");
    console.log("  loading:", loading);
    console.log("  user:", user);
    console.log("  organization:", organization);

    if (!loading) {
      if (!user) {
        console.log("  Navigating to /login (no user).");
        navigate("/login");
      } else if (user) {
        console.log("  Navigating to /dashboard (user exists, bypassing organization setup).");
        navigate("/dashboard");
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