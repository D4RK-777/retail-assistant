-- Add correct knowledge about connecting WhatsApp channels in flEX
INSERT INTO master_knowledge_base (
  title,
  content,
  category,
  subcategory,
  content_type,
  importance_level,
  keywords,
  context_tags,
  detailed_classification
) VALUES (
  'How to Connect a New WhatsApp Channel in flEX',
  'To connect a new WhatsApp channel in flEX:

1. **Access Channel Settings**: Navigate to the Channels or Settings section in your flEX dashboard
2. **Add New Channel**: Click "Add Channel" or "Connect New Channel" 
3. **WhatsApp Business Account Setup**: You''ll need:
   - A verified WhatsApp Business Account
   - Meta Business Manager access
   - Phone number verification
4. **API Integration**: flEX will guide you through connecting your WhatsApp Business API
5. **Channel Verification**: Complete the verification process to activate your channel
6. **Template Approval**: Submit your message templates for Meta approval before sending campaigns

Note: You can connect multiple WhatsApp numbers/channels to the same flEX account for different business needs or regions.',
  'whatsapp',
  'channel_setup',
  'tutorial',
  10,
  ARRAY['connect channel', 'new channel', 'whatsapp setup', 'channel connection', 'flex setup', 'whatsapp business', 'api integration'],
  ARRAY['getting_started', 'channel_management', 'setup_process'],
  jsonb_build_object(
    'platform', 'flEX',
    'topic', 'Channel Connection',
    'difficulty', 'beginner',
    'process_type', 'setup',
    'business_function', 'channel_management'
  )
);