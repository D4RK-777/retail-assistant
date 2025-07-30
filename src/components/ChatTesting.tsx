import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RotateCcw, Settings, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CrawlerService } from "@/services/CrawlerService";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export function ChatTesting() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your AI assistant powered by Gemini 2.5 Flash. I've been trained on your knowledge base and I'm ready to help. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("AIzaSyAXCL8GnTnVX2ZeSLcumdUjbbcA2Uy-Hu8");
  const [tempApiKey, setTempApiKey] = useState("");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConnected(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('gemini_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setIsConnected(true);
    setShowApiDialog(false);
    setTempApiKey("");
    
    toast({
      title: "API Key Saved",
      description: "Gemini API key has been saved securely in your browser.",
    });
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey("");
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: "API key has been removed from your browser.",
    });
  };

  const callGeminiAPI = async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("No API key provided");
    }

    // Get crawled data for context
    const pages = await CrawlerService.getScrapedPages();
    const knowledgeContext = CrawlerService.generateKnowledgeContext(pages);
    const crawledDataCount = pages.length;

    const systemPrompt = `You are an AI assistant that has been trained on a knowledge base. The user has uploaded documents, domains, and URLs to train you. ${
      crawledDataCount > 0 
        ? `You have access to ${crawledDataCount} crawled web pages with relevant information.${knowledgeContext}` 
        : 'Currently no website data has been crawled.'
    }

Please respond helpfully and knowledgeably to the following question. If the information is available in your knowledge base, reference it specifically. If not, provide a helpful general response and suggest what information might be needed.

User question: ${message}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!isConnected) {
      toast({
        title: "No API Key",
        description: "Please configure your Gemini API key first.",
        variant: "destructive"
      });
      setShowApiDialog(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await callGeminiAPI(currentMessage);
      
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: "bot",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: "bot",
        content: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key or try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response from Gemini. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        type: "bot",
        content: "Hello! I'm your AI assistant powered by Gemini 2.5 Flash. I've been trained on your knowledge base and I'm ready to help. Ask me anything!",
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const testQuestions = [
    "What services do you offer?",
    "How can I contact support?",
    "What are your pricing plans?",
    "Tell me about your company",
    "What features do you provide?"
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Chat Testing Environment</h2>
          <p className="text-muted-foreground">
            Test your AI's responses powered by Gemini 2.5 Flash.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
            <DialogTrigger asChild>
              <Button variant={isConnected ? "outline" : "default"}>
                <Key className="h-4 w-4 mr-2" />
                {isConnected ? "Connected" : "Setup API"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Gemini API Key</DialogTitle>
                <DialogDescription>
                  Enter your Google Gemini API key to enable AI functionality.
                </DialogDescription>
              </DialogHeader>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your API key will be stored securely in your browser's local storage. For production applications, consider using Supabase for secure secret management.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Gemini API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Get your API key from Google AI Studio
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveApiKey} className="flex-1">
                    Save API Key
                  </Button>
                  {isConnected && (
                    <Button onClick={handleDisconnect} variant="destructive">
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={clearChat}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 flex-1">
        {/* Chat Interface */}
        <Card className="lg:col-span-3 shadow-card flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-primary rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <CardDescription>Powered by {selectedModel} • Testing Mode</CardDescription>
                </div>
              </div>
              <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4 max-h-96">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="p-2 bg-gradient-primary rounded-full self-start">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md space-y-1 ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="p-2 bg-primary rounded-full self-start order-2">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="p-2 bg-gradient-primary rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={isConnected ? "Type your message..." : "Please configure your API key first..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Controls */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Testing Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connection Status</h4>
              <div className="space-y-2">
                <Badge className={`w-full justify-center ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isConnected ? 'Gemini Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Model Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span>Gemini 2.5 Flash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span>Google AI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <span>1024</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Quick Tests</h4>
              <div className="space-y-2">
                {testQuestions.map((question, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-left justify-start h-auto py-2 px-3"
                    onClick={() => setInputValue(question)}
                    disabled={!isConnected}
                  >
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span>0.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top-K:</span>
                  <span>40</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top-P:</span>
                  <span>0.95</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}