import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { toast } from '@/hooks/use-toast';

interface OrganizationSetupProps {
  onComplete?: () => void;
}

export function OrganizationSetup({ onComplete }: OrganizationSetupProps) {
  const { createOrganization, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [orgData, setOrgData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setOrgData({
      ...orgData,
      name,
      slug: generateSlug(name),
    });
  };

  const validateStep1 = () => {
    if (!orgData.name.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!orgData.slug.trim()) {
      setError('Organization slug is required');
      return false;
    }
    if (orgData.slug.length < 3) {
      setError('Organization slug must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await createOrganization(orgData.name, orgData.slug, orgData.description, orgData.website);
      
      if (error) {
        if (error.message.includes('duplicate key')) {
          setError('This organization name is already taken. Please choose a different one.');
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: 'Organization created!',
          description: 'Your retail store is now set up and ready to use.',
        });
        onComplete?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
              <Store className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Retail Store</h1>
          <p className="text-gray-600 mt-2">
            Welcome {profile?.full_name}! Let's create your organization to get started.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'Basic Information' : 'Additional Details'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Tell us about your retail store or business'
                : 'Optional information to help customize your experience'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    type="text"
                    placeholder="e.g., Acme Retail Store"
                    value={orgData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    This will be the name of your retail store or business
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Organization Identifier *</Label>
                  <Input
                    id="org-slug"
                    type="text"
                    placeholder="acme-retail-store"
                    value={orgData.slug}
                    onChange={(e) => setOrgData({ ...orgData, slug: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    This will be used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button onClick={handleNext} className="w-full">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    placeholder="Brief description of your retail store or business..."
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    type="url"
                    placeholder="https://your-store.com"
                    value={orgData.website}
                    onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Organization
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>You can always update these details later in your settings</p>
        </div>
      </div>
    </div>
  );
}