import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ContentManager } from '@/components/ContentManager';
import { AITraining } from '@/components/AITraining';
import AIPersonalitySelector from '@/components/AIPersonalitySelector';
import { KnowledgeUpdater } from '@/components/KnowledgeUpdater';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("testing");

  const renderContent = () => {
    switch (activeTab) {
      case "knowledge":
        return <ContentManager />;
      case "training":
        return <AITraining />;
      case "testing":
        return (
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
        );
      case "settings":
        return <KnowledgeUpdater />;
      default:
        return <ContentManager />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}