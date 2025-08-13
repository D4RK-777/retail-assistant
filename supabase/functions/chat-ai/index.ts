// @ts-ignore - Deno URL imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// @ts-ignore - Deno URL imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Deno global types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
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
    const { message, context, sessionId, personality, personalityPrompt }: { 
      message: string; 
      context: any; 
      sessionId: string;
      personality?: string;
      personalityPrompt?: string;
    } = await req.json()
    console.log('Received message:', message)
    console.log('Personality:', personality)

    // Enhanced context retrieval with smart categorization
    let enhancedContext = context || '';
    
    try {
      // Determine search strategy based on user question
      const searchTerms = message.toLowerCase();
      
      // Build the query with proper Supabase filters
      let query = supabase
        .from('assistant_content_chunks')
        .select('title, content, category, content_type, importance_score, tags, knowledge_level')
        .order('importance_score', { ascending: false })
        .limit(8);

      // Apply filters based on search terms
      if (searchTerms.includes('template')) {
        query = query.or('content.ilike.%template%,title.ilike.%template%');
      } else if (searchTerms.includes('campaign')) {
        query = query.or('content.ilike.%campaign%,title.ilike.%campaign%');
      } else if (searchTerms.includes('message') || searchTerms.includes('conversation') || searchTerms.includes('marketing')) {
        query = query.or('content.ilike.%message%,content.ilike.%conversation%,content.ilike.%marketing%');
      } else if (searchTerms.includes('connect') || searchTerms.includes('channel')) {
        query = query.or('content.ilike.%connect%,content.ilike.%channel%');
      } else {
        // Fallback to general content search
        const searchWords = message.split(' ').slice(0, 3).join('%');
        query = query.ilike('content', `%${searchWords}%`);
      }

      const { data: relevantContent, error: searchError } = await query;

      if (!searchError && relevantContent && relevantContent.length > 0) {
        const contextSections = relevantContent.map((item: any) => 
          `**${item.title || 'Knowledge Item'}** (${item.category}/${item.content_type} - ${item.knowledge_level})\n${item.content.slice(0, 1200)}...\n`
        ).join('\n---\n');
        
        enhancedContext = `${context}\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${contextSections}`;
        console.log(`Enhanced context with ${relevantContent.length} relevant items using smart search`);
      }
    } catch (error: any) {
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

    // Create the prompt based on whether personality is provided
    let prompt: string;
    
    if (personality && personalityPrompt) {
      // Use personality-specific prompt with knowledge base integration
      prompt = `${personalityPrompt}

**KNOWLEDGE BASE ACCESS:**
You have access to comprehensive retail and platform knowledge including:

RETAIL PLATFORM FEATURES:
- Product catalog management
- Customer service automation
- Inventory and order management
- Sales analytics and reporting
- Customer communication tools

KNOWLEDGE BASE CONTEXT:
${enhancedContext}

**IMPORTANT**: Maintain your personality characteristics while providing helpful, accurate information from the knowledge base. Always respond as ${personality}, as a retail assistant.

User Question: ${message}

Respond as ${personality}:`;
    } else {
      // Use default retail assistant prompt
      prompt = `You are a helpful retail AI assistant. You have comprehensive knowledge of retail operations, customer service, and business management.

INSTRUCTIONS:
- Answer questions directly and helpfully as a retail assistant expert
- Use the provided context to give accurate information about retail operations
- Draw on your retail and customer service knowledge when relevant
- Never mention that you're analyzing the question or referencing context
- Act like you naturally know everything about retail operations and customer service
- Be helpful, friendly, and confident
- Give specific, actionable answers
- Always respond as a retail assistant
- Format your responses using proper markdown (use **bold**, bullet points, etc.)

RETAIL KNOWLEDGE BASE:

RETAIL OPERATIONS & CUSTOMER SERVICE:
- **Product Management**: Inventory tracking, product catalogs, and stock management
- **Customer Service**: Order support, returns processing, and customer inquiries
- **Sales Support**: Product recommendations, pricing information, and purchase assistance
- **Store Operations**: Hours, locations, policies, and general store information
- **Order Management**: Order status, tracking, shipping, and delivery information

CUSTOMER INTERACTION FEATURES:
- **Product Recommendations**: Personalized suggestions based on customer preferences
- **Order Assistance**: Help with placing orders, modifications, and cancellations
- **Support Queries**: Returns, exchanges, warranty information, and troubleshooting
- **Store Information**: Location details, hours, contact information, and policies
- **Inventory Inquiries**: Product availability, stock levels, and restock notifications

CUSTOMER DATA & PERSONALIZATION:
- Customer purchase history and preferences
- Personalized product recommendations
- Customer service interaction history
- Loyalty program information and benefits
- Targeted promotions and special offers

ANALYTICS & INSIGHTS:
- Customer interaction tracking and analysis
- Sales performance and conversion metrics
- Customer satisfaction and feedback monitoring
- Product performance and popularity tracking
- Customer service efficiency and response times

KNOWLEDGE BASE:
${enhancedContext}

User Question: ${message}

Provide a direct, helpful answer as a retail assistant:`;
    }

    // Call Gemini API
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

    const data: any = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'

    // Calculate response time
    const responseTime = Date.now() - interactionStartTime

    // Log user interaction for learning and analytics
    const interactionData = {
      session_id: sessionId || 'anonymous',
      user_id: null, // Add user ID if authenticated
      user_message: message,
      ai_response: aiResponse,
      personality_used: personality || 'Retail Assistant',
      context_used: context || 'Default platform knowledge',
      response_time_ms: responseTime,
      created_at: new Date().toISOString()
    }

    // Store interaction (don't await to avoid slowing response)
    supabase.from('assistant_user_interactions').insert(interactionData).then((result: any) => {
      if (result.error) {
        console.error('Failed to log interaction:', result.error)
      }
    })

    // Check if this reveals knowledge gaps
    const isLowQualityResponse = aiResponse.includes('Sorry') || 
                                aiResponse.includes('I don\'t know') ||
                                aiResponse.length < 100

    // Note: Knowledge gaps logging removed as we don't have this table in assistant schema
    if (isLowQualityResponse) {
      console.log('Low quality response detected for message:', message)
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