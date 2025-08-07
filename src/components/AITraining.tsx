import { useState, useEffect } from "react";
import { Brain, Play, RotateCcw, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CrawlerService } from "@/services/CrawlerService";

interface TrainingSession {
  id: string;
  type: "full" | "incremental";
  status: "running" | "completed" | "failed";
  progress: number;
  sourcesProcessed: number;
  totalSources: number;
  startTime: Date;
  endTime?: Date;
}

export function AITraining() {
  const [currentTraining, setCurrentTraining] = useState<TrainingSession | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([]);
  const [selectedSources, setSelectedSources] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    // Get selected sources count
    const pages = await CrawlerService.getScrapedPages();
    setSelectedSources(pages.length > 0 ? Math.ceil(pages.length / 5) : 0); // Rough estimate of sources
    setTotalPages(pages.length);

    // Mock training history
    setTrainingHistory([
      {
        id: "1",
        type: "full",
        status: "completed",
        progress: 100,
        sourcesProcessed: 8,
        totalSources: 8,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        id: "2", 
        type: "incremental",
        status: "completed",
        progress: 100,
        sourcesProcessed: 3,
        totalSources: 3,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000) // 10 minutes later
      }
    ]);
  };

  const startTraining = (type: "full" | "incremental") => {
    if (selectedSources === 0) {
      toast({
        title: "No content selected",
        description: "Please select content sources to train on",
        variant: "destructive"
      });
      return;
    }

    const newTraining: TrainingSession = {
      id: crypto.randomUUID(),
      type,
      status: "running",
      progress: 0,
      sourcesProcessed: 0,
      totalSources: selectedSources,
      startTime: new Date()
    };

    setCurrentTraining(newTraining);

    toast({
      title: `${type === "full" ? "Full" : "Incremental"} training started`,
      description: `Training AI on ${selectedSources} selected sources`,
    });

    // Simulate training progress
    const interval = setInterval(() => {
      setCurrentTraining(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(prev.progress + Math.random() * 15, 100);
        const newSourcesProcessed = Math.floor((newProgress / 100) * prev.totalSources);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          const completedTraining: TrainingSession = {
            ...prev,
            status: "completed",
            progress: 100,
            sourcesProcessed: prev.totalSources,
            endTime: new Date()
          };
          
          setTrainingHistory(history => [completedTraining, ...history]);
          setCurrentTraining(null);
          
          toast({
            title: "Training completed!",
            description: `AI successfully trained on ${selectedSources} sources`,
          });
          
          return completedTraining;
        }
        
        return {
          ...prev,
          progress: newProgress,
          sourcesProcessed: newSourcesProcessed
        };
      });
    }, 1000);
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "running": return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "running": return "bg-blue-100 text-blue-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Training</h2>
        <p className="text-muted-foreground">
          Train your AI on selected content sources to improve responses
        </p>
      </div>

      {/* Training Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Training Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{selectedSources}</div>
              <div className="text-sm text-muted-foreground">Content sources selected</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-semibold">{totalPages}</div>
              <div className="text-sm text-muted-foreground">Total pages to process</div>
            </div>

            {selectedSources === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Go to Content Library to add and select sources for training
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Start Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTraining ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {currentTraining.type === "full" ? "Full" : "Incremental"} training in progress
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(currentTraining.progress)}%</span>
                  </div>
                  <Progress value={currentTraining.progress} />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Processing {currentTraining.sourcesProcessed} of {currentTraining.totalSources} sources
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={() => startTraining("full")} 
                  disabled={selectedSources === 0}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Full Training
                </Button>
                
                <Button 
                  onClick={() => startTraining("incremental")}
                  disabled={selectedSources === 0}
                  variant="outline" 
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Update Training
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Full training processes all sources. Update training only processes new/changed content.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle>Training History</CardTitle>
          <CardDescription>
            Recent AI training sessions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No training sessions yet. Start your first training above.
            </div>
          ) : (
            <div className="space-y-3">
              {trainingHistory.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="font-medium">
                        {session.type === "full" ? "Full Training" : "Incremental Training"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.sourcesProcessed} sources • {formatDuration(session.startTime, session.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {session.endTime?.toLocaleTimeString() || "In progress"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}