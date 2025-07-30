import { useState, useCallback, useEffect } from "react";
import { Upload, Globe, FileText, Trash2, Plus, Key, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FirecrawlService, CrawledData } from "@/utils/FirecrawlService";

interface KnowledgeItem {
  id: string;
  type: "file" | "domain" | "url";
  name: string;
  size?: string;
  status: "pending" | "processing" | "completed" | "error";
  crawledData?: CrawledData[];
}

export function KnowledgeBase() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [firecrawlApiKey, setFirecrawlApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [isFirecrawlConnected, setIsFirecrawlConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Firecrawl API key exists
    const savedApiKey = FirecrawlService.getApiKey();
    if (savedApiKey) {
      setFirecrawlApiKey(savedApiKey);
      setIsFirecrawlConnected(true);
    }

    // Load existing crawled data
    const crawledData = FirecrawlService.getCrawledData();
    if (crawledData.length > 0) {
      const existingItems: KnowledgeItem[] = [];
      
      // Group by domain/URL
      const urlItems = new Map<string, CrawledData[]>();
      crawledData.forEach(data => {
        const key = data.url;
        if (!urlItems.has(key)) {
          urlItems.set(key, []);
        }
        urlItems.get(key)!.push(data);
      });

      urlItems.forEach((data, url) => {
        const isDomain = data.length > 1;
        existingItems.push({
          id: crypto.randomUUID(),
          type: isDomain ? "domain" : "url",
          name: isDomain ? new URL(url).hostname : url,
          status: "completed",
          crawledData: data
        });
      });

      setKnowledgeItems(existingItems);
    }
  }, []);

  const handleSaveFirecrawlApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Firecrawl API key.",
        variant: "destructive"
      });
      return;
    }

    // Test the API key
    const isValid = await FirecrawlService.testApiKey(tempApiKey);
    if (!isValid) {
      toast({
        title: "Invalid API Key",
        description: "The Firecrawl API key is invalid. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    FirecrawlService.saveApiKey(tempApiKey);
    setFirecrawlApiKey(tempApiKey);
    setIsFirecrawlConnected(true);
    setShowApiDialog(false);
    setTempApiKey("");
    
    toast({
      title: "Firecrawl Connected",
      description: "Firecrawl API key has been saved. You can now crawl websites!",
    });
  };

  const handleDisconnectFirecrawl = () => {
    setFirecrawlApiKey("");
    setIsFirecrawlConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Firecrawl API key has been removed.",
    });
  };

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
      
      // Simulate file processing (in real app, you'd upload to your backend)
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

  const handleUrlAdd = async () => {
    if (!newUrl) return;
    
    if (!isFirecrawlConnected) {
      toast({
        title: "Firecrawl Required",
        description: "Please configure your Firecrawl API key to scrape URLs.",
        variant: "destructive"
      });
      setShowApiDialog(true);
      return;
    }

    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      type: "url",
      name: newUrl,
      status: "processing"
    };
    
    setKnowledgeItems(prev => [...prev, newItem]);
    const currentUrl = newUrl;
    setNewUrl("");
    
    try {
      const result = await FirecrawlService.scrapeUrl(currentUrl);
      
      if (result.success && result.data) {
        setKnowledgeItems(prev => 
          prev.map(item => 
            item.id === newItem.id ? { 
              ...item, 
              status: "completed",
              crawledData: [result.data!]
            } : item
          )
        );
        toast({
          title: "URL scraped successfully",
          description: `Content from ${currentUrl} has been added to your knowledge base.`,
        });
      } else {
        setKnowledgeItems(prev => 
          prev.map(item => 
            item.id === newItem.id ? { ...item, status: "error" } : item
          )
        );
        toast({
          title: "Scraping failed",
          description: result.error || "Failed to scrape the URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      setKnowledgeItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, status: "error" } : item
        )
      );
      toast({
        title: "Error",
        description: "An error occurred while scraping the URL",
        variant: "destructive"
      });
    }
  };

  const handleDomainAdd = async () => {
    if (!newDomain) return;
    
    if (!isFirecrawlConnected) {
      toast({
        title: "Firecrawl Required",
        description: "Please configure your Firecrawl API key to crawl domains.",
        variant: "destructive"
      });
      setShowApiDialog(true);
      return;
    }

    const domainUrl = newDomain.startsWith('http') ? newDomain : `https://${newDomain}`;
    
    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      type: "domain",
      name: newDomain,
      status: "processing"
    };
    
    setKnowledgeItems(prev => [...prev, newItem]);
    const currentDomain = newDomain;
    setNewDomain("");
    
    try {
      const result = await FirecrawlService.crawlDomain(domainUrl);
      
      if (result.success && result.data && result.data.length > 0) {
        setKnowledgeItems(prev => 
          prev.map(item => 
            item.id === newItem.id ? { 
              ...item, 
              status: "completed",
              crawledData: result.data
            } : item
          )
        );
        toast({
          title: "Domain crawled successfully",
          description: `Found ${result.data.length} pages from ${currentDomain} and added to your knowledge base.`,
        });
      } else {
        setKnowledgeItems(prev => 
          prev.map(item => 
            item.id === newItem.id ? { ...item, status: "error" } : item
          )
        );
        toast({
          title: "Crawling failed",
          description: result.error || "Failed to crawl the domain",
          variant: "destructive"
        });
      }
    } catch (error) {
      setKnowledgeItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, status: "error" } : item
        )
      );
      toast({
        title: "Error",
        description: "An error occurred while crawling the domain",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: string) => {
    const item = knowledgeItems.find(i => i.id === id);
    if (item?.crawledData) {
      // Remove crawled data from storage
      item.crawledData.forEach(data => {
        FirecrawlService.removeCrawledContent(data.url);
      });
    }
    
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="h-4 w-4 text-green-600" />;
      case "processing": return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case "error": return <X className="h-4 w-4 text-red-600" />;
      default: return null;
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

  const totalCrawledPages = FirecrawlService.getCrawledData().length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Knowledge Base Setup</h2>
          <p className="text-muted-foreground">
            Upload documents, add domains, and URLs to train your AI chatbot with relevant knowledge.
          </p>
        </div>
        
        {/* Firecrawl API Key Setup */}
        <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
          <DialogTrigger asChild>
            <Button variant={isFirecrawlConnected ? "outline" : "default"}>
              <Key className="h-4 w-4 mr-2" />
              {isFirecrawlConnected ? "Firecrawl Connected" : "Setup Firecrawl"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Firecrawl API Key</DialogTitle>
              <DialogDescription>
                Enter your Firecrawl API key to enable website crawling functionality.
              </DialogDescription>
            </DialogHeader>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                For production apps, consider connecting to Supabase for secure secret management. 
                Your API key will be stored in your browser's local storage.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firecrawl-key">Firecrawl API Key</Label>
                <Input
                  id="firecrawl-key"
                  type="password"
                  placeholder="fc-..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">firecrawl.dev</a>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveFirecrawlApiKey} className="flex-1">
                  Save API Key
                </Button>
                {isFirecrawlConnected && (
                  <Button onClick={handleDisconnectFirecrawl} variant="destructive">
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      {totalCrawledPages > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>{totalCrawledPages} pages</strong> have been crawled and are available in your knowledge base.
          </AlertDescription>
        </Alert>
      )}

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
              Scrape specific web pages with Firecrawl.
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
                disabled={!isFirecrawlConnected}
              />
            </div>
            <Button 
              onClick={handleUrlAdd} 
              disabled={!newUrl || !isFirecrawlConnected} 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Scrape URL
            </Button>
            {!isFirecrawlConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Firecrawl API key required
              </p>
            )}
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
              Crawl entire websites with Firecrawl (up to 50 pages).
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
                disabled={!isFirecrawlConnected}
              />
            </div>
            <Button 
              onClick={handleDomainAdd} 
              disabled={!newDomain || !isFirecrawlConnected} 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crawl Domain
            </Button>
            {!isFirecrawlConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Firecrawl API key required
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Sources List */}
      {knowledgeItems.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Knowledge Sources ({knowledgeItems.length})</CardTitle>
            <CardDescription>
              Manage your uploaded content and crawled data sources.
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
                    <div className="flex-1">
                      <p className="font-medium truncate max-w-xs">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(item.status)}
                        <span className={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        {item.size && <span className="text-muted-foreground">• {item.size}</span>}
                        {item.crawledData && item.crawledData.length > 1 && (
                          <span className="text-muted-foreground">• {item.crawledData.length} pages</span>
                        )}
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