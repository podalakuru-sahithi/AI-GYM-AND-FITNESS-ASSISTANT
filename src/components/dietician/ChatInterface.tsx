import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Trash2, Salad, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useAIChat';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, action?: string) => void;
  onClearHistory: () => void;
  placeholder?: string;
  quickActions?: { label: string; action: string; message: string }[];
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onClearHistory,
  placeholder = "Ask me anything about nutrition...",
  quickActions,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = (action: string, message: string) => {
    onSendMessage(message, action);
  };

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary">
            <Salad className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI Dietician</h3>
            <p className="text-xs text-muted-foreground">Your personal nutrition expert</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearHistory}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
            <div className="p-4 rounded-full bg-primary/10">
              <Salad className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome to AI Dietician!</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                I'm here to help you with personalized meal plans, nutritional advice, and calorie tracking.
              </p>
            </div>
            {quickActions && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {quickActions.map((qa) => (
                  <Button
                    key={qa.action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(qa.action, qa.message)}
                    disabled={isLoading}
                  >
                    {qa.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Quick Actions (when there are messages) */}
      {messages.length > 0 && quickActions && (
        <div className="flex gap-2 px-4 py-2 border-t overflow-x-auto">
          {quickActions.map((qa) => (
            <Button
              key={qa.action}
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => handleQuickAction(qa.action, qa.message)}
              disabled={isLoading}
            >
              {qa.label}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="gradient-primary">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
