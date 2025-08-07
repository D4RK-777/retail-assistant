import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, type } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get scraped pages to process
    const { data: pages, error: pagesError } = await supabase
      .from('scraped_pages')
      .select('*');

    if (pagesError) {
      throw new Error(`Failed to fetch pages: ${pagesError.message}`);
    }

    if (!pages || pages.length === 0) {
      throw new Error('No content found to process');
    }

    console.log(`Processing ${pages.length} pages for session ${sessionId}`);

    // Update session status to processing
    await supabase
      .from('ai_training_sessions')
      .update({ 
        status: 'processing',
        total_content: pages.length,
        processed_content: 0
      })
      .eq('id', sessionId);

    let processedCount = 0;

    // Process each page
    for (const page of pages) {
      try {
        // Generate embeddings using Google Gemini
        const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: {
              parts: [{
                text: `${page.title || ''}\n\n${page.content || ''}`.slice(0, 8000)
              }]
            }
          }),
        });

        if (!embeddingResponse.ok) {
          console.error(`Failed to generate embedding for page ${page.id}`);
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.embedding.values;

        // Store content chunk with embedding
        const { error: chunkError } = await supabase
          .from('content_chunks')
          .upsert({
            source_id: page.id,
            content: page.content,
            title: page.title,
            url: page.url,
            embedding: JSON.stringify(embedding),
            chunk_index: 0,
            token_count: Math.ceil((page.content?.length || 0) / 4) // Rough token estimate
          });

        if (chunkError) {
          console.error(`Failed to store chunk for page ${page.id}:`, chunkError);
        } else {
          processedCount++;
          
          // Update progress
          await supabase
            .from('ai_training_sessions')
            .update({ 
              processed_content: processedCount,
              progress: Math.round((processedCount / pages.length) * 100)
            })
            .eq('id', sessionId);
        }

      } catch (error) {
        console.error(`Error processing page ${page.id}:`, error);
      }
    }

    // Mark session as completed
    await supabase
      .from('ai_training_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('id', sessionId);

    console.log(`Training session ${sessionId} completed. Processed ${processedCount}/${pages.length} pages.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedCount,
        totalPages: pages.length,
        sessionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-content:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});