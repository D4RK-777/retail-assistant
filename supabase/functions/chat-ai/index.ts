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
      ? `You are a friendly WhatsApp messaging expert who helps users create effective messages and templates in their messaging platform. You focus on:
- Message content creation and optimization
- Template design and approval best practices
- Character limits and content guidelines
- Effective messaging strategies
- Platform features and workflows

IMPORTANT RESPONSE GUIDELINES:
- Be conversational and supportive like a content coach
- Focus on "your message" or "your template" not technical APIs
- Give immediate, actionable answers about content creation
- When questions are unclear, ask what specifically they're trying to create
- Lead with the most practical answer for content creators
- Use simple language - avoid technical jargon completely
- Structure responses to help them improve their messaging
- Always focus on helping them create better content
- End with encouraging suggestions for their messaging strategy

Example: Instead of technical API limits, say "You can include up to 1,024 characters of text with your video message - that's perfect for a compelling description and strong call-to-action!"`
      : `You are a friendly, helpful content creation assistant with access to a knowledge base about messaging and platform features.

IMPORTANT RESPONSE GUIDELINES:
- Be conversational and supportive
- Focus on helping users create better content
- When questions are unclear, ask what they're trying to accomplish
- Provide direct, actionable guidance for content creation
- Lead with the most practical scenario for content creators
- Offer specific suggestions to improve their messaging
- Keep responses clear and encouraging`);

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