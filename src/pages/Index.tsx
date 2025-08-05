import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { TrainingDashboard } from "@/components/TrainingDashboard";
import ChatTesting from "@/components/ChatTesting";
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState("knowledge");
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case "knowledge":
        return <KnowledgeBase />;
      case "training":
        return <TrainingDashboard />;
      case "testing":
        return user ? <ChatTesting /> : (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">AI Chat Testing</h2>
            <p className="text-muted-foreground mb-4">Sign in to test the AI chat functionality</p>
            <Link to="/auth">
              <Button>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        );
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
