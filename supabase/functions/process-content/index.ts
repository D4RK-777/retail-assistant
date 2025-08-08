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
    const failedItems = [];
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    // Helper function to process a single content item with retries
    const processContentWithRetry = async (content, retryCount = 0) => {
      try {
        // Skip empty content
        if (!content.content || content.content.trim().length === 0) {
          console.warn(`Skipping ${content.source_type} ${content.id}: No content available`);
          return false;
        }

        console.log(`Generating embedding for ${content.source_type} ${content.id}: ${content.title} (attempt ${retryCount + 1})`);
        
        // Prepare content for embedding - ensure it's not too long
        const contentText = `${content.title || ''}\n\n${content.content || ''}`.slice(0, 7000); // Reduced to be safe
        
        const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: {
              parts: [{
                text: contentText
              }]
            }
          }),
        });

        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          throw new Error(`Embedding API error: ${embeddingResponse.status} - ${errorText}`);
        }

        const embeddingData = await embeddingResponse.json();
        
        if (!embeddingData.embedding || !embeddingData.embedding.values) {
          throw new Error(`Invalid embedding response: ${JSON.stringify(embeddingData)}`);
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
            embedding: embedding,
            chunk_index: 0,
            token_count: Math.ceil((content.content?.length || 0) / 4)
          });

        if (chunkError) {
          throw new Error(`Database upsert error: ${JSON.stringify(chunkError)}`);
        }

        console.log(`Successfully processed ${content.source_type} ${content.id}`);
        return true;

      } catch (error) {
        console.error(`Error processing ${content.source_type} ${content.id} (attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying ${content.source_type} ${content.id} in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return await processContentWithRetry(content, retryCount + 1);
        } else {
          console.error(`Failed to process ${content.source_type} ${content.id} after ${maxRetries + 1} attempts`);
          failedItems.push({
            id: content.id,
            type: content.source_type,
            title: content.title,
            error: error.message
          });
          return false;
        }
      }
    };

    // Process each content item with retries
    for (let i = 0; i < allContent.length; i++) {
      const content = allContent[i];
      const success = await processContentWithRetry(content);
      
      if (success) {
        processedCount++;
      }
      
      // Update progress after each item
      const { error: progressError } = await supabase
        .from('ai_training_sessions')
        .update({ 
          processed_content: processedCount,
          progress: Math.round(((i + 1) / allContent.length) * 100)
        })
        .eq('id', sessionId);

      if (progressError) {
        console.error('Failed to update progress:', progressError);
      }

      console.log(`Progress: ${i + 1}/${allContent.length} processed, ${processedCount} successful`);
    }

    // Log failed items for debugging
    if (failedItems.length > 0) {
      console.error(`Failed to process ${failedItems.length} items:`, failedItems);
    }

    // Determine final status based on success rate
    const successRate = processedCount / allContent.length;
    const finalStatus = successRate === 1.0 ? 'completed' : (successRate > 0.8 ? 'completed' : 'failed');
    
    let errorMessage = null;
    if (failedItems.length > 0) {
      errorMessage = `Failed to process ${failedItems.length} items: ${failedItems.map(item => `${item.type} ${item.id} (${item.error})`).join('; ')}`;
    }

    // Mark session as completed/failed
    const { error: completionError } = await supabase
      .from('ai_training_sessions')
      .update({ 
        status: finalStatus,
        completed_at: new Date().toISOString(),
        progress: 100,
        error_message: errorMessage
      })
      .eq('id', sessionId);

    if (completionError) {
      console.error('Failed to mark session as completed:', completionError);
    }

    console.log(`Training session ${sessionId} ${finalStatus}. Processed ${processedCount}/${allContent.length} content items (${Math.round(successRate * 100)}% success rate).`);

    // If less than 100% success, return an error to alert the user
    if (successRate < 1.0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Only processed ${processedCount}/${allContent.length} items (${Math.round(successRate * 100)}%). Check logs for details.`,
          processedCount,
          totalPages: allContent.length,
          failedItems: failedItems,
          sessionId 
        }),
        { 
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedCount,
        totalPages: allContent.length,
        sessionId,
        message: `Successfully processed all ${allContent.length} content items!`
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