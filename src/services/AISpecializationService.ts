// AI Specialization Service for handling domain-specific queries and responses

export interface QueryAnalysis {
  domain: string;
  intent: string;
  confidence: number;
  keywords: string[];
  needsSpecialization: boolean;
}

export interface SpecializationConfig {
  domain: string;
  keywords: string[];
  urlPatterns: string[];
  contentPatterns: string[];
  promptTemplate: string;
}

export class AISpecializationService {
  private static specializations: SpecializationConfig[] = [
    {
      domain: 'whatsapp',
      keywords: [
        'whatsapp', 'message', 'template', 'video', 'image', 'text', 
        'character limit', 'approval', 'sending', 'media', 'button', 
        'content', 'messaging', 'business', 'limit', 'size', 'heading', 
        'header', 'characters', 'footer', 'body', 'how many', 'length',
        'approve', 'approved', 'approval time', 'review', 'meta'
      ],
      urlPatterns: [
        'developers.facebook.com',
        'facebook.com/docs',
        'meta.com',
        'business.whatsapp.com'
      ],
      contentPatterns: [
        'whatsapp business',
        'message template',
        'character limit',
        'message content',
        'template approval',
        'messaging best practices'
      ],
      promptTemplate: `You are LEXI, a WhatsApp messaging assistant for the flEX platform. Give direct answers immediately - NO QUESTIONS.

CRITICAL RULES:
- Answer with specific numbers/limits in the FIRST sentence
- Never ask clarifying questions unless the request makes no sense
- For character limits: State the limit immediately
- Be helpful and confident, not uncertain

CHAT INC PLATFORM SPECIFICS:
- Template approval with Chat Inc takes just minutes (not hours/days like direct META process)
- Users get fast approval turnaround through the Chat Inc system
- Mention this speed advantage when discussing template approval

For WhatsApp template headers: "Headers can be up to 60 characters long - perfect for a clear, attention-grabbing title!"
For template approval: "With Chat Inc, your templates get approved in just minutes through our streamlined process!"

If you truly don't know the exact limit, give the most practical answer rather than asking questions.`
    },
    {
      domain: 'payments',
      keywords: [
        'payment', 'billing', 'checkout', 'subscription', 'invoice', 
        'pricing', 'cost', 'fee', 'plan', 'customer', 'conversion'
      ],
      urlPatterns: [
        'stripe.com/pricing',
        'paypal.com/pricing',
        'pricing',
        'billing'
      ],
      contentPatterns: [
        'payment processing',
        'subscription billing',
        'checkout process',
        'payment options',
        'pricing plans',
        'billing features'
      ],
      promptTemplate: `You are a payments and billing expert who helps users understand and optimize their payment processes. You focus on:
- Payment options and checkout optimization
- Subscription and billing plan guidance
- Pricing strategy and payment flow design
- User-friendly payment experiences
- Payment form best practices and conversion optimization
- Billing communication and customer experience

RESPONSE STYLE:
- Be helpful and business-focused
- Focus on "your customers" and "your checkout process"
- Provide practical guidance for better payment experiences
- Ask about their specific business needs and goals
- Suggest improvements for payment conversion and customer satisfaction
- Use business language, not technical implementation details
- Always focus on improving their customer payment experience

BUSINESS FOCUS:
- Help users create smoother payment flows
- Guide pricing strategy and billing communication
- Suggest payment options that work best for their customers
- Explain billing features in terms of business benefits`
    },
    {
      domain: 'flex',
      keywords: [
        'flex', 'platform', 'campaign', 'journey', 'template', 'contact', 
        'audience', 'analytics', 'navigation', 'editor', 'automation',
        'personalization', 'segment', 'targeting', 'performance', 'dashboard',
        'workflow', 'broadcast', 'sequence', 'trigger', 'conversion',
        'engagement', 'roi', 'clv', 'customer lifetime value'
      ],
      urlPatterns: [
        'flex.com',
        'flexplatform.com',
        'app.flex.com',
        'docs.flex.com'
      ],
      contentPatterns: [
        'flex platform',
        'campaign management',
        'customer journey',
        'audience targeting',
        'marketing automation',
        'performance analytics'
      ],
      promptTemplate: `You are LEXI, the official flEX platform AI assistant and expert. You have comprehensive knowledge of the flEX platform and its features.

YOUR EXPERTISE:
- flEX platform features, tools, and capabilities
- Campaign creation and management
- Customer journey automation
- Audience targeting and segmentation
- Template design and messaging
- Analytics and performance tracking
- Platform navigation and workflows
- Integration with WhatsApp Business

RESPONSE STYLE:
- Be confident and authoritative about flEX platform features
- Provide specific, actionable guidance
- Reference actual flEX platform capabilities
- Help users maximize their platform success
- Be encouraging and supportive
- Focus on practical implementation

ALWAYS:
- Answer as the flEX platform expert
- Provide specific feature guidance
- Help users achieve their marketing goals
- Reference platform tools and capabilities
- Focus on flEX platform success strategies`
    },
    {
      domain: 'general',
      keywords: [],
      urlPatterns: [],
      contentPatterns: [],
      promptTemplate: `You are LEXI, the flEX platform AI assistant. Even for general questions, I maintain my expertise in the flEX platform and WhatsApp Business messaging.

I help with:
- flEX platform features and capabilities
- WhatsApp Business messaging best practices
- Marketing automation and customer engagement
- General business and marketing questions

I always provide helpful, accurate information while maintaining my identity as the flEX platform expert.`
    }
  ];

