/// <reference path="../deno.d.ts" />
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
      console.warn('Gemini API key not configured - using basic content processing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get both scraped pages and uploaded files to process (no auth needed - internal system)
    const [scrapedPagesResult, uploadedFilesResult] = await Promise.all([
      supabase.from('flex_chatbot_scraped_pages').select('*'),
      supabase.from('flex_chatbot_uploaded_files').select('*').filter('content', 'not.is', null)
    ]);

    if (scrapedPagesResult.error) {
      throw new Error(`Failed to fetch scraped pages: ${scrapedPagesResult.error.message}`);
    }

    if (uploadedFilesResult.error) {
      throw new Error(`Failed to fetch uploaded files: ${uploadedFilesResult.error.message}`);
    }

    // Combine all content sources with proper source handling
    const scrapedPages = (scrapedPagesResult.data || []).map(page => ({
      ...page,
      source_type: 'scraped_page',
      source_table: 'scraped_pages'
    }));
    
    const uploadedFiles = (uploadedFilesResult.data || []).map(file => ({
      id: file.id,
      title: file.original_name,
      content: file.content,
      url: file.storage_path,
      source_type: 'uploaded_file',
      source_table: 'uploaded_files'
    }));

    const allContent = [...scrapedPages, ...uploadedFiles];

    if (allContent.length === 0) {
      throw new Error('No content found to process');
    }

    console.log(`Processing ${allContent.length} content items (${scrapedPages.length} scraped pages, ${uploadedFiles.length} uploaded files) for session ${sessionId}`);

    // Create session record first
    const { error: sessionError } = await supabase
      .from('flex_chatbot_ai_training_sessions')
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
    const failedItems: Array<{id: string, type: string, title: string, error: string}> = [];
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

        console.log(`Processing ${content.source_type} ${content.id}: ${content.title} (attempt ${retryCount + 1})`);
        
        let embeddingArray = null;
        
        if (geminiApiKey) {
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
          embeddingArray = embeddingData.embedding?.values;
        } else {
          console.log('Skipping embedding generation - API key not available');
        }

        // Use the embedding array we generated (or null if no API key)
        const embedding = embeddingArray;

        // Determine content type and importance based on analysis
        const isFlexContent = content.content.toLowerCase().includes('flex') || 
                             content.content.toLowerCase().includes('template') ||
                             content.content.toLowerCase().includes('campaign') ||
                             content.content.toLowerCase().includes('whatsapp') ||
                             content.content.toLowerCase().includes('journey')
        
        const contentType = isFlexContent ? 'flex_platform' : 'general'
        const importanceScore = isFlexContent ? 10 : 5
        const knowledgeLevel = content.content.length > 5000 ? 'advanced' : 
                              content.content.length > 2000 ? 'intermediate' : 'basic'

        // Extract tags from content
        const tags: string[] = []
        if (content.content.toLowerCase().includes('template')) tags.push('templates')
        if (content.content.toLowerCase().includes('campaign')) tags.push('campaigns') 
        if (content.content.toLowerCase().includes('journey')) tags.push('journeys')
        if (content.content.toLowerCase().includes('button')) tags.push('buttons')
        if (content.content.toLowerCase().includes('contact')) tags.push('contacts')
        if (content.content.toLowerCase().includes('analytic')) tags.push('analytics')
        if (content.content.toLowerCase().includes('navigation')) tags.push('navigation')
        if (content.content.toLowerCase().includes('personalization')) tags.push('personalization')

    // Enhanced categorization logic
    const analyzeContent = (content) => {
      const text = content.content.toLowerCase();
      const title = (content.title || '').toLowerCase();
      
      // Primary categorization
      let primaryCategory = 'general';
      let subCategory = 'uncategorized';
      let userRole = 'general';
      let relevanceTags: string[] = [];
      let keywords: string[] = [];
      
      // WhatsApp Business API categorization
      if (text.includes('whatsapp') || text.includes('meta') || text.includes('graph api')) {
        primaryCategory = 'whatsapp_business';
        if (text.includes('template')) subCategory = 'templates';
        else if (text.includes('webhook') || text.includes('callback')) subCategory = 'webhooks';
        else if (text.includes('message') || text.includes('send')) subCategory = 'messaging';
        else if (text.includes('contact') || text.includes('phone')) subCategory = 'contacts';
        else if (text.includes('media') || text.includes('image') || text.includes('video')) subCategory = 'media';
        relevanceTags.push('api', 'messaging', 'business');
        keywords.push('whatsapp', 'api', 'business');
      }
      
      // flEX Platform specific
      if (text.includes('flex') || title.includes('flex')) {
        primaryCategory = 'flex_platform';
        if (text.includes('template') || text.includes('editor')) subCategory = 'templates';
        else if (text.includes('campaign') || text.includes('send campaign')) subCategory = 'campaigns';
        else if (text.includes('journey') || text.includes('automation')) subCategory = 'journeys';
        else if (text.includes('contact') || text.includes('audience')) subCategory = 'contacts';
        else if (text.includes('analytic') || text.includes('performance')) subCategory = 'analytics';
        else if (text.includes('navigation') || text.includes('menu')) subCategory = 'navigation';
        relevanceTags.push('platform', 'ui', 'features');
        keywords.push('flex', 'platform', 'editor');
      }
      
      // API Documentation
      if (text.includes('api') || text.includes('endpoint') || text.includes('response')) {
        primaryCategory = 'api_documentation';
        if (text.includes('webhook')) subCategory = 'webhooks';
        else if (text.includes('auth') || text.includes('token')) subCategory = 'authentication';
        else if (text.includes('message')) subCategory = 'messaging';
        userRole = 'developer';
        relevanceTags.push('technical', 'integration', 'reference');
        keywords.push('api', 'endpoint', 'documentation');
      }
      
      // Video content detection
      if (content.source_type === 'uploaded_file' && (content.mime_type?.includes('video') || title.includes('transcript'))) {
        if (!primaryCategory || primaryCategory === 'general') primaryCategory = 'tutorials';
        subCategory = 'video_guides';
        userRole = 'beginner';
        relevanceTags.push('tutorial', 'visual', 'guide');
        keywords.push('tutorial', 'guide', 'video');
      }
      
      // Determine user role if not set
      if (userRole === 'general') {
        if (text.includes('developer') || text.includes('code') || text.includes('integration')) {
          userRole = 'developer';
        } else if (text.includes('admin') || text.includes('configure') || text.includes('setup')) {
          userRole = 'admin';
        } else if (text.includes('campaign') || text.includes('marketing') || text.includes('message')) {
          userRole = 'marketer';
        } else {
          userRole = 'end_user';
        }
      }
      
      return { primaryCategory, subCategory, userRole, relevanceTags, keywords };
    };

    const analysis = analyzeContent(content);
    
    // Store content chunk with enhanced metadata
    console.log(`Storing chunk for ${content.source_type} ${content.id} with embedding length: ${embedding?.length || 0}`);
    
    // Create unique chunk ID to avoid foreign key constraints
    const chunkId = crypto.randomUUID();
    
    const { error: chunkError } = await supabase
      .from('flex_chatbot_content_chunks')
      .upsert({
        id: chunkId,
        source_id: content.id,
        content: content.content,
        title: content.title,
        url: content.url,
        embedding: embedding || null,
        chunk_index: 0,
        token_count: Math.ceil((content.content?.length || 0) / 4),
        content_type: contentType,
        importance_score: importanceScore,
        tags: tags,
        category: isFlexContent ? 'flex_platform' : 'general',
        knowledge_level: knowledgeLevel,
        source_context: {
          source_type: content.source_type,
          file_type: content.mime_type || content.file_type,
          original_length: content.content.length,
          processed_at: new Date().toISOString()
        },
        last_updated: new Date().toISOString()
      });

    if (chunkError) {
      throw new Error(`Database upsert error: ${JSON.stringify(chunkError)}`);
    }

    // Also store in master knowledge base with enhanced categorization
    const { error: masterError } = await supabase
      .from('flex_chatbot_master_knowledge_base')
      .upsert({
        id: crypto.randomUUID(),
        source_id: content.id,
        source_type: content.source_type,
        source_table: content.source_table,
        title: content.title || 'Untitled',
        content: content.content,
        url: content.url,
        primary_category: analysis.primaryCategory,
        sub_category: analysis.subCategory,
        content_type: contentType,
        user_role: analysis.userRole,
        importance_score: importanceScore,
        knowledge_level: knowledgeLevel,
        relevance_tags: analysis.relevanceTags,
        keywords: analysis.keywords,
        embedding: embedding,
        token_count: Math.ceil((content.content?.length || 0) / 4),
        metadata: {
          original_tags: tags,
          file_type: content.mime_type || content.file_type,
          original_length: content.content.length,
          processed_at: new Date().toISOString(),
          analysis_version: '1.0'
        }
      });

    if (masterError) {
      console.warn(`Failed to store in master knowledge base: ${masterError.message}`);
    }

    console.log(`Successfully processed ${content.source_type} ${content.id} and stored in master knowledge base`);
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
        .from('flex_chatbot_ai_training_sessions')
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
    
    let errorMessage: string | null = null;
    if (failedItems.length > 0) {
      errorMessage = `Failed to process ${failedItems.length} items: ${failedItems.map(item => `${item.type} ${item.id} (${item.error})`).join('; ')}`;
    }

    // Calculate training metrics and knowledge coverage
    const flexContentCount = allContent.filter(c => 
      c.content && (c.content.toLowerCase().includes('flex') || 
                   c.content.toLowerCase().includes('template') ||
                   c.content.toLowerCase().includes('campaign'))
    ).length

    const trainingMetrics = {
      total_processed: processedCount,
      total_failed: failedItems.length,
      flex_content_percentage: (flexContentCount / allContent.length) * 100,
      avg_content_length: allContent.reduce((sum, c) => sum + (c.content?.length || 0), 0) / allContent.length,
      success_rate: successRate * 100
    }

    const knowledgeCoverage = {
      platforms: ['flex_platform'],
      features_covered: ['templates', 'campaigns', 'journeys', 'contacts', 'analytics', 'navigation'],
      content_types: ['documentation', 'tutorials', 'guides', 'transcriptions'],
      knowledge_depth: flexContentCount > 10 ? 'comprehensive' : 'basic'
    }

    // Mark session as completed/failed with enhanced metadata
    const { error: completionError } = await supabase
      .from('flex_chatbot_ai_training_sessions')
      .update({ 
        status: finalStatus,
        completed_at: new Date().toISOString(),
        progress: 100,
        error_message: errorMessage,
        content_sources: {
          scraped_pages: scrapedPages.length,
          uploaded_files: uploadedFiles.length,
          total_content_items: allContent.length
        },
        embedding_model: 'text-embedding-004',
        training_metrics: trainingMetrics,
        knowledge_coverage: knowledgeCoverage
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