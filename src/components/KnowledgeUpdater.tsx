import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeUpdater = () => {
  const [loading, setLoading] = useState(false);

  const fixAllKnowledge = async () => {
    setLoading(true);
    try {
      // FIRST - Clear and restructure existing knowledge for better searchability
      await supabase.from('content_chunks').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      
      // Core flEX Platform Knowledge 
      const flexPlatformKnowledge = [
        {
          id: crypto.randomUUID(),
          title: 'flEX Platform Navigation and Template Editor',
          content: `# flEX Platform Navigation and Template Editor

## Core Navigation Structure:
- **Templates Section**: Main editing hub in left navigation menu for creating/editing Meta templates
- **Campaign Dashboard**: "Send Campaign" section for creating and managing active campaigns with real-time editing
- **Journey Builder**: Multi-step automation sequences accessible via main menu
- **Contacts Management**: Import, organize, and segment contact lists
- **Analytics Dashboard**: Performance tracking and reporting

## Template Editor Interface:
- **Header Section**: Media content (images, videos, documents) or text headers
- **Message Content**: Main body with personalization placeholders like {first_name}, {last_name}
- **Buttons Section**: Interactive elements (max 3 buttons)
- **Footer Section**: Additional text content (60 character limit)

## Template Creation Process:
1. Navigate to "Templates" in left menu
2. Click "New Template" 
3. Select "Meta Template" option
4. Configure Header, Content, Buttons, and Footer sections
5. Use real-time preview to see WhatsApp message simulation
6. Submit for Meta approval (24-48 hours)

## Button Configuration Rules:
- **Maximum 3 buttons per template**
- **CTA Buttons**: "Open Web Page", "Trigger Phone Call" (can be combined)
- **Journey Buttons**: Connect to automated sequences (EXCLUSIVE - cannot mix with CTA buttons)
- **WhatsApp Policy**: Journey buttons automatically remove all CTA buttons

## Character Limits:
- Template Headers: 60 characters
- Template Bodies: 1,024 characters  
- Button Text: 20 characters per button
- Footer Text: 60 characters
- Text Messages: 1,024 characters total`,
          category: 'flex_platform_core',
          content_type: 'navigation_guide',
          knowledge_level: 'beginner',
          importance_score: 10,
          tags: ['navigation', 'templates', 'editor', 'buttons', 'limits', 'interface', 'meta-templates']
        },
        
        {
          id: crypto.randomUUID(),
          title: 'flEX Campaign Management and Broadcasting',
          content: `# flEX Campaign Management and Broadcasting

## Campaign Types:
- **Promotional Campaigns**: Sales promotions, product launches, seasonal offers
- **Customer Acquisition**: Lead generation and new customer onboarding
- **Traffic Driving**: Website visits, app downloads, social engagement
- **CLV Enhancement**: Customer lifetime value improvement campaigns

## Campaign Creation Process:
1. Access "Send Campaign" section
2. Select target audience/contact lists
3. Choose approved Meta template
4. Configure personalization variables
5. Set scheduling and delivery options
6. Review and launch campaign

## Contact Management:
- **CSV Import**: Download platform template for contact imports
- **Phone Format**: International format required (+15551234567)
- **Segmentation**: Create targeted audiences based on engagement, location, demographics
- **Geo-targeting**: Location-based offer distribution
- **List Management**: Organize contacts with tags and custom fields

## Campaign Analytics:
- **Read Rates**: 75%+ typical performance
- **Click-through Tracking**: Real-time conversion monitoring
- **A/B Testing**: Template and timing optimization
- **ROI Measurement**: Revenue attribution and performance reporting
- **Conversion Analytics**: From clicks to completed actions`,
          category: 'flex_platform_core',
          content_type: 'campaign_guide',
          knowledge_level: 'intermediate',
          importance_score: 10,
          tags: ['campaigns', 'broadcasting', 'contacts', 'analytics', 'segmentation', 'csv-import']
        }
      ];

      // WhatsApp Business Core Knowledge
      const whatsappKnowledge = [
        {
          id: crypto.randomUUID(),
          title: 'WhatsApp Business API Integration and Channel Setup',
          content: `# WhatsApp Business API Integration and Channel Setup

## Channel Connection Requirements:
- **Verified WhatsApp Business Account**
- **Meta Business Manager** access with appropriate permissions
- **Valid business phone number** for verification
- **Business profile information** ready for setup

## flEX Channel Connection Process:
1. Navigate to Channels/Settings in flEX dashboard
2. Click "Add Channel" or "Connect New Channel"
3. Select "WhatsApp Business" option
4. Authenticate with Meta Business account
5. Grant message sending and management permissions
6. Configure webhook endpoints for delivery
7. Complete phone verification (SMS or voice call)
8. Verify business information matches Meta account

## Multi-Channel Support:
- Connect multiple WhatsApp numbers to same flEX account
- Each channel requires separate verification
- Use different channels for different business needs/regions
- Manage all channels from single flEX dashboard

## Common Setup Issues:
- Meta Business account not verified
- Phone number already connected to another WhatsApp Business account
- Insufficient permissions in Meta Business Manager
- Webhook configuration errors`,
          category: 'whatsapp_business_core',
          content_type: 'setup_guide',
          knowledge_level: 'intermediate',
          importance_score: 10,
          tags: ['channel-connection', 'setup', 'whatsapp-business', 'meta-business', 'verification', 'api-integration']
        },
        
        {
          id: crypto.randomUUID(),
          title: 'WhatsApp Business Message Categories and Billing',
          content: `# WhatsApp Business Message Categories and Billing

## The 4 Official WhatsApp Conversation Categories:

### 1. Marketing Messages
- **Purpose**: Promotional content, offers, announcements, product updates
- **Examples**: Sales promotions, new product launches, seasonal offers, newsletters
- **Billing**: Charged per conversation window
- **Requirements**: MUST use approved Meta templates
- **Restrictions**: Cannot be sent without customer opt-in

### 2. Utility Messages
- **Purpose**: Facilitate transactions or update customers about ongoing transactions
- **Examples**: Order confirmations, shipping updates, appointment reminders, account updates
- **Billing**: Lower cost than marketing messages
- **Requirements**: Must be transaction-related and provide actual value
- **Use Cases**: Post-purchase communications, service updates

### 3. Authentication Messages
- **Purpose**: Verify user identity with one-time passcodes
- **Examples**: OTP codes, verification codes, password resets, 2FA
- **Billing**: Often free or very low cost
- **Requirements**: Must contain actual authentication codes
- **Format**: Simple, clear verification messages

### 4. Service Messages
- **Purpose**: Customer service and support conversations
- **Examples**: Answering questions, providing support, resolving issues
- **Billing**: Free within 24-hour customer-initiated window
- **Requirements**: Must be responsive to customer inquiries
- **Best Practice**: Respond quickly to maintain free window

## Rate Limits and Tier System:
- **Tier 1**: 1,000 business-initiated conversations/day
- **Tier 2**: 10,000 business-initiated conversations/day  
- **Tier 3**: 100,000 business-initiated conversations/day
- **Progression**: Automatic based on quality and volume`,
          category: 'whatsapp_business_core',
          content_type: 'policy_reference',
          knowledge_level: 'expert',
          importance_score: 10,
          tags: ['message-types', 'conversation-categories', 'marketing', 'utility', 'authentication', 'service', 'billing', 'rate-limits']
        }
      ];

      // Meta Template Policies and Restrictions
      const metaPolicyKnowledge = [
        {
          id: crypto.randomUUID(),
          title: 'Meta WhatsApp Template Approval Process and Restrictions',
          content: `# Meta WhatsApp Template Approval Process and Restrictions

## Template Approval Requirements:
- **Submission Time**: 24-48 hours for approval
- **Quality Guidelines**: Clear, professional, value-driven content
- **Language Requirements**: Must match business account language
- **Compliance**: Must follow WhatsApp Business Policy

## Template Categories (Meta Classification):
- **MARKETING**: Promotional content, offers, announcements
- **UTILITY**: Transaction updates, account notifications, service updates  
- **AUTHENTICATION**: OTP and verification code delivery

## Common Rejection Reasons:
- **Misleading Content**: False claims, unclear offers
- **Poor Grammar**: Spelling errors, unprofessional language
- **Placeholder Issues**: Invalid variables, missing context
- **Policy Violations**: Prohibited content, spam-like messaging
- **Button Misuse**: Incorrect button types, non-functional links

## Meta Template Button Restrictions:
- **Maximum 3 buttons per template**
- **CTA Button Types**: 
  * "Call Phone Number" (phone call trigger)
  * "Visit Website" (external link)
- **Quick Reply Buttons**: Text responses only
- **CRITICAL RULE**: Cannot mix CTA buttons with Quick Reply buttons in same template
- **Journey Integration**: flEX journey buttons replace all CTA buttons automatically

## Template Variable Rules:
- **Format**: {{1}}, {{2}}, {{3}} for dynamic content
- **Naming**: Use descriptive names like {{customer_name}}, {{order_number}}
- **Context**: Variables must make sense in message context
- **Testing**: All variables must be populated during approval submission

## flEX-Specific Template Rules:
- Templates created in flEX automatically format for Meta submission
- Button limitations enforced by flEX editor interface
- Journey buttons cannot coexist with CTA buttons (WhatsApp policy)
- Real-time preview shows exact WhatsApp message appearance`,
          category: 'meta_policies',
          content_type: 'compliance_guide',
          knowledge_level: 'expert',
          importance_score: 10,
          tags: ['meta-templates', 'approval-process', 'restrictions', 'button-limitations', 'policy-compliance', 'template-variables']
        }
      ];

      // Combine all knowledge arrays
      const allKnowledge = [
        ...flexPlatformKnowledge,
        ...whatsappKnowledge, 
        ...metaPolicyKnowledge
      ];

      // Insert all knowledge in parallel
      const insertPromises = allKnowledge.map(item => 
        supabase.from('content_chunks').insert({
          ...item,
          source_context: {
            source_type: 'comprehensive_rebuild',
            data_quality: 'high',
            last_updated: new Date().toISOString()
          }
        })
      );

      const results = await Promise.all(insertPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to insert knowledge: ${errors.map(e => e.error?.message).join(', ')}`);
      }

      toast.success(`LEXI knowledge completely rebuilt! Added ${allKnowledge.length} comprehensive knowledge items.`);
    } catch (error) {
      console.error('Error rebuilding knowledge:', error);
      toast.error(`Failed to rebuild knowledge: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">COMPLETE KNOWLEDGE REBUILD</h3>
        <p className="text-red-700 text-sm mb-3">
          This will completely rebuild LEXI's knowledge base with ALL your provided data properly categorized and searchable. This fixes everything.
        </p>
        <Button 
          onClick={fixAllKnowledge}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {loading ? 'Rebuilding Knowledge Base...' : 'REBUILD ALL KNOWLEDGE - FIX EVERYTHING'}
        </Button>
      </div>
    </div>
  );
};