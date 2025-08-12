import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedContent {
  url: string
  title: string
  content: string
  description: string
  links: string[]
  scraped_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Scraping URL:', url)

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CustomCrawler/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract content using regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=['"']description['"'][^>]*content=['"']([^'"]+)['"'][^>]*>/i)
    const description = descMatch ? descMatch[1].trim() : ''

    // Remove script and style tags
    let cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
    cleanHtml = cleanHtml.replace(/<style[^>]*>.*?<\/style>/gis, '')
    cleanHtml = cleanHtml.replace(/<nav[^>]*>.*?<\/nav>/gis, '')
    cleanHtml = cleanHtml.replace(/<footer[^>]*>.*?<\/footer>/gis, '')
    cleanHtml = cleanHtml.replace(/<header[^>]*>.*?<\/header>/gis, '')

    // Extract text content
    const textContent = cleanHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000) // Limit content size

    // Extract links for crawling
    const linkMatches = html.matchAll(/<a[^>]*href=['"']([^'"]+)['"'][^>]*>/gi)
    const links = Array.from(linkMatches)
      .map(match => {
        try {
          const href = match[1]
          if (href.startsWith('http')) return href
          if (href.startsWith('/')) return new URL(href, url).href
          return new URL(href, url).href
        } catch {
          return null
        }
      })
      .filter(link => link && link.startsWith('http'))
      .slice(0, 50) // Limit number of links

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Save scraped content to database
    const scrapedContent: ScrapedContent = {
      url,
      title,
      content: textContent,
      description,
      links,
      scraped_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('scraped_pages')
      .upsert(scrapedContent, { onConflict: 'url' })
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Successfully scraped and saved:', url)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: scrapedContent,
        message: 'Page scraped successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to scrape URL',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})