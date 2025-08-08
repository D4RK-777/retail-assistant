-- Create master knowledge table to properly organize all content
CREATE TABLE IF NOT EXISTS master_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL, -- 'scraped_page', 'uploaded_file', 'manual_entry'
  source_id TEXT NOT NULL, -- URL or filename
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Core categorization
  primary_category TEXT NOT NULL, -- whatsapp_api, business_platform, chat_inc_platform, video_tutorial
  sub_category TEXT, -- cloud_api, business_management_api, webhooks, templates, campaigns, etc.
  content_type TEXT NOT NULL, -- documentation, tutorial, video_transcript, pricing, features
  
  -- Detailed classification
  api_endpoint TEXT, -- specific API endpoint if applicable
  feature_area TEXT, -- messaging, templates, webhooks, analytics, etc.
  user_role TEXT, -- developer, business_user, admin, marketer
  difficulty_level TEXT, -- beginner, intermediate, advanced
  
  -- Importance and relevance
  importance_score INTEGER DEFAULT 5, -- 1-10 scale
  relevance_tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Metadata
  character_count INTEGER,
  word_count INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE master_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Allow read access to master knowledge base" 
ON master_knowledge_base 
FOR SELECT 
USING (true);

-- Create policy for system updates
CREATE POLICY "Allow system to manage master knowledge base" 
ON master_knowledge_base 
FOR ALL 
USING (false);

-- Create indexes for efficient querying
CREATE INDEX idx_master_kb_primary_category ON master_knowledge_base(primary_category);
CREATE INDEX idx_master_kb_content_type ON master_knowledge_base(content_type);
CREATE INDEX idx_master_kb_importance ON master_knowledge_base(importance_score);
CREATE INDEX idx_master_kb_relevance_tags ON master_knowledge_base USING GIN(relevance_tags);
CREATE INDEX idx_master_kb_keywords ON master_knowledge_base USING GIN(keywords);
CREATE INDEX idx_master_kb_text_search ON master_knowledge_base USING GIN(to_tsvector('english', title || ' ' || content));

