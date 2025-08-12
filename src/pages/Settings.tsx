import React from 'react';
import { Layout } from '@/components/Layout';
import { KnowledgeUpdater } from '@/components/KnowledgeUpdater';

export default function Settings() {
  return (
    <Layout activeTab="settings" onTabChange={() => {}}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI assistant settings and knowledge base.
          </p>
        </div>
        <KnowledgeUpdater />
      </div>
    </Layout>
  );
}