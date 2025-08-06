import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { message, context, isWhatsAppQuery = false } = await req.json()
    console.log('Received message:', message)
    console.log('Received context:', context)
    console.log('Is WhatsApp query:', isWhatsAppQuery)

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('GEMINI_API_KEY found:', !!geminiApiKey)
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

    // Construct the prompt for Gemini with WhatsApp expertise
    const basePrompt = isWhatsAppQuery 
      ? `You are an absolute expert on the WhatsApp Business API and Meta's developer platform. You have comprehensive knowledge of:
- WhatsApp Business Platform and Cloud API
- Message templates, webhooks, and API endpoints  
- Business Management API and authentication
- Rate limiting, best practices, and compliance
- All Meta developer documentation and guidelines

Provide detailed, technical responses with code examples when relevant. Reference specific API endpoints, parameters, and response formats.`
      : `You are an expert AI assistant with access to a knowledge base.`;

    const prompt = `${basePrompt}

Context: ${context}

User Question: ${message}

Please provide a helpful, accurate response based on the context provided. If the context doesn't contain relevant information for WhatsApp queries, use your extensive knowledge of the WhatsApp Business API platform.`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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