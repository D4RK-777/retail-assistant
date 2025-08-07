import { useState } from "react";
import { Brain, Database, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "knowledge", label: "Knowledge Base", icon: Database },
  { id: "training", label: "AI Training", icon: Brain },
  { id: "testing", label: "Chat Testing", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Training Center</h1>
              <p className="text-sm text-muted-foreground">Enhance your AI's knowledge and capabilities</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={cn(
          "border-r bg-card/30 backdrop-blur-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "justify-center px-0"
                  )}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className={cn("h-5 w-5", isActive && "animate-pulse-soft")} />
                  {!isCollapsed && <span>{tab.label}</span>}
                </Button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}