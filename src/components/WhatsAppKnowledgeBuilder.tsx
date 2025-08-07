import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ExternalLink, Book, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CrawlerService } from '@/services/CrawlerService';

const WHATSAPP_DOCS_URLS = [
  {
    url: 'https://developers.facebook.com/docs/whatsapp/overview/',
    title: 'WhatsApp Business Platform Overview',
    category: 'Overview'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/',
    title: 'WhatsApp Cloud API',
    category: 'Cloud API'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/',
    title: 'Business Management API',
    category: 'Management API'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/webhooks/',
    title: 'Webhooks Documentation',
    category: 'Webhooks'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages',
    title: 'Messages API Reference',
    category: 'API Reference'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates',
    title: 'Message Templates',
    category: 'Templates'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks',
    title: 'Webhook Setup Guide',
    category: 'Setup'
  },
  {
    url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media',
    title: 'Media API Reference',
    category: 'Media'
  }
];

export const WhatsAppKnowledgeBuilder: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [completedUrls, setCompletedUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const buildWhatsAppKnowledge = async () => {
    setIsBuilding(true);
    setProgress(0);
    setCompletedUrls([]);
    setErrors([]);

    try {
      for (let i = 0; i < WHATSAPP_DOCS_URLS.length; i++) {
        const docItem = WHATSAPP_DOCS_URLS[i];
        setCurrentUrl(docItem.title);
        
        try {
          console.log(`Scraping: ${docItem.title}`);
          const result = await CrawlerService.scrapeUrl(docItem.url);
          
          if (result.success) {
            setCompletedUrls(prev => [...prev, docItem.url]);
            toast({
              title: "Scraped Successfully",
              description: `Added ${docItem.title} to knowledge base`,
              duration: 2000,
            });
          } else {
            setErrors(prev => [...prev, `Failed to scrape ${docItem.title}: ${result.error}`]);
          }
        } catch (error) {
          const errorMsg = `Error scraping ${docItem.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          setErrors(prev => [...prev, errorMsg]);
        }
        
        setProgress(((i + 1) / WHATSAPP_DOCS_URLS.length) * 100);
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "WhatsApp Knowledge Built",
        description: `Successfully scraped ${completedUrls.length}/${WHATSAPP_DOCS_URLS.length} documentation pages`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error Building Knowledge",
        description: error instanceof Error ? error.message : 'Failed to build WhatsApp knowledge base',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsBuilding(false);
      setCurrentUrl('');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-6 w-6" />
          WhatsApp Business API Knowledge Builder
        </CardTitle>
        <p className="text-muted-foreground">
          Build comprehensive WhatsApp Business API expertise by scraping Meta's official documentation.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={buildWhatsAppKnowledge}
            disabled={isBuilding}
            size="lg"
            className="flex items-center gap-2"
          >
            {isBuilding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building Knowledge...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Build WhatsApp Knowledge Base
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {isBuilding && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {Math.round(progress)}%</span>
              <span>{completedUrls.length}/{WHATSAPP_DOCS_URLS.length} completed</span>
            </div>
            <Progress value={progress} className="w-full" />
            {currentUrl && (
              <p className="text-sm text-muted-foreground">Currently scraping: {currentUrl}</p>
            )}
          </div>
        )}

        <Separator />

        {/* Documentation Sources */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Documentation Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WHATSAPP_DOCS_URLS.map((docItem, index) => (
              <div 
                key={index}
                className={`p-3 border rounded-lg transition-colors ${
                  completedUrls.includes(docItem.url) 
                    ? 'bg-card border-border' 
                    : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{docItem.title}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {docItem.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {completedUrls.includes(docItem.url) && (
                      <Badge variant="default" className="text-xs">
                        ✓
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(docItem.url, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">Errors</h3>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive bg-card p-2 rounded border">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Status Summary */}
        {completedUrls.length > 0 && !isBuilding && (
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground">Knowledge Base Status</h3>
            <p className="text-sm text-muted-foreground">
              Successfully added {completedUrls.length} WhatsApp Business API documentation pages. 
              Your AI now has comprehensive knowledge of Meta's WhatsApp platform including API endpoints, 
              webhooks, templates, and best practices.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};