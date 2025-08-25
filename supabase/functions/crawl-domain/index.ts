/// <reference path="../deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { domain, maxPages = 10 } = await req.json()
    
    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Crawling domain:', domain, 'max pages:', maxPages)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const startUrl = domain.startsWith('http') ? domain : `https://${domain}`
    const baseUrl = new URL(startUrl)
    
    const visited = new Set<string>()
    const toVisit = [startUrl]
    const results = []
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    while (toVisit.length > 0 && visited.size < maxPages) {
      const currentUrl = toVisit.shift()
      if (!currentUrl) continue
      
      if (visited.has(currentUrl)) continue
      visited.add(currentUrl)

      try {
        console.log(`Scraping ${visited.size}/${maxPages}: ${currentUrl}`)

        // Rate limiting - wait between requests
        if (visited.size > 1) {
          await delay(1000) // 1 second delay between requests
        }

        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CustomCrawler/1.0)'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.status}`)
          continue
        }

        const html = await response.text()
        
        // Extract content
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : ''

        const descMatch = html.match(/<meta[^>]*name=['"']description['"'][^>]*content=['"']([^'"]+)['"'][^>]*>/i)
        const description = descMatch ? descMatch[1].trim() : ''

        // Clean HTML
        let cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
        cleanHtml = cleanHtml.replace(/<style[^>]*>.*?<\/style>/gis, '')
        cleanHtml = cleanHtml.replace(/<nav[^>]*>.*?<\/nav>/gis, '')
        cleanHtml = cleanHtml.replace(/<footer[^>]*>.*?<\/footer>/gis, '')
        cleanHtml = cleanHtml.replace(/<header[^>]*>.*?<\/header>/gis, '')

        const textContent = cleanHtml
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 10000)

        // Extract internal links
        const linkMatches = html.matchAll(/<a[^>]*href=['"']([^'"]+)['"'][^>]*>/gi)
        const links = Array.from(linkMatches)
          .map(match => {
            try {
              const href = match[1]
              if (href.startsWith('http')) {
                const linkUrl = new URL(href)
                return linkUrl.hostname === baseUrl.hostname ? href : null
              }
              if (href.startsWith('/')) return new URL(href, baseUrl.href).href
              return new URL(href, currentUrl).href
            } catch {
              return null
            }
          })
          .filter(link => {
            if (!link) return false
            try {
              const linkUrl = new URL(link)
              return linkUrl.hostname === baseUrl.hostname && 
                     !visited.has(link) && 
                     !toVisit.includes(link) &&
                     !link.includes('#') &&
                     !link.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i)
            } catch {
              return false
            }
          })

        // Add new links to visit queue
        links.slice(0, 10).forEach(link => {
          if (!visited.has(link) && !toVisit.includes(link)) {
            toVisit.push(link)
          }
        })

        // Save to database
        const scrapedContent = {
          url: currentUrl,
          title,
          content: textContent,
          description,
          links: links.filter((link): link is string => link !== null),
          scraped_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('flex_chatbot_scraped_pages')
          .upsert(scrapedContent, { onConflict: 'url' })

        if (error) {
          console.error('Database error for', currentUrl, ':', error)
        } else {
          results.push(scrapedContent)
          console.log(`Successfully saved: ${currentUrl}`)
        }

      } catch (error) {
        console.error(`Error processing ${currentUrl}:`, error.message)
        continue
      }
    }

    console.log(`Crawling completed. Processed ${results.length} pages.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        totalPages: results.length,
        message: `Successfully crawled ${results.length} pages from ${domain}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Crawl error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to crawl domain',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})