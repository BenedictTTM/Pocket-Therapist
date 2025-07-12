import React, { useState } from 'react';
import { Send, Paperclip, Smile, AlertTriangle } from 'lucide-react';
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  loading: boolean;
  selectedConversation?: any;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  sendMessage,
  loading,
  selectedConversation,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
    // Clear typing indicator after 1 second of no typing
    setTimeout(() => setIsTyping(false), 1000);
  };

  const isHighPriority = selectedConversation?.priority === 'high';

  return (
    <Card className="rounded-none border-l-0 border-r-0 border-b-0">
      <CardContent className="p-4 space-y-3">
        {/* Priority warning for high priority conversations */}
        {isHighPriority && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">
              High Priority Conversation - Respond promptly
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Responding as Moderator
          </Badge>
          {isTyping && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Typing...
            </Badge>
          )}
        </div>

        {/* Message Input */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to the user..."
              disabled={loading}
              className="pr-20"
            />
            {/* Quick action buttons inside input */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Paperclip className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Smile className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className={`${isHighPriority ? 'bg-red-500 hover:bg-red-600' : ''} transition-all`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>

        {/* Character count and shortcuts */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className={newMessage.length > 500 ? 'text-red-500' : ''}>
            {newMessage.length}/1000
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageInput;