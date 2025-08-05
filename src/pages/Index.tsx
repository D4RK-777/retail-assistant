import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { TrainingDashboard } from "@/components/TrainingDashboard";
import ChatTesting from "@/components/ChatTesting";

const Index = () => {
  const [activeTab, setActiveTab] = useState("knowledge");

  const renderContent = () => {
    switch (activeTab) {
      case "knowledge":
        return <KnowledgeBase />;
      case "training":
        return <TrainingDashboard />;
      case "testing":
        return <ChatTesting />;
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Configure your AI training settings and preferences.</p>
          </div>
        );
      default:
        return <KnowledgeBase />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