-- Now properly categorize and insert ALL the scraped pages data
INSERT INTO master_knowledge_base (
  source_type, source_id, title, content, primary_category, sub_category, content_type, 
  api_endpoint, feature_area, user_role, difficulty_level, importance_score, 
  relevance_tags, keywords, character_count, word_count
)
SELECT 
  'scraped_page',
  url,
  title,
  content,
  CASE 
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp/cloud-api%' THEN 'whatsapp_cloud_api'
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp/business-management-api%' THEN 'whatsapp_business_management_api'
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp/webhooks%' THEN 'whatsapp_webhooks'
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp/overview%' THEN 'whatsapp_overview'
    WHEN url LIKE '%business.whatsapp.com%' THEN 'whatsapp_business_platform'
    WHEN url LIKE '%chatinc.com%' THEN 'chat_inc_platform'
    ELSE 'general_whatsapp'
  END,
  CASE 
    WHEN url LIKE '%/messages%' THEN 'messaging_api'
    WHEN url LIKE '%/media%' THEN 'media_api'
    WHEN url LIKE '%/webhooks%' OR url LIKE '%webhook%' THEN 'webhooks'
    WHEN url LIKE '%template%' THEN 'templates'
    WHEN url LIKE '%pricing%' THEN 'pricing'
    WHEN url LIKE '%authentication%' THEN 'authentication_messages'
    WHEN url LIKE '%marketing%' THEN 'marketing_messages'
    WHEN url LIKE '%utility%' THEN 'utility_messages'
    WHEN url LIKE '%service%' THEN 'service_messages'
    WHEN url LIKE '%flows%' THEN 'whatsapp_flows'
    WHEN url LIKE '%platform-features%' THEN 'platform_features'
    WHEN url LIKE '%chatinc.com/products%' THEN 'chat_inc_products'
    WHEN url LIKE '%whatsapp-automation%' THEN 'automation'
    WHEN url LIKE '%live-chat%' THEN 'live_chat'
    WHEN url LIKE '%proactive%' THEN 'proactive_messaging'
    WHEN url LIKE '%flex%' THEN 'flex_platform'
    ELSE 'general'
  END,
  CASE 
    WHEN url LIKE '%developers.facebook.com%' THEN 'api_documentation'
    WHEN url LIKE '%business.whatsapp.com/products%' THEN 'product_features'
    WHEN url LIKE '%pricing%' THEN 'pricing_info'
    WHEN url LIKE '%chatinc.com/products%' THEN 'platform_features'
    WHEN url LIKE '%chatinc.com/whatsapp-for%' THEN 'use_cases'
    ELSE 'general_documentation'
  END,
  CASE 
    WHEN url LIKE '%/reference/%' THEN url
    WHEN url LIKE '%/docs/%' THEN url
    ELSE NULL
  END,
  CASE 
    WHEN url LIKE '%message%' OR url LIKE '%messaging%' THEN 'messaging'
    WHEN url LIKE '%template%' THEN 'templates'
    WHEN url LIKE '%webhook%' THEN 'webhooks'
    WHEN url LIKE '%media%' THEN 'media_handling'
    WHEN url LIKE '%auth%' THEN 'authentication'
    WHEN url LIKE '%pricing%' THEN 'billing'
    WHEN url LIKE '%automation%' THEN 'automation'
    WHEN url LIKE '%analytics%' THEN 'analytics'
    WHEN url LIKE '%flow%' THEN 'flows'
    ELSE 'general'
  END,
  CASE 
    WHEN url LIKE '%developers.facebook.com%' THEN 'developer'
    WHEN url LIKE '%business.whatsapp.com%' THEN 'business_user'
    WHEN url LIKE '%chatinc.com/products%' THEN 'business_user'
    WHEN url LIKE '%automation%' OR url LIKE '%proactive%' THEN 'marketer'
    ELSE 'general_user'
  END,
  CASE 
    WHEN url LIKE '%get-started%' OR url LIKE '%overview%' THEN 'beginner'
    WHEN url LIKE '%reference%' OR url LIKE '%api%' THEN 'advanced'
    WHEN url LIKE '%products%' OR url LIKE '%features%' THEN 'intermediate'
    ELSE 'intermediate'
  END,
  CASE 
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp/cloud-api/reference%' THEN 10
    WHEN url LIKE '%developers.facebook.com/docs/whatsapp%' THEN 9
    WHEN url LIKE '%business.whatsapp.com/products%' THEN 8
    WHEN url LIKE '%pricing%' THEN 9
    WHEN url LIKE '%template%' OR url LIKE '%webhook%' THEN 9
    WHEN url LIKE '%chatinc.com/products%' THEN 7
    ELSE 6
  END,
  ARRAY[
    CASE WHEN url LIKE '%whatsapp%' THEN 'whatsapp' END,
    CASE WHEN url LIKE '%api%' THEN 'api' END,
    CASE WHEN url LIKE '%business%' THEN 'business' END,
    CASE WHEN url LIKE '%cloud%' THEN 'cloud_api' END,
    CASE WHEN url LIKE '%template%' THEN 'templates' END,
    CASE WHEN url LIKE '%message%' THEN 'messaging' END,
    CASE WHEN url LIKE '%webhook%' THEN 'webhooks' END,
    CASE WHEN url LIKE '%media%' THEN 'media' END,
    CASE WHEN url LIKE '%pricing%' THEN 'pricing' END,
    CASE WHEN url LIKE '%chatinc%' THEN 'chat_inc' END,
    CASE WHEN url LIKE '%automation%' THEN 'automation' END
  ]::TEXT[],
  string_to_array(
    CASE 
      WHEN url LIKE '%cloud-api%' THEN 'cloud api,whatsapp cloud api,messaging api,send messages'
      WHEN url LIKE '%business-management-api%' THEN 'business management,account management,phone numbers,templates'
      WHEN url LIKE '%webhook%' THEN 'webhooks,notifications,events,real-time'
      WHEN url LIKE '%template%' THEN 'message templates,template approval,template variables'
      WHEN url LIKE '%media%' THEN 'media upload,images,videos,documents,file handling'
      WHEN url LIKE '%pricing%' THEN 'pricing,billing,conversation pricing,message costs'
      WHEN url LIKE '%authentication%' THEN 'authentication messages,otp,one-time passcode,2fa'
      WHEN url LIKE '%marketing%' THEN 'marketing messages,promotional,campaigns,engagement'
      WHEN url LIKE '%utility%' THEN 'utility messages,notifications,order updates,alerts'
      WHEN url LIKE '%service%' THEN 'service messages,customer support,helpdesk'
      WHEN url LIKE '%flows%' THEN 'whatsapp flows,interactive forms,data collection'
      WHEN url LIKE '%chatinc%' AND url LIKE '%automation%' THEN 'chat automation,chatbots,auto responses'
      WHEN url LIKE '%chatinc%' AND url LIKE '%live-chat%' THEN 'live chat,agent chat,customer service'
      WHEN url LIKE '%chatinc%' AND url LIKE '%proactive%' THEN 'proactive messaging,outbound campaigns'
      WHEN url LIKE '%chatinc%' AND url LIKE '%flex%' THEN 'flex platform,campaign management,broadcast'
      ELSE 'whatsapp,business communication'
    END, 
    ','
  ),
  LENGTH(content),
  array_length(string_to_array(content, ' '), 1)
