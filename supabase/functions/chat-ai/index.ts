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

FLEX PLATFORM SPECIFIC KNOWLEDGE - COMPREHENSIVE GUIDE:

CONTACT MANAGEMENT:
- Download CSV template from flEX platform's contact import section
- Import contacts with international phone format (+15551234567)
- Contact segmentation available for targeted campaigns
- Contact tagging and list management within platform

MESSAGE EDITING - SPECIFIC LOCATIONS AND PAGES:
- **Campaign Dashboard**: Main area for editing active and draft campaigns (/campaigns or /dashboard)
- **Message Templates**: Template library for creating/editing reusable templates (/templates)
- **Journey Builder**: Multi-step message sequence editor (/journeys or /automation)
- **Content Manager**: Central content creation and editing hub (/content)
- **Rich Media Editor**: Advanced editor for videos, images, interactive elements
- **Template Library**: Pre-approved customizable templates with branding tools
- **Draft Messages**: Save and edit messages before sending
- **Live Campaign Editor**: Real-time editing for active campaigns
- **Personalisation Engine**: Message customization with segmentation
- Navigation: Platform → Campaigns/Templates/Journeys → Edit Messages

PLATFORM FEATURES:
- Advanced Rich Media Editor for content creation
- Customizable Template Library with pre-approved templates
- Personalisation Engine for targeted messaging
- Live Performance Tracking and analytics
- Journey creation with multiple steps
- Audience targeting and segmentation
- CSV/API data integration
- Real-time campaign monitoring

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