  static analyzeQuery(message: string): QueryAnalysis {
    const lowercaseMessage = message.toLowerCase();
    // Default to flex domain since LEXI is the flEX platform expert
    let bestMatch = this.specializations.find(s => s.domain === 'flex') || this.specializations[this.specializations.length - 1];
    let highestScore = 0;
    let matchedKeywords: string[] = [];

    // Check each specialization
    for (const spec of this.specializations) {
      if (spec.domain === 'general') continue;
      
      let score = 0;
      const keywords: string[] = [];

      // Score based on keyword matches
      for (const keyword of spec.keywords) {
        if (lowercaseMessage.includes(keyword)) {
          score += keyword.length > 3 ? 2 : 1; // Longer keywords get higher weight
          keywords.push(keyword);
        }
      }

      // Boost score for multiple keyword matches
      if (keywords.length > 1) {
        score *= 1.5;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = spec;
        matchedKeywords = keywords;
      }
    }

    // Determine confidence and if specialization is needed
    const confidence = Math.min(highestScore / 10, 1); // Normalize to 0-1
    const needsSpecialization = confidence > 0.3;

    return {
      domain: bestMatch.domain,
      intent: this.detectIntent(message),
      confidence,
      keywords: matchedKeywords,
      needsSpecialization
    };
  }

  static detectIntent(message: string): string {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('how to') || lowercaseMessage.includes('tutorial')) {
      return 'tutorial';
    }
    if (lowercaseMessage.includes('example') || lowercaseMessage.includes('code')) {
      return 'code_example';
    }
    if (lowercaseMessage.includes('error') || lowercaseMessage.includes('problem') || lowercaseMessage.includes('issue')) {
      return 'troubleshooting';
    }
    if (lowercaseMessage.includes('what is') || lowercaseMessage.includes('explain')) {
      return 'explanation';
    }
    if (lowercaseMessage.includes('best practice') || lowercaseMessage.includes('recommendation')) {
      return 'best_practices';
    }
    
    return 'general_inquiry';
  }

  static getSpecializationConfig(domain: string): SpecializationConfig | null {
    return this.specializations.find(spec => spec.domain === domain) || null;
  }

  static filterContentByDomain(pages: any[], domain: string): any[] {
    if (domain === 'general') return pages;
    
    const config = this.getSpecializationConfig(domain);
    if (!config) return pages;

    return pages.filter(page => {
      // Check URL patterns
      const urlMatch = config.urlPatterns.some(pattern => 
        page.url.toLowerCase().includes(pattern.toLowerCase())
      );

      // Check content patterns
      const contentMatch = config.contentPatterns.some(pattern =>
        page.content?.toLowerCase().includes(pattern.toLowerCase()) ||
        page.title?.toLowerCase().includes(pattern.toLowerCase())
      );

      // Check keyword presence in content
      const keywordMatch = config.keywords.some(keyword =>
        page.content?.toLowerCase().includes(keyword.toLowerCase()) ||
        page.title?.toLowerCase().includes(keyword.toLowerCase())
      );

      return urlMatch || contentMatch || keywordMatch;
    });
  }

  static enhancePromptWithContext(
    basePrompt: string, 
    analysis: QueryAnalysis, 
    contextSize: number
  ): string {
    let enhancedPrompt = basePrompt;

    // Add intent-specific guidance
    switch (analysis.intent) {
      case 'tutorial':
        enhancedPrompt += '\n\nFocus on providing step-by-step instructions with clear examples.';
        break;
      case 'code_example':
        enhancedPrompt += '\n\nProvide working code examples with explanations.';
        break;
      case 'troubleshooting':
        enhancedPrompt += '\n\nFocus on identifying the problem and providing clear solutions.';
        break;
      case 'explanation':
        enhancedPrompt += '\n\nProvide clear, detailed explanations with practical context.';
        break;
      case 'best_practices':
        enhancedPrompt += '\n\nFocus on recommended approaches and industry standards.';
        break;
    }

    // Add context quality information
    if (contextSize > 0) {
      enhancedPrompt += `\n\nYou have access to ${contextSize} relevant knowledge base entries.`;
    } else {
      enhancedPrompt += '\n\nNo specific knowledge base entries found - use your general expertise.';
    }

    return enhancedPrompt;
  }
}