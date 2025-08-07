import { useState } from "react";
import { Brain, Play, Zap, Settings, TrendingUp, FileText, Globe, Link2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TrainingStats {
  documents: number;
  domains: number;
  urls: number;
  totalSources: number;
}

export function TrainingDashboard() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const { toast } = useToast();

  // Mock data - in real app this would come from your backend
  const stats: TrainingStats = {
    documents: 5,
    domains: 3,
    urls: 2,
    totalSources: 10
  };

  const handleFullTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    toast({
      title: "Full training started",
      description: "Your AI is now being trained on all knowledge sources.",
    });

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast({
            title: "Training completed!",
            description: "Your AI has been successfully trained with the latest knowledge.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleIncrementalTraining = () => {
    toast({
      title: "Incremental training started",
      description: "Training only on new or updated content.",
    });
  };

  const handleFineTuning = () => {
    toast({
      title: "Fine-tuning initiated",
      description: "Optimizing responses based on conversation patterns.",
    });
  };

  const recommendations = [
    {
      id: 1,
      title: "Add more technical documentation",
      description: "Upload API docs and technical specifications for better technical support",
      priority: "high",
      icon: FileText
    },
    {
      id: 2,
      title: "Include customer conversation examples",
      description: "Add sample customer interactions to improve response quality",
      priority: "medium",
      icon: TrendingUp
    },
    {
      id: 3,
      title: "Add relevant domains and URLs",
      description: "Include your website and documentation domains for comprehensive learning",
      priority: "low",
      icon: Globe
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive bg-card border-border";
      case "medium": return "text-muted-foreground bg-card border-border";
      case "low": return "text-primary bg-card border-border";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Training Center</h2>
        <p className="text-muted-foreground">
          Monitor your knowledge sources and train your AI with the latest data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Knowledge Sources Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Knowledge Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Documents</span>
                </div>
                <Badge variant="secondary">{stats.documents}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Domains</span>
                </div>
                <Badge variant="secondary">{stats.domains}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span>Individual URLs</span>
                </div>
                <Badge variant="secondary">{stats.urls}</Badge>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Sources</span>
                  <Badge className="bg-primary text-primary-foreground">{stats.totalSources}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Options */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Training Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleFullTraining} 
              disabled={isTraining}
              variant="premium"
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isTraining ? "Training in Progress..." : "Start Full Training"}
            </Button>
            
            <Button 
              onClick={handleIncrementalTraining}
              variant="secondary" 
              className="w-full"
              disabled={isTraining}
            >
              <Zap className="h-4 w-4 mr-2" />
              Update Training
            </Button>
            
            <Button 
              onClick={handleFineTuning}
              variant="outline" 
              className="w-full"
              disabled={isTraining}
            >
              <Settings className="h-4 w-4 mr-2" />
              Fine-tune Responses
            </Button>

            {isTraining && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Training Progress</span>
                  <span>{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Training Recommendations
          </CardTitle>
          <CardDescription>
            Suggestions to improve your AI's performance and knowledge base.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={rec.id} 
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`p-2 rounded-full border ${getPriorityColor(rec.priority)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Training History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Training Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-card rounded-full border">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Full training completed</p>
                <p className="text-sm text-muted-foreground">2 hours ago • Processed 8 sources</p>
              </div>
              <Badge className="bg-card text-foreground border-border">Completed</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-card rounded-full border">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Incremental training</p>
                <p className="text-sm text-muted-foreground">1 day ago • Updated 3 documents</p>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}