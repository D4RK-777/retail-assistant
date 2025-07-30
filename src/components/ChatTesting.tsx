import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      content: "Hello! I'm your AI assistant. I've been trained on your knowledge base and I'm ready to help. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mockResponses = [
    "Based on your knowledge base, I can help you with that. Here's what I found...",
    "That's a great question! According to the documentation you've provided...",
    "I can see from your training data that this relates to...",
    "Let me check the relevant information from your knowledge sources...",
    "Based on the domains and documents you've uploaded, here's my response..."
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: "bot",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
        content: "Hello! I'm your AI assistant. I've been trained on your knowledge base and I'm ready to help. Ask me anything!",
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Chat Testing Environment</h2>
          <p className="text-muted-foreground">
            Test your AI's responses and fine-tune its performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
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
                  <CardDescription>Testing Mode • {selectedModel}</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
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
                      <p className="text-sm">{message.content}</p>
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
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
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
              <h4 className="font-medium mb-2">Response Quality</h4>
              <div className="space-y-2">
                <Badge className="w-full justify-center bg-green-100 text-green-700">
                  Excellent
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Knowledge Coverage</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Sources used:</span>
                  <span className="ml-1 font-medium">8/10</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Quick Tests</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setInputValue("What services do you offer?")}
                >
                  Test Services
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setInputValue("How can I contact support?")}
                >
                  Test Support
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setInputValue("What are your pricing plans?")}
                >
                  Test Pricing
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span>1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span>94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satisfaction</span>
                  <span>4.8/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}