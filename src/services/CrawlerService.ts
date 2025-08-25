import { supabase } from '@/integrations/supabase/client'

export interface ScrapedPage {
  id: string
  url: string
  title: string
  content: string
  description: string
  links: string[]
  scraped_at: string
  created_at: string
  updated_at: string
}

export interface CrawlResult {
  success: boolean
  error?: string
  data?: ScrapedPage | ScrapedPage[]
  totalPages?: number
  message?: string
}

export class CrawlerService {
  static async scrapeUrl(url: string): Promise<CrawlResult> {
    try {
      console.log('Scraping URL:', url)
      
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      })

      if (error) {
        console.error('Scrape function error:', error)
        return {
          success: false,
          error: error.message || 'Failed to scrape URL'
        }
      }

      return data
    } catch (error) {
      console.error('Scrape service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape URL'
      }
    }
  }

  static async crawlDomain(domain: string, maxPages: number = 10): Promise<CrawlResult> {
    try {
      console.log('Crawling domain:', domain, 'max pages:', maxPages)
      
      const { data, error } = await supabase.functions.invoke('crawl-domain', {
        body: { domain, maxPages }
      })

      if (error) {
        console.error('Crawl function error:', error)
        return {
          success: false,
          error: error.message || 'Failed to crawl domain'
        }
      }

      return data
    } catch (error) {
      console.error('Crawl service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to crawl domain'
      }
    }
  }

  static async getScrapedPages(): Promise<ScrapedPage[]> {
    try {
      const { data, error } = await supabase
        .from('flex_chatbot_scraped_pages')
        .select('*')
        .order('scraped_at', { ascending: false })

      if (error) {
        console.error('Error fetching scraped pages:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getScrapedPages:', error)
      return []
    }
  }

  static async deleteScrapedPage(url: string): Promise<boolean> {
     try {
       const { error } = await supabase
         .from('flex_chatbot_scraped_pages')
         .delete()
         .eq('url', url)

      if (error) {
        console.error('Error deleting scraped page:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteScrapedPage:', error)
      return false
    }
  }

  static async clearAllPages(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('flex_chatbot_scraped_pages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

      if (error) {
        console.error('Error clearing all pages:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in clearAllPages:', error)
      return false
    }
  }

  static generateKnowledgeContext(pages: ScrapedPage[]): string {
    if (pages.length === 0) {
      return ''
    }

    let context = '\n\n=== KNOWLEDGE BASE CONTENT ===\n'
    pages.forEach((page, index) => {
      context += `\n--- Source ${index + 1}: ${page.title || page.url} ---\n`
      context += `URL: ${page.url}\n`
      if (page.description) {
        context += `Description: ${page.description}\n`
      }
      context += `Content:\n${page.content}\n`
      context += '\n' + '='.repeat(50) + '\n'
    })

    return context
  }

  static async searchPages(query: string): Promise<ScrapedPage[]> {
    try {
      const { data, error } = await supabase
        .from('flex_chatbot_scraped_pages')
        .select('*')
        .textSearch('content', query)
        .order('scraped_at', { ascending: false })

      if (error) {
        console.error('Error searching pages:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchPages:', error)
      return []
    }
  }
}