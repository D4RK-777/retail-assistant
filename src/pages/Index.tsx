import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ContentManager } from "@/components/ContentManager";
import { AITraining } from "@/components/AITraining";
import ChatTesting from "@/components/ChatTesting";
import { KnowledgeUpdater } from "@/components/KnowledgeUpdater";

const Index = () => {
  const [activeTab, setActiveTab] = useState("knowledge");

  const renderContent = () => {
    switch (activeTab) {
      case "knowledge":
        return <ContentManager />;
      case "training":
        return <AITraining />;
      case "testing":
        return <ChatTesting />;
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Configure your AI training settings and preferences.</p>
            <KnowledgeUpdater />
          </div>
        );
      default:
        return <ContentManager />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
