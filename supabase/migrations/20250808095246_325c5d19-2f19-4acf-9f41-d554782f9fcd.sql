-- Add comprehensive WhatsApp Business API message documentation
INSERT INTO content_chunks (content, content_type, importance_score, tags, category, knowledge_level, source_url, created_at) VALUES 

-- TEXT MESSAGES
('WhatsApp Text Messages: Body text limited to 4096 characters. No header or footer for simple text messages. Supports Unicode including emojis. Line breaks count as characters.', 'api_specification', 10, ARRAY['whatsapp', 'text', 'limits', 'characters'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages', NOW()),

-- TEMPLATE MESSAGES COMPREHENSIVE
('WhatsApp Template Message Structure - Header Types:
- TEXT: 60 characters maximum
- IMAGE: Must be JPG, JPEG, or PNG. Max 5MB
- VIDEO: Must be MP4, 3GPP. Max 16MB 
- DOCUMENT: Any valid MIME type. Max 100MB
- LOCATION: No character limit for location headers', 'api_specification', 10, ARRAY['whatsapp', 'template', 'header', 'limits'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates', NOW()),

('WhatsApp Template Message Body: 1024 characters maximum. Supports variables {{1}}, {{2}}, etc. Variables count toward character limit with their actual values, not placeholder text.', 'api_specification', 10, ARRAY['whatsapp', 'template', 'body', 'variables'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates', NOW()),

('WhatsApp Template Message Footer: 60 characters maximum. Optional field. Cannot contain variables or formatting.', 'api_specification', 10, ARRAY['whatsapp', 'template', 'footer'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates', NOW()),

('WhatsApp Template Buttons:
- CALL_TO_ACTION buttons: Button text 25 characters max, URL can have 1 variable {{1}}
- QUICK_REPLY buttons: Button text 25 characters max, payload 256 characters max
- URL buttons: Button text 25 characters max
- PHONE_NUMBER buttons: Button text 25 characters max
- Maximum 3 buttons per template', 'api_specification', 10, ARRAY['whatsapp', 'template', 'buttons', 'cta', 'quick_reply'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates', NOW()),

-- INTERACTIVE MESSAGES
('WhatsApp Interactive List Messages:
- Header: TEXT only, 60 characters max OR no header
- Body: Required, 1024 characters max
- Footer: Optional, 60 characters max
- Button text: 20 characters max
- List sections: Max 10 sections
- Rows per section: Max 10 rows
- Row title: 24 characters max
- Row description: 72 characters max
- Row ID: 200 characters max', 'api_specification', 10, ARRAY['whatsapp', 'interactive', 'list', 'limits'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-interactive-messages', NOW()),

('WhatsApp Interactive Button Messages:
- Header: TEXT (60 chars), IMAGE, VIDEO, or DOCUMENT
- Body: Required, 1024 characters max
- Footer: Optional, 60 characters max
- Buttons: Max 3 reply buttons
- Button text: 20 characters max per button
- Button ID: 256 characters max', 'api_specification', 10, ARRAY['whatsapp', 'interactive', 'buttons', 'reply'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-interactive-messages', NOW()),

-- MEDIA MESSAGES
('WhatsApp Media Message Limits:
- IMAGE: JPG, JPEG, PNG. Max 5MB. Caption 1024 characters max
- VIDEO: MP4, 3GPP. Max 16MB. Caption 1024 characters max  
- AUDIO: AAC, M4A, AMR, MP3, OGG. Max 16MB. No caption
- DOCUMENT: Any MIME type. Max 100MB. Caption 1024 characters max, filename 240 characters max
- STICKER: WebP only. Max 100KB. 512x512 pixels max. No caption', 'api_specification', 10, ARRAY['whatsapp', 'media', 'image', 'video', 'audio', 'document', 'sticker', 'limits'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media', NOW()),

-- LOCATION MESSAGES
('WhatsApp Location Messages:
- Latitude: Required, decimal degrees
- Longitude: Required, decimal degrees  
- Name: Optional, 1000 characters max
- Address: Optional, 1000 characters max
- No caption field for location messages', 'api_specification', 10, ARRAY['whatsapp', 'location', 'coordinates'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages', NOW()),

-- CONTACTS MESSAGES
('WhatsApp Contact Messages:
- Name: First name + last name + middle name + suffix + prefix
- Phone numbers: Multiple allowed with type and WhatsApp ID
- Emails: Multiple allowed with type
- URLs: Multiple allowed with type
- Addresses: Multiple allowed with full address components
- Organization: Company, department, title
- Birthday: YYYY-MM-DD format
- No character limits specified but reasonable lengths expected', 'api_specification', 10, ARRAY['whatsapp', 'contacts', 'vcard'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages', NOW()),

-- REACTION MESSAGES  
('WhatsApp Reaction Messages:
- Emoji: Single emoji only, Unicode supported
- Message ID: Required, must reference existing message
- No text content, only emoji reaction
- Can unreact by sending empty emoji string', 'api_specification', 10, ARRAY['whatsapp', 'reaction', 'emoji'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages', NOW()),

-- MESSAGE DELIVERY AND STATUS
('WhatsApp Message Status Types:
- sent: Message sent to WhatsApp servers
- delivered: Message delivered to recipient device  
- read: Message read by recipient
- failed: Message failed to send with error code
- Message IDs: Unique identifier returned for each sent message
- Webhook notifications for all status changes', 'api_specification', 10, ARRAY['whatsapp', 'status', 'delivery', 'webhooks'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components', NOW()),

-- ERROR CODES AND LIMITS
('WhatsApp API Rate Limits and Errors:
- Rate limit: 1000 messages per second for verified businesses
- Error code 131026: Message template not found
- Error code 131047: Re-engagement message outside 24hr window  
- Error code 131053: Media download error
- Error code 133000: Generic user error
- Error code 135000: Generic rate limit error
- Message throughput varies by business verification status', 'api_specification', 10, ARRAY['whatsapp', 'errors', 'rate_limits', 'troubleshooting'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes', NOW()),

-- BUSINESS PROFILE AND SETTINGS
('WhatsApp Business Profile Settings:
- Business name: 75 characters max
- Business description: 512 characters max  
- Business address: Full address components
- Business email: Valid email format
- Business website: Valid URL format
- Business category: Must match predefined categories
- Profile photo: JPG, PNG. Max 5MB. 640x640 pixels recommended', 'api_specification', 10, ARRAY['whatsapp', 'business_profile', 'settings'], 'messaging', 'expert', 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles', NOW());