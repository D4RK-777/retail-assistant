-- Enhanced Knowledge Management System for LEXI AI Training

-- Add more detailed metadata to content_chunks for better AI training
ALTER TABLE content_chunks 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS source_context JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS knowledge_level TEXT DEFAULT 'basic'; -- basic, intermediate, advanced, expert

-- Create knowledge topics table for better organization
CREATE TABLE IF NOT EXISTS knowledge_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_topic_id UUID REFERENCES knowledge_topics(id),
  importance_level INTEGER DEFAULT 1, -- 1-10 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link content chunks to knowledge topics
CREATE TABLE IF NOT EXISTS content_topic_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_chunk_id UUID REFERENCES content_chunks(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 1.0, -- 0-1 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_chunk_id, topic_id)
);

-- Enhanced user interaction tracking for better AI learning
CREATE TABLE IF NOT EXISTS user_ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  response_quality_rating INTEGER, -- 1-5 scale
  was_helpful BOOLEAN,
  follow_up_questions TEXT[],
  context_used JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track specific flEX platform usage patterns
CREATE TABLE IF NOT EXISTS flex_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id TEXT NOT NULL,
  feature_accessed TEXT NOT NULL, -- templates, campaigns, journeys, etc.
  action_taken TEXT NOT NULL, -- create, edit, delete, view, etc.
  feature_context JSONB DEFAULT '{}', -- specific details about what was done
  time_spent_seconds INTEGER,
  success_outcome BOOLEAN,
  help_requested BOOLEAN DEFAULT FALSE,
  ai_assistance_provided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge gap tracking - what users ask that we can't answer well
CREATE TABLE IF NOT EXISTS knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category TEXT,
  frequency_asked INTEGER DEFAULT 1,
  has_good_answer BOOLEAN DEFAULT FALSE,
  priority_level INTEGER DEFAULT 1, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_text)
);

-- Enhance AI training sessions with more detailed tracking
ALTER TABLE ai_training_sessions 
ADD COLUMN IF NOT EXISTS content_sources JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT 'gemini-1.5-flash',
ADD COLUMN IF NOT EXISTS training_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS knowledge_coverage JSONB DEFAULT '{}';

-- Insert core flEX platform knowledge topics
INSERT INTO knowledge_topics (topic_name, description, importance_level) VALUES
('Template Creation', 'Creating and editing WhatsApp message templates in flEX platform', 10),
('Campaign Management', 'Managing and launching WhatsApp campaigns', 10),
('Journey Builder', 'Creating automated message sequences and workflows', 9),
('Contact Management', 'Import, organize and segment contact lists', 9),
('Analytics & Reporting', 'Platform analytics, performance metrics and reporting', 8),
('Button Configuration', 'Setting up CTA and journey buttons in templates', 8),
('Media Management', 'Handling images, videos, documents in messages', 7),
('Platform Navigation', 'Finding features and navigating the flEX interface', 9),
('Personalization', 'Using dynamic placeholders and personalization features', 8),
('WhatsApp Policies', 'Platform compliance and WhatsApp business policy requirements', 8),
('Integration Setup', 'Connecting external systems and APIs', 6),
('Troubleshooting', 'Common issues and problem resolution', 7),
('Best Practices', 'Optimization tips and recommended approaches', 7),
('Advanced Features', 'Advanced flEX platform capabilities and configurations', 6)
ON CONFLICT (topic_name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_topic_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flex_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow read access to knowledge topics" ON knowledge_topics FOR SELECT USING (true);
CREATE POLICY "Allow read access to content topic mapping" ON content_topic_mapping FOR SELECT USING (true);
CREATE POLICY "Allow system to manage all knowledge data" ON knowledge_topics FOR ALL USING (false);
CREATE POLICY "Allow system to manage content mapping" ON content_topic_mapping FOR ALL USING (false);
CREATE POLICY "Allow system to manage interactions" ON user_ai_interactions FOR ALL USING (false);
CREATE POLICY "Allow system to manage usage analytics" ON flex_usage_analytics FOR ALL USING (false);
CREATE POLICY "Allow system to manage knowledge gaps" ON knowledge_gaps FOR ALL USING (false);

-- Function to update content chunk importance based on user interactions
CREATE OR REPLACE FUNCTION update_content_importance()
RETURNS TRIGGER AS $$
BEGIN
  -- Increase importance of content chunks that help answer user questions
  UPDATE content_chunks 
  SET importance_score = LEAST(importance_score + 1, 10)
  WHERE content ILIKE '%' || substring(NEW.question, 1, 20) || '%';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update content importance
CREATE TRIGGER update_content_importance_trigger
  AFTER INSERT ON user_ai_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_content_importance();