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

    // Get both scraped pages and uploaded files to process
    const [scrapedPagesResult, uploadedFilesResult] = await Promise.all([
      supabase.from('scraped_pages').select('*'),
      supabase.from('uploaded_files').select('*').filter('content', 'not.is', null)
    ]);

    if (scrapedPagesResult.error) {
      throw new Error(`Failed to fetch scraped pages: ${scrapedPagesResult.error.message}`);
    }

    if (uploadedFilesResult.error) {
      throw new Error(`Failed to fetch uploaded files: ${uploadedFilesResult.error.message}`);
    }

    // Combine all content sources
    const scrapedPages = (scrapedPagesResult.data || []).map(page => ({
      ...page,
      source_type: 'scraped_page'
    }));
    
    const uploadedFiles = (uploadedFilesResult.data || []).map(file => ({
      id: file.id,
      title: file.original_name,
      content: file.content,
      url: file.storage_path,
      source_type: 'uploaded_file'
    }));

    const allContent = [...scrapedPages, ...uploadedFiles];

    if (allContent.length === 0) {
      throw new Error('No content found to process');
    }

    console.log(`Processing ${allContent.length} content items (${scrapedPages.length} scraped pages, ${uploadedFiles.length} uploaded files) for session ${sessionId}`);

    // Create session record first
    const { error: sessionError } = await supabase
      .from('ai_training_sessions')
      .insert({ 
        id: sessionId,
        type,
        status: 'processing',
        total_content: allContent.length,
        processed_content: 0
      });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      throw new Error(`Failed to create training session: ${sessionError.message}`);
    }

    let processedCount = 0;

    // Process each content item
    for (const content of allContent) {
      try {
        // Generate embeddings using Google Gemini
        console.log(`Generating embedding for ${content.source_type} ${content.id}: ${content.title}`);
        
        const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: {
              parts: [{
                text: `${content.title || ''}\n\n${content.content || ''}`.slice(0, 8000)
              }]
            }
          }),
        });

        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          console.error(`Failed to generate embedding for ${content.source_type} ${content.id}:`, errorText);
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        console.log(`Embedding response for ${content.source_type} ${content.id}:`, JSON.stringify(embeddingData).slice(0, 200));
        
        if (!embeddingData.embedding || !embeddingData.embedding.values) {
          console.error(`Invalid embedding response for ${content.source_type} ${content.id}:`, embeddingData);
          continue;
        }
        
        const embedding = embeddingData.embedding.values;

        // Store content chunk with embedding
        console.log(`Storing chunk for ${content.source_type} ${content.id} with embedding length: ${embedding.length}`);
        
        const { error: chunkError } = await supabase
          .from('content_chunks')
          .upsert({
            source_id: content.id,
            content: content.content,
            title: content.title,
            url: content.url,
            embedding: embedding, // Gemini returns array directly
            chunk_index: 0,
            token_count: Math.ceil((content.content?.length || 0) / 4) // Rough token estimate
          });

        console.log(`Upsert result for ${content.source_type} ${content.id}:`, chunkError ? 'ERROR' : 'SUCCESS');

        if (chunkError) {
          console.error(`Failed to store chunk for ${content.source_type} ${content.id}:`, JSON.stringify(chunkError, null, 2));
        } else {
          processedCount++;
          console.log(`Successfully processed ${content.source_type} ${content.id} (${processedCount}/${allContent.length})`);
          
          // Update progress
          const { error: progressError } = await supabase
            .from('ai_training_sessions')
            .update({ 
              processed_content: processedCount,
              progress: Math.round((processedCount / allContent.length) * 100)
            })
            .eq('id', sessionId);

          if (progressError) {
            console.error('Failed to update progress:', progressError);
          }
        }

      } catch (error) {
        console.error(`Error processing ${content.source_type} ${content.id}:`, error);
      }
    }

    // Mark session as completed
    const { error: completionError } = await supabase
      .from('ai_training_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('id', sessionId);

    if (completionError) {
      console.error('Failed to mark session as completed:', completionError);
    }

    console.log(`Training session ${sessionId} completed. Processed ${processedCount}/${allContent.length} content items.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedCount,
        totalPages: allContent.length,
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