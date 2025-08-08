import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeUpdater = () => {
  const [loading, setLoading] = useState(false);

  const addChannelConnectionKnowledge = async () => {
    setLoading(true);
    try {
      // Create a training session first
      const sessionId = crypto.randomUUID();
      
      // Insert knowledge directly into content_chunks and master_knowledge_base
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

      // Insert directly into database
      const { error: insertError } = await supabase
        .from('content_chunks')
        .insert({
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
        });

      if (insertError) {
        throw new Error(`Failed to insert knowledge: ${insertError.message}`);
      }

      toast.success('Channel connection knowledge added successfully! LEXI now knows how to help with connecting channels.');
    } catch (error) {
      console.error('Error updating knowledge:', error);
      toast.error(`Failed to update knowledge: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={addChannelConnectionKnowledge}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Fix LEXI Knowledge'}
      </Button>
    </div>
  );
};