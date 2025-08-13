import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Trash2, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CrawlerService } from '@/services/CrawlerService';
import { PersonalityService, Personality, ChatMessage } from '@/services/PersonalityService';
import womanAvatar from '@/assets/woman-avatar-green-eyes.jpg';

const AIPersonalitySelector: React.FC = () => {
  const [currentPersona, setCurrentPersona] = useState<Personality | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const personalities = PersonalityService.getAllPersonalities();

  // Initialize with first personality
  useEffect(() => {
    if (personalities.length > 0 && !currentPersona) {
      const firstPersona = personalities[0];
      setCurrentPersona(firstPersona);
      setMessages([PersonalityService.createChatMessage(
        `Hello! I'm ${firstPersona.name}. ${firstPersona.tagline} How can I assist you today?`,
        'bot',
        firstPersona.name
      )]);
    }
  }, [personalities, currentPersona]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
  };

  const callPersonalityAPI = async (message: string, personality: Personality): Promise<string> => {
    try {
      // Get scraped pages for context
      const scrapedPages = await CrawlerService.getScrapedPages();
      
      // Generate context from scraped pages
      const context = scrapedPages.length > 0 
        ? CrawlerService.generateKnowledgeContext(scrapedPages)
        : 'No specific context available.';

      // Generate personality-specific prompt
      const enhancedPrompt = PersonalityService.generatePrompt(personality, message, context);
      
      // Call the chat-ai Supabase function with personality information
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: message, // Send original message, not enhanced prompt
          context: context,
          sessionId: crypto.randomUUID(),
          personality: personality.name,
          personalityPrompt: enhancedPrompt // Send the enhanced prompt as personality prompt
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      return data?.response || 'I apologize, but I encountered an issue processing your request. Please try again.';
    } catch (error) {
      console.error('Error calling personality API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentPersona || isLoading) return;

    const userMessage = PersonalityService.createChatMessage(input, 'user');
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callPersonalityAPI(input, currentPersona);
      const botMessage = PersonalityService.createChatMessage(response, 'bot', currentPersona.name);
      setMessages(prev => [...prev, botMessage]);
      
      // Log the interaction to assistant_user_interactions table
      try {
        // Get user's organization ID
        const { data: orgData } = await supabase.rpc('get_user_organization');
        
        await supabase.from('assistant_user_interactions').insert({
          session_id: crypto.randomUUID(),
          user_message: input,
          ai_response: response,
          personality_used: currentPersona.name,
          context_used: 'AI Personality Chat',
          organization_id: orgData
        });
      } catch (logError) {
        console.warn('Failed to log interaction:', logError);
      }
    } catch (error) {
      const errorMessage = PersonalityService.createChatMessage(
        'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        'bot',
        currentPersona.name
      );
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Connection Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (currentPersona) {
      setMessages([PersonalityService.createChatMessage(
        `Hello! I'm ${currentPersona.name}. ${currentPersona.tagline} How can I assist you today?`,
        'bot',
        currentPersona.name
      )]);
    }
  };

  const selectPersonality = (personality: Personality) => {
    setCurrentPersona(personality);
    setMessages([PersonalityService.createChatMessage(
      `Hello! I'm ${personality.name}. ${personality.tagline} How can I assist you today?`,
      'bot',
      personality.name
    )]);
  };

  const PersonalityIcon = ({ personality }: { personality: Personality }) => (
    <div 
      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white flex-shrink-0 ${personality.bgColor}`}
    >
      {personality.icon}
    </div>
  );

  const UserIcon = () => (
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
      <User className="h-5 w-5" />
    </div>
  );

  if (!currentPersona) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading AI personalities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[800px] bg-background border rounded-lg overflow-hidden">
      {/* Personality Selector Sidebar */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">AI Retail Assistants</h2>
          <p className="text-sm text-muted-foreground">Choose your perfect shopping companion</p>
        </div>
        
        <div className="space-y-3">
          {personalities.map((personality) => (
            <Card
              key={personality.name}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                currentPersona?.name === personality.name
                  ? 'ring-2 ring-primary shadow-sm'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => selectPersonality(personality)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${personality.bgColor}`}
                  >
                    {personality.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {personality.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {personality.tagline}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {personality.psychometricProfile.discStyle} Style
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`p-4 border-b ${currentPersona.bgColor} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PersonalityIcon personality={currentPersona} />
              <div>
                <h3 className="text-lg font-semibold">{currentPersona.name}</h3>
                <p className="text-sm opacity-90">{currentPersona.tagline}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.type === 'bot' && <PersonalityIcon personality={currentPersona} />}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.type === 'user' && <UserIcon />}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <PersonalityIcon personality={currentPersona} />
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${currentPersona.name}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
              className={currentPersona.bgColor}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Core Function:</strong> {currentPersona.coreFunction}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPersonalitySelector;