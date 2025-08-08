import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeUpdater = () => {
  const [loading, setLoading] = useState(false);

  const addChannelConnectionKnowledge = async () => {
    setLoading(true);
    try {
      // Add the knowledge directly to content_chunks
      const { error } = await supabase.functions.invoke('process-content', {
        body: {
          content: `# How to Connect a New WhatsApp Channel in flEX

To connect a new WhatsApp channel in flEX:

1. **Access Channel Settings**: Navigate to the Channels or Settings section in your flEX dashboard
2. **Add New Channel**: Click "Add Channel" or "Connect New Channel" 
3. **WhatsApp Business Account Setup**: You need:
   - A verified WhatsApp Business Account
   - Meta Business Manager access
   - Phone number verification
4. **API Integration**: flEX will guide you through connecting your WhatsApp Business API
5. **Channel Verification**: Complete the verification process to activate your channel
6. **Template Approval**: Submit your message templates for Meta approval before sending campaigns

Note: You can connect multiple WhatsApp numbers/channels to the same flEX account for different business needs or regions.

## Quick Steps:
- Go to Settings > Channels
- Click "Add Channel"
- Follow WhatsApp Business API setup
- Verify your phone number
- Complete integration

This process typically takes 5-10 minutes to complete.`,
          title: 'How to Connect a New WhatsApp Channel in flEX',
          type: 'manual_knowledge_update'
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Knowledge updated successfully! LEXI now knows how to connect channels.');
    } catch (error) {
      console.error('Error updating knowledge:', error);
      toast.error('Failed to update knowledge');
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