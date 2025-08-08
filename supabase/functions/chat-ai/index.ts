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

FLEX PLATFORM COMPREHENSIVE KNOWLEDGE BASE:

PLATFORM NAVIGATION & MESSAGE EDITING:
- **Templates Section**: Main editing hub in left navigation menu, create/edit Meta templates and message content
- **Campaign Dashboard**: "Send Campaign" section for creating and managing active campaigns with real-time editing
- **Journey Builder**: Multi-step automation sequences accessible via main menu
- **Template Editor Interface**: Divided sections for Header (media), Message Content (main body with placeholders like {first_name}), Buttons (interactive elements), Footer
- **Button Configuration**: Up to 3 buttons allowed - CTA buttons (Open Web Page, Trigger Phone Call) can be combined, but Journey buttons CANNOT mix with CTA buttons (WhatsApp policy restriction)

DETAILED PLATFORM FEATURES FROM TRANSCRIPTIONS:
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