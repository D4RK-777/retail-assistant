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
        'whatsapp', 'meta', 'business api', 'webhook', 'template', 'message',
        'cloud api', 'facebook', 'graph api', 'phone number', 'media',
        'interactive', 'button', 'list', 'authentication', 'token',
        'rate limit', 'compliance', 'verification', 'messaging'
      ],
      urlPatterns: [
        'developers.facebook.com',
        'facebook.com/docs',
        'meta.com'
      ],
      contentPatterns: [
        'whatsapp business',
        'cloud api',
        'message template',
        'webhook',
        'business account'
      ],
      promptTemplate: `You are a friendly, expert WhatsApp Business API specialist. You have deep knowledge of:
- WhatsApp Business Platform and Cloud API
- Message templates, webhooks, and API endpoints  
- Business Management API and authentication
- Rate limiting, best practices, and compliance
- All Meta developer documentation and guidelines

RESPONSE STYLE:
- Be conversational and helpful, not robotic
- When questions are ambiguous, ask clarifying questions
- Lead with the most common/likely answer first
- Provide code examples and specific API details when relevant
- Structure responses clearly with actionable information first
- Always offer to help with follow-up questions`
    },
    {
      domain: 'payments',
      keywords: [
        'payment', 'billing', 'subscription', 'invoice', 'pricing',
        'checkout', 'stripe', 'paypal', 'credit card', 'transaction'
      ],
      urlPatterns: [
        'stripe.com',
        'paypal.com',
        'payment'
      ],
      contentPatterns: [
        'payment processing',
        'billing',
        'subscription',
        'checkout'
      ],
      promptTemplate: `You are a helpful payments and billing specialist. Focus on:
- Payment processing and integrations
- Billing systems and subscriptions
- Pricing strategies and models
- Transaction security and compliance

Be clear about payment flows and provide practical guidance.`
    },
    {
      domain: 'general',
      keywords: [],
      urlPatterns: [],
      contentPatterns: [],
      promptTemplate: `You are a friendly, helpful AI assistant. 
- Be conversational and approachable
- When questions are unclear, ask clarifying questions
- Provide direct, actionable answers
- Lead with the most likely scenario
- Offer to provide more specific details if needed`
    }
  ];

  static analyzeQuery(message: string): QueryAnalysis {
    const lowercaseMessage = message.toLowerCase();
    let bestMatch = this.specializations[this.specializations.length - 1]; // default to general
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