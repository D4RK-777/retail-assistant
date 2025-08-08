import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeUpdater = () => {
  const [loading, setLoading] = useState(false);

  const addChannelConnectionKnowledge = async () => {
    setLoading(true);
    try {
      // Insert knowledge directly into content_chunks
      const knowledgeContent = `# How to Connect a New WhatsApp Channel in flEX

To connect a new WhatsApp channel in flEX:

## Step-by-Step Process:

1. **Access Channel Settings**: 
   - Navigate to the Channels or Settings section in your flEX dashboard
   - Look for "Channel Management" or "WhatsApp Channels"

2. **Add New Channel**: 
   - Click "Add Channel" or "Connect New Channel" button
   - Select "WhatsApp Business" from the options

3. **WhatsApp Business Account Requirements**:
   - A verified WhatsApp Business Account
   - Meta Business Manager access with appropriate permissions
   - Valid business phone number for verification
   - Business profile information ready

4. **API Integration Process**:
   - flEX will guide you through connecting your WhatsApp Business API
   - Authenticate with your Meta Business account
   - Grant necessary permissions for message sending and management
   - Configure webhook endpoints for message delivery

5. **Channel Verification**:
   - Complete the phone number verification process via SMS or voice call
   - Verify business information matches your Meta Business account
   - Complete the verification process to activate your channel

6. **Template Approval**:
   - Submit your message templates for Meta approval before sending campaigns
   - Templates must comply with WhatsApp Business messaging policies
   - Approval typically takes 24-48 hours

## Important Notes:
- You can connect multiple WhatsApp numbers/channels to the same flEX account for different business needs or regions
- Each channel requires separate verification and setup
- Templates must be approved before you can send marketing messages
- Business-initiated conversations are rate-limited based on your tier

## Common Issues:
- Ensure your Meta Business account is verified
- Check that your phone number isn't already connected to another WhatsApp Business account
- Verify you have proper permissions in Meta Business Manager

This process typically takes 5-10 minutes to complete once you have all prerequisites ready.`;

      const messageTypesKnowledge = `# WhatsApp Business Message Types and Conversation Categories

## The 4 WhatsApp Business Conversation Categories

WhatsApp Business uses 4 conversation categories for billing and policy purposes:

### 1. **Marketing Messages**
- **Purpose**: Promotional content, offers, announcements, product updates
- **Examples**: Sales promotions, new product launches, seasonal offers, newsletters
- **Billing**: Charged per conversation
- **Requirements**: Must use approved message templates
- **Character Limits**: Standard template limitations apply

### 2. **Utility Messages** 
- **Purpose**: Facilitate specific transactions or update customers about ongoing transactions
- **Examples**: Order confirmations, shipping updates, appointment reminders, account updates
- **Billing**: Lower cost than marketing messages
- **Requirements**: Must be transaction-related and provide value

### 3. **Authentication Messages**
- **Purpose**: Verify user identity with one-time passcodes during login/registration
- **Examples**: OTP codes, verification codes, password resets
- **Billing**: Often free or very low cost
- **Requirements**: Must contain actual authentication codes

### 4. **Service Messages**
- **Purpose**: Customer service and support conversations
- **Examples**: Answering questions, providing support, resolving issues
- **Billing**: Generally free within 24-hour window if customer initiates
- **Requirements**: Must be responsive to customer needs

## Message Content Types in flEX:

### **Text Messages**
- Plain text with personalization placeholders like {first_name}
- Supports formatting (bold, italic) and emojis
- Character limits depend on conversation category

### **Rich Media Messages**
- **Images**: JPG, PNG formats for visual content
- **Videos**: MP4 format for demonstrations and engagement  
- **Documents**: PDFs, spreadsheets for detailed information
- **Audio**: Voice messages and audio files

### **Interactive Elements**
- **Buttons**: Up to 3 buttons per message
  - **Call to Action (CTA)**: "Open Web Page", "Trigger Phone Call"
  - **Journey Buttons**: Advance users through automated sequences
  - **IMPORTANT**: Cannot mix CTA and Journey buttons in same message
- **Quick Replies**: Fast response options for customers
- **Lists**: Structured menu options for complex choices

## Character Limits by Message Type:

- **Text Messages**: 1,024 characters
- **Template Headers**: 60 characters  
- **Template Bodies**: 1,024 characters
- **Button Text**: 20 characters per button
- **Footer Text**: 60 characters

## Important flEX Platform Rules:
- All marketing messages require pre-approved Meta templates
- Templates must be submitted 24-48 hours before use
- Button combinations are restricted by WhatsApp policy
- Personalization placeholders must match your contact data fields

This is the official WhatsApp Business messaging structure that flEX implements.`;

      // Insert both knowledge items
      const insertPromises = [
        // Channel connection knowledge
        supabase.from('content_chunks').insert({
          id: crypto.randomUUID(),
          content: knowledgeContent,
          title: 'How to Connect a New WhatsApp Channel in flEX',
          category: 'flex_platform',
          content_type: 'tutorial',
          knowledge_level: 'intermediate',
          importance_score: 10,
          tags: ['channel-connection', 'setup', 'whatsapp-business', 'flex-platform', 'getting-started'],
          source_context: {
            source_type: 'manual_update',
            category: 'platform_tutorials',
            topic: 'channel_setup',
            user_role: 'admin'
          }
        }),
        
        // Message types knowledge
        supabase.from('content_chunks').insert({
          id: crypto.randomUUID(),
          content: messageTypesKnowledge,
          title: 'WhatsApp Business Message Types and Conversation Categories',
          category: 'whatsapp_business',
          content_type: 'reference',
          knowledge_level: 'expert',
          importance_score: 10,
          tags: ['message-types', 'conversation-categories', 'marketing', 'utility', 'authentication', 'service', 'templates'],
          source_context: {
            source_type: 'manual_update',
            category: 'whatsapp_fundamentals',
            topic: 'message_types',
            user_role: 'marketer'
          }
        })
      ];

      const results = await Promise.all(insertPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to insert knowledge: ${errors.map(e => e.error.message).join(', ')}`);
      }

      toast.success('LEXI knowledge fully updated! Now knows channel connection AND message types properly.');
    } catch (error) {
      console.error('Error updating knowledge:', error);
      toast.error(`Failed to update knowledge: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Knowledge Base Fix</h3>
        <p className="text-yellow-700 text-sm mb-3">
          This will add critical missing knowledge about channel connection and WhatsApp message types that LEXI needs to answer questions properly.
        </p>
        <Button 
          onClick={addChannelConnectionKnowledge}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Updating Knowledge Base...' : 'Fix LEXI Knowledge - Add Missing Core Info'}
        </Button>
      </div>
    </div>
  );
};