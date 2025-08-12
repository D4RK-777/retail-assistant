import React from 'react';
import { Layout } from '@/components/Layout';
import { KnowledgeUpdater } from '@/components/KnowledgeUpdater';
import { OrganizationSetup } from '@/components/auth/OrganizationSetup';
import { useAuth } from '@/contexts/useAuth';

export default function Settings() {
  const { organization } = useAuth();

  return (
    <Layout activeTab="settings" onTabChange={() => {}}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI assistant settings and knowledge base.
          </p>
        </div>
        {!organization && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Organization Setup</h3>
            <OrganizationSetup />
          </div>
        )}
        <KnowledgeUpdater />
      </div>
    </Layout>
  );
}