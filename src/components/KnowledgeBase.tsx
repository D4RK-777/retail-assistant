import { useState, useCallback } from "react";
import { Upload, Globe, FileText, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeItem {
  id: string;
  type: "file" | "domain" | "url";
  name: string;
  size?: string;
  status: "pending" | "processing" | "completed" | "error";
}

export function KnowledgeBase() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      const newItem: KnowledgeItem = {
        id: crypto.randomUUID(),
        type: "file",
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "processing"
      };
      
      setKnowledgeItems(prev => [...prev, newItem]);
      
      // Simulate processing
      setTimeout(() => {
        setKnowledgeItems(prev => 
          prev.map(item => 
            item.id === newItem.id ? { ...item, status: "completed" } : item
          )
        );
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been added to your knowledge base.`,
        });
      }, 2000);
    });
    
    event.target.value = "";
  }, [toast]);

  const handleUrlAdd = () => {
    if (!newUrl) return;
    
    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      type: "url",
      name: newUrl,
      status: "processing"
    };
    
    setKnowledgeItems(prev => [...prev, newItem]);
    setNewUrl("");
    
    setTimeout(() => {
      setKnowledgeItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, status: "completed" } : item
        )
      );
      toast({
        title: "URL added successfully",
        description: "The URL content has been processed and added to your knowledge base.",
      });
    }, 1500);
  };

  const handleDomainAdd = () => {
    if (!newDomain) return;
    
    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      type: "domain",
      name: newDomain,
      status: "processing"
    };
    
    setKnowledgeItems(prev => [...prev, newItem]);
    setNewDomain("");
    
    setTimeout(() => {
      setKnowledgeItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, status: "completed" } : item
        )
      );
      toast({
        title: "Domain added successfully",
        description: "The domain content has been crawled and added to your knowledge base.",
      });
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "The knowledge source has been removed from your database.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="h-4 w-4" />;
      case "domain": return <Globe className="h-4 w-4" />;
      case "url": return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Knowledge Base Setup</h2>
        <p className="text-muted-foreground">
          Upload documents, add domains, and URLs to train your AI chatbot with relevant knowledge.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* File Upload */}
        <Card className="shadow-card hover:shadow-soft transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Add PDFs, text files, and documents to your knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, TXT, DOC, DOCX, MD
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Add URLs */}
        <Card className="shadow-card hover:shadow-soft transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Add URLs
            </CardTitle>
            <CardDescription>
              Include specific web pages for targeted knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url-input">Website URL</Label>
              <Input
                id="url-input"
                placeholder="https://example.com/page"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
              />
            </div>
            <Button onClick={handleUrlAdd} disabled={!newUrl} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add URL
            </Button>
          </CardContent>
        </Card>

        {/* Add Domains */}
        <Card className="shadow-card hover:shadow-soft transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Add Domains
            </CardTitle>
            <CardDescription>
              Crawl entire websites for comprehensive knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="domain-input">Domain Name</Label>
              <Input
                id="domain-input"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDomainAdd()}
              />
            </div>
            <Button onClick={handleDomainAdd} disabled={!newDomain} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Sources List */}
      {knowledgeItems.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Knowledge Sources ({knowledgeItems.length})</CardTitle>
            <CardDescription>
              Manage your uploaded content and data sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {knowledgeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <p className="font-medium truncate max-w-xs">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        {item.size && <span className="text-muted-foreground">• {item.size}</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}