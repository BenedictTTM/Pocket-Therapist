import React from 'react';
import { Eye, Clock, MessageSquare, User } from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

interface Conversation {
  _id: string;
  priority?: string;
  hasModeratorMessages?: number;
  lastMessage?: string;
  messageCount?: number;
  lastTimestamp?: string;
  userId?: string;
  isUnread?: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (timestamp: string) => string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  formatTime,
}) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md rounded-none border-l-0 border-r-0 border-t-0 relative ${
        isSelected 
          ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
          : 'hover:bg-accent/50'
      } ${conversation.isUnread ? 'bg-blue-50' : ''}`}
      onClick={onClick}
    >
      {/* Unread indicator */}
      {conversation.isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/10">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-semibold">
                Chat {conversation._id.slice(-6)}
              </span>
              {conversation.userId && (
                <p className="text-xs text-muted-foreground">
                  User: {conversation.userId.slice(-8)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={getPriorityVariant(conversation.priority || 'medium')}
              className="text-xs"
            >
              {conversation.priority || 'medium'}
            </Badge>
            {(conversation.hasModeratorMessages || 0) > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {conversation.hasModeratorMessages}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground truncate mb-3 leading-relaxed">
          {conversation.lastMessage || 'No messages yet...'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{conversation.messageCount || 0}</span>
            </div>
            {conversation.isUnread && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(conversation.lastTimestamp || '')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationItem;