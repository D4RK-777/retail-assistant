import { useState, useCallback, useEffect } from "react";
import { Upload, Globe, FileText, Trash2, Plus, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CrawlerService, ScrapedPage } from "@/services/CrawlerService";
import { WhatsAppKnowledgeBuilder } from "./WhatsAppKnowledgeBuilder";

interface KnowledgeItem {
  id: string;
  type: "file" | "domain" | "url";
  name: string;
  size?: string;
  status: "pending" | "processing" | "completed" | "error";
  scrapedPages?: ScrapedPage[];
}

export function KnowledgeBase() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const [scrapedPages, setScrapedPages] = useState<ScrapedPage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadScrapedPages();
  }, []);

  const loadScrapedPages = async () => {
    const pages = await CrawlerService.getScrapedPages();
    setScrapedPages(pages);
    
    // Convert scraped pages to knowledge items for display
    const items: KnowledgeItem[] = [];
    const domainGroups = new Map<string, ScrapedPage[]>();
    
    pages.forEach(page => {
      try {
        const hostname = new URL(page.url).hostname;
        if (!domainGroups.has(hostname)) {
          domainGroups.set(hostname, []);
        }
        domainGroups.get(hostname)!.push(page);
      } catch (error) {
        // Handle individual URLs that don't parse
        items.push({
          id: page.id,
          type: "url",
          name: page.url,
          status: "completed",
          scrapedPages: [page]
        });
      }
    });

    // Group by domain
    domainGroups.forEach((pages, hostname) => {
      if (pages.length > 1) {
        items.push({
          id: crypto.randomUUID(),
          type: "domain",
          name: hostname,
          status: "completed",
          scrapedPages: pages
        });
      } else {
        items.push({
          id: pages[0].id,
          type: "url", 
          name: pages[0].url,
          status: "completed",
          scrapedPages: pages
        });
      }
    });

    setKnowledgeItems(items);
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
      const result = await CrawlerService.scrapeUrl(currentUrl);
      
      if (result.success) {
        await loadScrapedPages();
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
      const result = await CrawlerService.crawlDomain(domainUrl, maxPages);
      
      if (result.success) {
        await loadScrapedPages();
        toast({
          title: "Domain crawled successfully",
          description: `Found ${result.totalPages || 0} pages from ${currentDomain} and added to your knowledge base.`,
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

  const handleDelete = async (id: string) => {
    const item = knowledgeItems.find(i => i.id === id);
    if (item?.scrapedPages) {
      // Remove scraped pages from database
      for (const page of item.scrapedPages) {
        await CrawlerService.deleteScrapedPage(page.url);
      }
    }
    
    await loadScrapedPages();
    toast({
      title: "Item removed",
      description: "The knowledge source has been removed from your database.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-foreground";
      case "processing": return "text-muted-foreground";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="h-4 w-4 text-foreground" />;
      case "processing": return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case "error": return <X className="h-4 w-4 text-destructive" />;
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

  const totalCrawledPages = scrapedPages.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Knowledge Base Setup</h2>
          <p className="text-muted-foreground">
            Upload documents, add domains, and URLs to train your AI chatbot with relevant knowledge.
          </p>
        </div>
        
        <Badge variant="outline" className="bg-card text-card-foreground border-border">
          <Globe className="h-4 w-4 mr-2" />
          Custom Crawler Powered by Supabase
        </Badge>
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

      {/* WhatsApp Knowledge Builder */}
      <WhatsAppKnowledgeBuilder />

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
              Scrape specific web pages with our custom crawler.
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
                className="bg-background border-border"
              />
            </div>
            <Button 
              onClick={handleUrlAdd} 
              disabled={!newUrl} 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Scrape URL
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
              Crawl entire websites with our custom crawler.
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
                className="bg-background border-border"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Pages"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-20 bg-background border-border"
                min="1"
                max="50"
              />
              <Button 
                onClick={handleDomainAdd} 
                disabled={!newDomain} 
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crawl Domain
              </Button>
            </div>
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
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
                        {item.scrapedPages && item.scrapedPages.length > 1 && (
                          <span className="text-muted-foreground">• {item.scrapedPages.length} pages</span>
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