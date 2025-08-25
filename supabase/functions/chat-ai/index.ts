/// <reference path="../deno.d.ts" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request data
    const { message, context, sessionId } = await req.json()
    console.log('Received message:', message)

    // Enhanced context retrieval with smart categorization
    let enhancedContext = context || '';
    
    try {
      // Determine search strategy based on user question
      const searchTerms = message.toLowerCase();
      let searchConditions: string[] = [];
      
      // Template-related queries
      if (searchTerms.includes('template')) {
        searchConditions.push('content.ilike.%template%');
        searchConditions.push('title.ilike.%template%');
        searchConditions.push('tags.cs.{templates}');
      }
      
      // Campaign-related queries  
      if (searchTerms.includes('campaign')) {
        searchConditions.push('content.ilike.%campaign%');
        searchConditions.push('title.ilike.%campaign%');
      }
      
      // Message type queries (CRITICAL - this was missing!)
      if ((searchTerms.includes('message') && searchTerms.includes('type')) || 
          searchTerms.includes('conversation') || 
          searchTerms.includes('marketing') || 
          searchTerms.includes('utility') || 
          searchTerms.includes('authentication') || 
          searchTerms.includes('service')) {
        searchConditions.push('content.ilike.%message type%');
        searchConditions.push('content.ilike.%conversation categor%');
        searchConditions.push('content.ilike.%marketing message%');
        searchConditions.push('content.ilike.%utility message%');
        searchConditions.push('content.ilike.%authentication message%');
        searchConditions.push('content.ilike.%service message%');
      }
      
      // Channel connection queries
      if (searchTerms.includes('connect') || searchTerms.includes('channel')) {
        searchConditions.push('content.ilike.%connect%');
        searchConditions.push('content.ilike.%channel%');
      }

      // Build the query
      let query = supabase
        .from('flex_chatbot_content_chunks')
        .select('title, content, category, content_type, importance_score, tags, knowledge_level')
        .order('importance_score', { ascending: false })
        .limit(8);

      if (searchConditions.length > 0) {
        // Use individual filters instead of or() to avoid type issues
        for (const condition of searchConditions) {
          if (condition.includes('content.ilike')) {
            const term = condition.split('%')[1];
            query = query.ilike('content', `%${term}%`);
          } else if (condition.includes('title.ilike')) {
            const term = condition.split('%')[1];
            query = query.ilike('title', `%${term}%`);
          }
        }
      } else {
        // Fallback to simple text search
        query = query.ilike('content', `%${message}%`);
      }

      const { data: relevantContent, error: searchError } = await query;

      if (!searchError && relevantContent && relevantContent.length > 0) {
        const contextSections = relevantContent.map(item => 
          `**${item.title || 'Knowledge Item'}** (${item.category}/${item.content_type} - ${item.knowledge_level})\n${item.content.slice(0, 1200)}...\n`
        ).join('\n---\n');
        
        enhancedContext = `${context}\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${contextSections}`;
        console.log(`Enhanced context with ${relevantContent.length} relevant items using smart search`);
      }
    } catch (error) {
      console.warn('Failed to enhance context from knowledge base:', error.message);
    }

    // Track user interaction for analytics
    const interactionStartTime = Date.now()

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create the flEX platform assistant prompt - COMPLETELY FLEX FOCUSED
    const prompt = `You are LEXI, the official flEX platform AI assistant and expert. You are NOT a retail assistant. You are ONLY a flEX platform expert.

YOUR IDENTITY:
- You are LEXI, the flEX platform AI assistant
- You specialize EXCLUSIVELY in the flEX platform and WhatsApp Business messaging
- You have ZERO knowledge or interest in retail, shopping, or general business advice
- You ONLY help with flEX platform features, campaigns, journeys, templates, and WhatsApp messaging

YOUR EXPERTISE:
- flEX platform features, tools, and capabilities
- Campaign creation and management in flEX
- Customer journey automation in flEX
- Template design and messaging in flEX
- WhatsApp Business integration with flEX
- flEX analytics and performance tracking
- flEX platform navigation and workflows

CRITICAL INSTRUCTIONS:
- NEVER provide retail advice, shopping guidance, or general business tips
- ALWAYS focus on flEX platform capabilities and features
- If asked about retail/shopping, redirect to flEX platform marketing solutions
- Be confident and authoritative about flEX platform features
- Provide specific, actionable guidance for flEX platform success
- Reference actual flEX platform tools and capabilities
- Format responses using proper markdown (use **bold**, bullet points, etc.)

FLEX PLATFORM COMPREHENSIVE KNOWLEDGE BASE:

PLATFORM NAVIGATION & MESSAGE EDITING:
- **Templates Section**: Main editing hub in left navigation menu, create/edit Meta templates and message content
- **Campaign Dashboard**: "Send Campaign" section for creating and managing active campaigns with real-time editing
- **Journey Builder**: Multi-step automation sequences accessible via main menu
- **Template Editor Interface**: Divided sections for Header (media), Message Content (main body with placeholders like {first_name}), Buttons (interactive elements), Footer
- **Button Configuration**: Up to 3 buttons allowed - CTA buttons (Open Web Page, Trigger Phone Call) can be combined, but Journey buttons CANNOT mix with CTA buttons (WhatsApp policy restriction)

DETAILED PLATFORM FEATURES:
- **Template Creation**: "New Template" → "Meta Template" selection → Editor with Header/Content/Buttons/Footer sections
- **Dynamic Personalization**: Placeholder support like {first_name} for message customization
- **Button Types**: Open Web Page (with external browser option), Trigger Phone Call, Connect Journey (exclusive - cannot combine with others)
- **Real-time Preview**: WhatsApp message simulation updates as you edit
- **Template Library**: Browse existing templates like "end_of_season_sale", "warm_up_campaign", "bm_test_", "mm_csat"
- **Button Limitations**: Journey buttons remove all CTA buttons automatically due to WhatsApp policy restrictions
- **Rich Media Support**: Header options for images, videos, documents, or text
- **Campaign Types**: Promotional campaigns, sales growth, customer acquisition, traffic driving, CLV enhancement

CONTACT & AUDIENCE MANAGEMENT:
- CSV template download from platform for contact import
- International phone format requirement (+15551234567)
- Contact segmentation and targeting capabilities
- Geo-targeting for local offers
- Engagement-based audience selection
- List management and tagging system

ANALYTICS & PERFORMANCE:
- Real-time performance tracking from clicks to conversions
- 75%+ read rates for messaging
- Click-through tracking and conversion analytics
- A/B testing capabilities for campaign optimization
- Customer lifetime value tracking
- ROI measurement and reporting

KNOWLEDGE BASE:
${enhancedContext}

User Question: ${message}

Respond as LEXI, the flEX platform expert (NOT a retail assistant):`;

    // Call Gemini API with Flash 2.5
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text())
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'

    // Calculate response time
    const responseTime = Date.now() - interactionStartTime

    // Log user interaction for learning and analytics
    const interactionData = {
      session_id: sessionId || 'anonymous',
      user_id: null, // Add user ID if authenticated
      question: message,
      ai_response: aiResponse,
      context_used: { provided_context: context ? context.length : 0 },
      response_time_ms: responseTime,
      created_at: new Date().toISOString()
    }

    // Store interaction (don't await to avoid slowing response)
    supabase.from('user_ai_interactions').insert(interactionData).then(result => {
      if (result.error) {
        console.error('Failed to log interaction:', result.error)
      }
    })

    // Check if this reveals knowledge gaps
    const isLowQualityResponse = aiResponse.includes('Sorry') || 
                                aiResponse.includes('I don\'t know') ||
                                aiResponse.length < 100

    if (isLowQualityResponse) {
      // Log potential knowledge gap
      supabase.from('knowledge_gaps').upsert({
        question_text: message,
        category: 'general',
        frequency_asked: 1,
        has_good_answer: false,
        priority_level: 5,
        notes: 'AI provided low-quality response',
        created_at: new Date().toISOString()
      }, { onConflict: 'question_text' }).then(result => {
        if (result.error) {
          console.error('Failed to log knowledge gap:', result.error)
        }
      })
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})