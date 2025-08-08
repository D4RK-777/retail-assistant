-- Add comprehensive WhatsApp Business API documentation to content_chunks
INSERT INTO content_chunks (content, content_type, importance_score, tags) VALUES 
(
'### WhatsApp Business API Message Limits and Specifications

**TEXT MESSAGES:**
- Header: Maximum 60 characters
- Body: Maximum 1024 characters  
- Footer: Maximum 60 characters
- Button text: Maximum 20 characters per button
- Maximum 3 buttons per message

**TEMPLATE MESSAGES:**
- Header: 60 characters max (text) OR 1 media file
- Body: 1024 characters max with variable placeholders {{1}}, {{2}}, etc.
- Footer: 60 characters max (optional)
- Buttons: 20 characters max per button, up to 3 buttons

**INTERACTIVE MESSAGES:**
- Button Messages: Up to 3 buttons, 20 characters each
- List Messages: Up to 10 rows, 24 characters per title, 72 characters per description
- Product Messages: Up to 30 products per catalog

**MEDIA MESSAGES:**
- Images: 5MB max, JPEG/PNG formats
- Videos: 16MB max, MP4/3GPP formats  
- Audio: 16MB max, AAC/M4A/AMR/MP3/OGG formats
- Documents: 100MB max, PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX formats

**LOCATION MESSAGES:**
- Name: 1000 characters max
- Address: 1000 characters max
- Latitude/Longitude coordinates required

**CONTACT MESSAGES:**
- Contact cards with vCard format
- Multiple contacts supported in single message

**REACTION MESSAGES:**
- Unicode emoji reactions to specific messages
- One reaction per message per user',
'text',
10,
ARRAY['whatsapp_api', 'message_limits', 'character_limits']::text[]
),
(
'### WhatsApp Business API Error Codes and Rate Limits

**RATE LIMITS:**
- 1000 messages per second for verified businesses
- 250 messages per second for unverified businesses
- 10 requests per second for non-messaging endpoints

**MESSAGE DELIVERY STATUS:**
- sent: Message sent to WhatsApp servers
- delivered: Message delivered to user device  
- read: Message read by user
- failed: Message delivery failed

**COMMON ERROR CODES:**
- 131026: Message undeliverable (user blocked business)
- 131047: Re-engagement message outside 24-hour window
- 131014: Invalid recipient phone number format
- 470: Template does not exist or not approved
- 132000: Message throttled due to rate limiting
- 136000: Business account suspended

**TEMPLATE MESSAGE RULES:**
- Templates must be pre-approved by WhatsApp
- Template categories: UTILITY, MARKETING, AUTHENTICATION
- Variables must be properly formatted: {{1}}, {{2}}, etc.
- No special characters in template names (only letters, numbers, underscores)',
'text',
10,
ARRAY['whatsapp_api', 'error_codes', 'rate_limits']::text[]
),
(
'### WhatsApp Business Profile and Settings

**BUSINESS PROFILE:**
- Business name: 25 characters max
- Business description: 512 characters max
- Business category: Must select from predefined list
- Profile photo: 640x640 pixels recommended
- Website URL: Must be valid HTTPS URL
- Email: Valid email address format
- Address: Complete business address

**WEBHOOK CONFIGURATION:**
- Webhook URL must be HTTPS with valid SSL certificate
- Webhook verification token required
- Must respond to verification challenge within 10 seconds
- Supports multiple webhook endpoints

**PHONE NUMBER REQUIREMENTS:**
- Must be business phone number (not personal)
- Cannot be registered with WhatsApp personal app
- Must complete phone number verification process
- Supports landline and mobile numbers
- International format required (+country_code)',
'text',
9,
ARRAY['whatsapp_business', 'profile_settings', 'phone_verification']::text[]
)