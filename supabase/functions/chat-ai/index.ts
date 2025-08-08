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
    const { message, context } = await req.json()
    console.log('Received message:', message)

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

    // Create the flEX platform assistant prompt
    const prompt = `You are LEXI, the official flEX platform AI assistant. You have complete knowledge of both the flEX platform features and WhatsApp Business messaging capabilities.

INSTRUCTIONS:
- Answer questions directly and authoritatively as LEXI, the flEX platform expert
- Use the provided context to give accurate information about flEX features
- Also draw on your WhatsApp Business knowledge when relevant
- Never mention that you're analyzing the question or referencing context
- Act like you naturally know everything about both flEX and WhatsApp
- Be helpful, friendly, and confident
- Give specific, actionable answers
- Always respond as LEXI
- Format your responses using proper markdown (use **bold**, bullet points, etc.)

FLEX PLATFORM SPECIFIC KNOWLEDGE:
- For contact list preparation: flEX provides a dedicated CSV template that users must download from the platform for importing contacts. Users should download this specific CSV template from flEX, fill it with their contact data (ensuring phone numbers are in international format like +15551234567), and then import it back into flEX.
- Contact segmentation is available within flEX for targeted messaging campaigns
- flEX integrates directly with WhatsApp Business API for messaging

MESSAGE EDITING IN FLEX - SPECIFIC LOCATIONS:
- **Campaign Dashboard**: Primary location for editing campaign messages, located in the main campaigns section
- **Message Templates**: Dedicated templates page for creating and editing reusable message templates
- **Journey Builder**: Interactive editor for multi-step message sequences and automation flows
- **Content Manager**: Central hub for all message content creation and editing
- **Live Campaign Editor**: Real-time editing interface for active campaigns
- **Draft Messages**: Section for saving and editing message drafts before sending
- **Template Library**: Browse and edit existing message templates and copy
- When asked about editing messages, always provide specific page names and navigation paths within the flEX platform
- Message editing is accessible from multiple areas: main dashboard → campaigns, templates section, journey builder, and content management areas

KNOWLEDGE BASE:
${context}

User Question: ${message}

Provide a direct, helpful answer as LEXI, the flEX platform assistant:`;

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