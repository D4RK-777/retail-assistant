import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export interface CrawledData {
  url: string;
  content: string;
  markdown?: string;
  title?: string;
  description?: string;
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static CRAWLED_DATA_KEY = 'crawled_data';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static getCrawledData(): CrawledData[] {
    const data = localStorage.getItem(this.CRAWLED_DATA_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveCrawledData(data: CrawledData[]): void {
    localStorage.setItem(this.CRAWLED_DATA_KEY, JSON.stringify(data));
  }

  static addCrawledContent(newData: CrawledData): void {
    const existingData = this.getCrawledData();
    const updatedData = [...existingData, newData];
    this.saveCrawledData(updatedData);
  }

  static removeCrawledContent(url: string): void {
    const existingData = this.getCrawledData();
    const filteredData = existingData.filter(item => item.url !== url);
    this.saveCrawledData(filteredData);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Firecrawl API key');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // Simple test scrape to verify the API key
      const testResponse = await this.firecrawlApp.scrapeUrl('https://example.com');
      return testResponse.success;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static async scrapeUrl(url: string): Promise<{ success: boolean; error?: string; data?: CrawledData }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found. Please set your API key first.' };
    }

    try {
      console.log('Scraping URL with Firecrawl:', url);
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const scrapeResponse = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta'],
        excludeTags: ['nav', 'footer', 'header', 'script', 'style'],
        onlyMainContent: true
      });

      if (!scrapeResponse.success) {
        console.error('Scrape failed:', scrapeResponse);
        return { 
          success: false, 
          error: 'Failed to scrape URL. Please check the URL and try again.' 
        };
      }

      const crawledData: CrawledData = {
        url: url,
        content: scrapeResponse.html || '',
        markdown: scrapeResponse.markdown || '',
        title: scrapeResponse.metadata?.title || '',
        description: scrapeResponse.metadata?.description || ''
      };

      // Save to local storage
      this.addCrawledContent(crawledData);

      console.log('Scraping successful:', crawledData);
      return { 
        success: true,
        data: crawledData 
      };
    } catch (error) {
      console.error('Error during scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }

  static async crawlDomain(domain: string): Promise<{ success: boolean; error?: string; data?: CrawledData[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found. Please set your API key first.' };
    }

    try {
      console.log('Crawling domain with Firecrawl:', domain);
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(domain, {
        limit: 50, // Limit to prevent excessive usage
        scrapeOptions: {
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta'],
          excludeTags: ['nav', 'footer', 'header', 'script', 'style'],
          onlyMainContent: true
        },
        allowBackwardLinks: false,
        allowExternalLinks: false
      }) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Domain crawl failed:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl domain' 
        };
      }

      const successResponse = crawlResponse as CrawlStatusResponse;
      const crawledPages: CrawledData[] = [];

      if (successResponse.data) {
        for (const page of successResponse.data) {
          const crawledData: CrawledData = {
            url: page.metadata?.sourceURL || page.url || '',
            content: page.html || '',
            markdown: page.markdown || '',
            title: page.metadata?.title || '',
            description: page.metadata?.description || ''
          };
          
          crawledPages.push(crawledData);
          // Save each page to local storage
          this.addCrawledContent(crawledData);
        }
      }

      console.log('Domain crawling successful:', crawledPages);
      return { 
        success: true,
        data: crawledPages 
      };
    } catch (error) {
      console.error('Error during domain crawling:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }

  static generateKnowledgeContext(): string {
    const crawledData = this.getCrawledData();
    if (crawledData.length === 0) {
      return '';
    }

    let context = '\n\n=== KNOWLEDGE BASE CONTENT ===\n';
    crawledData.forEach((item, index) => {
      context += `\n--- Source ${index + 1}: ${item.title || item.url} ---\n`;
      context += `URL: ${item.url}\n`;
      if (item.description) {
        context += `Description: ${item.description}\n`;
      }
      context += `Content:\n${item.markdown || item.content}\n`;
      context += '\n' + '='.repeat(50) + '\n';
    });

    return context;
  }
}