FROM scraped_pages;

-- Now properly categorize and insert ALL the uploaded files data
INSERT INTO master_knowledge_base (
  source_type, source_id, title, content, primary_category, sub_category, content_type, 
  feature_area, user_role, difficulty_level, importance_score, 
  relevance_tags, keywords, character_count, word_count
)
SELECT 
  'uploaded_file',
  file_name,
  CASE 
    WHEN content LIKE '%Login & Navigation%' THEN 'Chat Inc - Login & Navigation Tutorial'
    WHEN content LIKE '%Platform walkthrough%' THEN 'Chat Inc - Platform Walkthrough Tutorial'
    WHEN content LIKE '%Contact Import%' THEN 'Chat Inc - Contact Import Tutorial'
    WHEN content LIKE '%Managing Contacts%' THEN 'Chat Inc - Managing Contacts Tutorial'
    WHEN content LIKE '%Sending Campaigns%' THEN 'Chat Inc - Sending Campaigns Tutorial'
    WHEN content LIKE '%Broadcast Campaign%' THEN 'Chat Inc - Broadcast Campaign Tutorial'
    WHEN content LIKE '%Connecting WhatsApp%' THEN 'Chat Inc - WhatsApp Integration Tutorial'
    WHEN content LIKE '%Managing Broadcast%' THEN 'Chat Inc - Managing Broadcast Campaigns Tutorial'
    WHEN content LIKE '%Creating Templates%' THEN 'Chat Inc - Creating Templates Tutorial'
    WHEN content LIKE '%Tracking Campaigns%' THEN 'Chat Inc - Tracking Campaigns Tutorial'
    WHEN content LIKE '%Managing Audiences%' THEN 'Chat Inc - Managing Audiences Tutorial'
    WHEN content LIKE '%Excel%' THEN 'Chat Inc - Excel Contact Management Tutorial'
    WHEN content LIKE '%Journeys%' THEN 'Chat Inc - Customer Journeys Tutorial'
    ELSE 'Chat Inc Tutorial Video'
  END,
  content,
  'chat_inc_platform',
  CASE 
    WHEN content LIKE '%Login%' OR content LIKE '%Navigation%' THEN 'platform_navigation'
    WHEN content LIKE '%Contact%' OR content LIKE '%Import%' OR content LIKE '%Excel%' THEN 'contact_management'
    WHEN content LIKE '%Campaign%' OR content LIKE '%Broadcast%' THEN 'campaign_management'
    WHEN content LIKE '%Template%' THEN 'template_creation'
    WHEN content LIKE '%WhatsApp%' OR content LIKE '%Meta%' THEN 'integration_setup'
    WHEN content LIKE '%Audience%' THEN 'audience_management'
    WHEN content LIKE '%Journey%' THEN 'customer_journeys'
    WHEN content LIKE '%Tracking%' THEN 'analytics_tracking'
    ELSE 'general_tutorial'
  END,
  'video_tutorial',
  CASE 
    WHEN content LIKE '%Campaign%' OR content LIKE '%Broadcast%' THEN 'campaigns'
    WHEN content LIKE '%Contact%' OR content LIKE '%Audience%' THEN 'contact_management'
    WHEN content LIKE '%Template%' THEN 'templates'
    WHEN content LIKE '%WhatsApp%' OR content LIKE '%Meta%' THEN 'integrations'
    WHEN content LIKE '%Journey%' THEN 'automation'
    WHEN content LIKE '%Tracking%' THEN 'analytics'
    WHEN content LIKE '%Login%' OR content LIKE '%Navigation%' THEN 'platform_basics'
    ELSE 'general'
  END,
  CASE 
    WHEN content LIKE '%Login%' OR content LIKE '%Navigation%' THEN 'general_user'
    WHEN content LIKE '%Campaign%' OR content LIKE '%Broadcast%' OR content LIKE '%Template%' THEN 'marketer'
    WHEN content LIKE '%WhatsApp%' OR content LIKE '%Meta%' OR content LIKE '%Integration%' THEN 'admin'
    WHEN content LIKE '%Contact%' OR content LIKE '%Audience%' THEN 'business_user'
    ELSE 'business_user'
  END,
  CASE 
    WHEN content LIKE '%Login%' OR content LIKE '%Navigation%' THEN 'beginner'
    WHEN content LIKE '%Integration%' OR content LIKE '%WhatsApp%' OR content LIKE '%Meta%' THEN 'intermediate'
    WHEN content LIKE '%Journey%' OR content LIKE '%Advanced%' THEN 'advanced'
    ELSE 'beginner'
  END,
  CASE 
    WHEN content LIKE '%Integration%' OR content LIKE '%WhatsApp%' OR content LIKE '%Meta%' THEN 9
    WHEN content LIKE '%Campaign%' OR content LIKE '%Broadcast%' OR content LIKE '%Template%' THEN 8
    WHEN content LIKE '%Contact%' OR content LIKE '%Audience%' THEN 7
    WHEN content LIKE '%Journey%' THEN 8
    WHEN content LIKE '%Tracking%' THEN 7
    ELSE 6
  END,
  ARRAY[
    'chat_inc',
    'flex_platform',
    'video_tutorial',
    CASE WHEN content LIKE '%WhatsApp%' THEN 'whatsapp_integration' END,
    CASE WHEN content LIKE '%Campaign%' THEN 'campaigns' END,
    CASE WHEN content LIKE '%Template%' THEN 'templates' END,
    CASE WHEN content LIKE '%Contact%' THEN 'contacts' END,
    CASE WHEN content LIKE '%Audience%' THEN 'audiences' END
  ]::TEXT[],
  string_to_array(
    CASE 
      WHEN content LIKE '%Login%' THEN 'login,navigation,platform basics,getting started'
      WHEN content LIKE '%Contact%' AND content LIKE '%Import%' THEN 'contact import,csv import,contact management,audience building'
      WHEN content LIKE '%Contact%' AND NOT content LIKE '%Import%' THEN 'contact management,contact organization,contact lists'
      WHEN content LIKE '%Campaign%' AND content LIKE '%Broadcast%' THEN 'broadcast campaigns,mass messaging,campaign creation,audience targeting'
      WHEN content LIKE '%Template%' THEN 'template creation,message templates,template design,template variables'
      WHEN content LIKE '%WhatsApp%' AND content LIKE '%Meta%' THEN 'whatsapp integration,meta integration,account setup,api connection'
      WHEN content LIKE '%Audience%' THEN 'audience management,segmentation,contact groups,targeting'
      WHEN content LIKE '%Journey%' THEN 'customer journeys,automation flows,engagement sequences'
      WHEN content LIKE '%Tracking%' THEN 'campaign tracking,analytics,performance metrics,campaign analysis'
      WHEN content LIKE '%Excel%' THEN 'excel management,data preparation,contact data,spreadsheet'
      ELSE 'chat inc tutorial,platform training,video guide'
    END, 
    ','
  ),
  LENGTH(content),
  array_length(string_to_array(content, ' '), 1)
FROM uploaded_files;

-- Add indexes for full-text search capabilities
CREATE INDEX idx_master_kb_full_text ON master_knowledge_base USING GIN(
  to_tsvector('english', 
    title || ' ' || 
    content || ' ' || 
    primary_category || ' ' || 
    COALESCE(sub_category, '') || ' ' || 
    content_type || ' ' || 
    COALESCE(feature_area, '') || ' ' || 
    array_to_string(relevance_tags, ' ') || ' ' || 
    array_to_string(keywords, ' ')
  )
);