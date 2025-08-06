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
    const { message, context, analysis, enhancedPrompt, isWhatsAppQuery = false } = await req.json()
    console.log('Received message:', message)
    console.log('Received context:', context)
    console.log('Query analysis:', analysis)
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

    // Use enhanced prompt if provided, otherwise fall back to original logic
    const promptToUse = enhancedPrompt || (isWhatsAppQuery 
      ? `You are a helpful WhatsApp messaging assistant. ALWAYS give direct, practical answers immediately.

CRITICAL RULES:
- Lead with the most likely answer first
- Be concise - 2-3 sentences maximum unless they ask for more detail
- Give specific numbers and limits when asked
- Only ask clarifying questions if absolutely necessary
- Focus on what they can do, not what they can't
- Use encouraging, confident language

For character limits: Give the specific number immediately, then add context about why it's useful.
For features: Explain what it does and how it helps their messaging.
For problems: Give the solution first, then brief context if needed.

Example: "You can use up to 60 characters in your header - that's perfect for a clear, punchy title that grabs attention!"`
      : `You are a helpful platform assistant. ALWAYS give direct, practical answers immediately.

CRITICAL RULES:
- Lead with the most likely answer first  
- Be concise - 2-3 sentences maximum
- Give specific information when asked
- Only ask questions if the request is completely unclear
- Focus on practical solutions
- Use confident, helpful language`);

    const prompt = `${promptToUse}

Context: ${context}

User Question: ${message}

Please provide a helpful, friendly response. If the question could have multiple interpretations, start with the most common scenario and ask if they need information about other specific cases.`;

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