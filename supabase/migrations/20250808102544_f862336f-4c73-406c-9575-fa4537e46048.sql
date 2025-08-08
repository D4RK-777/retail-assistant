-- Insert correct WhatsApp conversation categories into master_knowledge_base
INSERT INTO public.master_knowledge_base (
  title,
  content,
  source_type,
  source_url,
  category,
  subcategory,
  content_classification,
  relevance_tags,
  keywords,
  importance_score
) VALUES (
  'WhatsApp Business API - 4 Conversation Categories',
  'WhatsApp Business Platform uses 4 conversation categories for billing and classification:

1. **MARKETING** (Business-initiated)
   - Promotional content, announcements, product updates
   - Includes promotions, offers, informational updates, or invitations
   - Examples: New product launches, sales campaigns, event invitations

2. **UTILITY** (Business-initiated) 
   - Account updates, order updates, alerts, bill updates
   - Facilitates specific, agreed-upon requests or transactions
   - Examples: Delivery notifications, payment confirmations, account alerts

3. **AUTHENTICATION** (Business-initiated)
   - Verification codes, login alerts, password resets
   - Enables businesses to authenticate users with one-time passcodes
   - Examples: 2FA codes, login verification, account security alerts

4. **SERVICE** (User-initiated)
   - Customer service conversations initiated by the user
   - Includes all user-initiated conversations for customer support
   - Examples: Help requests, complaints, inquiries, support tickets

IMPORTANT: These are conversation CATEGORIES, not message types. Message types refer to the format (text, image, video, etc.), while conversation categories determine billing and usage classification.',
  'documentation',
  'https://developers.facebook.com/docs/whatsapp/conversation-types/',
  'whatsapp_business',
  'conversation_categories',
  'official_documentation',
  ARRAY['conversation categories', 'marketing', 'utility', 'authentication', 'service', 'billing', 'classification'],
  ARRAY['whatsapp', 'conversation', 'categories', 'marketing', 'utility', 'authentication', 'service', 'business-initiated', 'user-initiated', 'billing'],
  10
),
(
  'WhatsApp Message Types vs Conversation Categories - Critical Distinction',
  'CRITICAL DISTINCTION for flEX platform users:

**MESSAGE TYPES** (What format/content you can send):
- Text messages
- Media messages (image, video, audio, document, sticker)
- Contact messages  
- Location messages
- Interactive messages (list messages, reply buttons, product messages)
- Template messages

**CONVERSATION CATEGORIES** (How WhatsApp classifies conversations for billing):
- Marketing (promotional content)
- Utility (account/transaction updates)
- Authentication (verification codes)
- Service (customer support)

When users ask "what message types can I send", they likely mean the 4 CONVERSATION CATEGORIES, not the technical message formats. Always clarify which they mean, but default to explaining the 4 conversation categories as these are more relevant for business messaging strategy.',
  'internal_knowledge',
  'internal',
  'whatsapp_business',
  'clarification',
  'critical_distinction',
  ARRAY['message types', 'conversation categories', 'clarification', 'billing', 'strategy'],
  ARRAY['whatsapp', 'message', 'types', 'conversation', 'categories', 'distinction', 'billing', 'strategy', 'clarification'],
  10
);