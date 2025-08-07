import { useState, useCallback, useEffect } from "react";
import { Upload, Globe, FileText, Trash2, Plus, Check, X, Database, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CrawlerService, ScrapedPage } from "@/services/CrawlerService";

interface ContentSource {
  id: string;
  type: "file" | "domain" | "url";
  name: string;
  size?: string;
  status: "pending" | "processing" | "completed" | "error";
  scrapedPages?: ScrapedPage[];
  selected: boolean;
  pageCount?: number;
  expanded?: boolean;
}

export function ContentManager() {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const pages = await CrawlerService.getScrapedPages();
    
    // Group content by domain
    const sourceMap = new Map<string, ContentSource>();
    
    pages.forEach(page => {
      try {
        const hostname = new URL(page.url).hostname;
        const domainKey = `domain-${hostname}`;
        
        if (!sourceMap.has(domainKey)) {
          sourceMap.set(domainKey, {
            id: domainKey,
            type: "domain",
            name: hostname,
            status: "completed",
            scrapedPages: [],
            selected: true,
            pageCount: 0,
            expanded: false
          });
        }
        
        const domainSource = sourceMap.get(domainKey)!;
        // Add selected property to page
        (page as any).selected = true;
        domainSource.scrapedPages!.push(page);
        domainSource.pageCount = domainSource.scrapedPages!.length;
      } catch (error) {
        // Individual URL fallback
        const pageWithSelection = { ...page, selected: true } as any;
        sourceMap.set(`url-${page.id}`, {
          id: `url-${page.id}`,
          type: "url",
          name: page.url,
          status: "completed",
          scrapedPages: [pageWithSelection],
          selected: true,
          pageCount: 1,
          expanded: false
        });
      }
    });

    setSources(Array.from(sourceMap.values()));
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      const newSource: ContentSource = {
        id: crypto.randomUUID(),
        type: "file",
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "processing",
        selected: true
      };
      
      setSources(prev => [...prev, newSource]);
      
      setTimeout(() => {
        setSources(prev => 
          prev.map(source => 
            source.id === newSource.id ? { ...source, status: "completed" } : source
          )
        );
        toast({
          title: "File uploaded",
          description: `${file.name} added to content library`,
        });
      }, 2000);
    });
    
    event.target.value = "";
  }, [toast]);

  const handleUrlAdd = async () => {
    if (!newUrl) return;

    const newSource: ContentSource = {
      id: crypto.randomUUID(),
      type: "url",
      name: newUrl,
      status: "processing",
      selected: true
    };
    
    setSources(prev => [...prev, newSource]);
    const currentUrl = newUrl;
    setNewUrl("");
    
    try {
      const result = await CrawlerService.scrapeUrl(currentUrl);
      
      if (result.success) {
        await loadContent();
        toast({
          title: "URL scraped",
          description: `Content from ${currentUrl} added to library`,
        });
      } else {
        setSources(prev => 
          prev.map(source => 
            source.id === newSource.id ? { ...source, status: "error" } : source
          )
        );
        toast({
          title: "Scraping failed",
          description: result.error || "Failed to scrape URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      setSources(prev => 
        prev.map(source => 
          source.id === newSource.id ? { ...source, status: "error" } : source
        )
      );
      toast({
        title: "Error",
        description: "Failed to scrape URL",
        variant: "destructive"
      });
    }
  };

  const handleDomainAdd = async () => {
    if (!newDomain) return;

    const domainUrl = newDomain.startsWith('http') ? newDomain : `https://${newDomain}`;
    
    const newSource: ContentSource = {
      id: crypto.randomUUID(),
      type: "domain",
      name: newDomain,
      status: "processing",
      selected: true
    };
    
    setSources(prev => [...prev, newSource]);
    const currentDomain = newDomain;
    setNewDomain("");
    
    try {
      const result = await CrawlerService.crawlDomain(domainUrl, maxPages);
      
      if (result.success) {
        await loadContent();
        toast({
          title: "Domain crawled",
          description: `${result.totalPages || 0} pages from ${currentDomain} added to library`,
        });
      } else {
        setSources(prev => 
          prev.map(source => 
            source.id === newSource.id ? { ...source, status: "error" } : source
          )
        );
        toast({
          title: "Crawling failed",
          description: result.error || "Failed to crawl domain",
          variant: "destructive"
        });
      }
    } catch (error) {
      setSources(prev => 
        prev.map(source => 
          source.id === newSource.id ? { ...source, status: "error" } : source
        )
      );
      toast({
        title: "Error",
        description: "Failed to crawl domain",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const source = sources.find(s => s.id === id);
    if (source?.scrapedPages) {
      for (const page of source.scrapedPages) {
        await CrawlerService.deleteScrapedPage(page.url);
      }
    }
    
    setSources(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Content removed",
      description: "Source removed from library",
    });
  };

  const toggleSelection = (id: string) => {
    setSources(prev => 
      prev.map(source => 
        source.id === id ? { ...source, selected: !source.selected } : source
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setSources(prev => 
      prev.map(source => 
        source.id === id ? { ...source, expanded: !source.expanded } : source
      )
    );
  };

  const togglePageSelection = (sourceId: string, pageId: string) => {
    setSources(prev => 
      prev.map(source => {
        if (source.id === sourceId && source.scrapedPages) {
          const updatedPages = source.scrapedPages.map(page => 
            page.id === pageId ? { ...page, selected: !(page as any).selected } : page
          );
          return { ...source, scrapedPages: updatedPages };
        }
        return source;
      })
    );
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

  // Calculate actual page counts
  const totalPages = sources
    .filter(s => s.status === "completed")
    .reduce((sum, s) => sum + (s.pageCount || 1), 0);
  const selectedPages = sources
    .filter(s => s.selected && s.status === "completed")
    .reduce((sum, s) => sum + (s.pageCount || 1), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Content Library</h2>
          <p className="text-muted-foreground">
            Upload and manage content sources for AI training
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{selectedPages}</div>
          <div className="text-sm text-muted-foreground">pages selected</div>
          <div className="text-xs text-muted-foreground">{totalPages} total pages</div>
        </div>
      </div>

      {/* Add Content */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* File Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Drop files or click</p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Add URL */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Add URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="https://example.com/page"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
              className="!bg-white !text-black !border-gray-300"
              style={{backgroundColor: 'white !important', color: 'black !important', borderColor: '#d1d5db !important'}}
            />
            <Button onClick={handleUrlAdd} disabled={!newUrl} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Scrape
            </Button>
          </CardContent>
        </Card>

        {/* Add Domain */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Crawl Domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDomainAdd()}
              className="!bg-white !text-black !border-gray-300"
              style={{backgroundColor: 'white !important', color: 'black !important', borderColor: '#d1d5db !important'}}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Pages"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-20"
                min="1"
                max="50"
              />
              <Button onClick={handleDomainAdd} disabled={!newDomain} className="flex-1" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crawl
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sources */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Content Sources ({sources.length} domains)
            </CardTitle>
            <CardDescription>
              Expand domains to see individual pages and select which to include in AI training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sources.map((source) => (
                <div key={source.id} className="border rounded-lg">
                  {/* Domain Header */}
                  <div className="flex items-center gap-3 p-3 hover:bg-accent/50">
                    <Checkbox
                      checked={source.selected}
                      onCheckedChange={() => toggleSelection(source.id)}
                      disabled={source.status !== "completed"}
                    />
                    
                    <div className="flex items-center gap-2">
                      {getTypeIcon(source.type)}
                      {getStatusIcon(source.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{source.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={getStatusColor(source.status)}>
                          {source.status}
                        </span>
                        {source.size && <span>• {source.size}</span>}
                        {source.pageCount && source.pageCount > 1 && (
                          <span>• {source.pageCount} pages</span>
                        )}
                      </div>
                    </div>

                    {/* Expand button for domains with multiple pages */}
                    {source.type === "domain" && source.pageCount && source.pageCount > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpanded(source.id)}
                        className="h-6 w-6"
                      >
                        {source.expanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(source.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Individual Pages (when expanded) */}
                  {source.expanded && source.scrapedPages && source.scrapedPages.length > 0 && (
                    <div className="border-t">
                      {source.scrapedPages.map((page, index) => (
                        <div
                          key={page.id}
                          className="flex items-center gap-3 p-3 pl-6 text-sm border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={(page as any).selected || false}
                            onCheckedChange={() => togglePageSelection(source.id, page.id)}
                          />
                          <span className="text-xs text-muted-foreground font-mono w-6">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{page.title || 'Untitled'}</p>
                            <p className="truncate text-xs text-muted-foreground">{page.url}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {page.scraped_at && new Date(page.scraped_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}