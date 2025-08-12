import React from 'react';
import { Layout } from '@/components/Layout';
import AIPersonalitySelector from '@/components/AIPersonalitySelector';

export default function AIPersonalities() {
  return (
    <Layout activeTab="personalities" onTabChange={() => {}}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">AI Personality Selector</h2>
          <p className="text-muted-foreground">
            Experience the world's most advanced retail AI assistants. Each personality is scientifically designed 
            to excel with different customer types and shopping scenarios.
          </p>
        </div>
        <AIPersonalitySelector />
      </div>
    </Layout>
  );
}