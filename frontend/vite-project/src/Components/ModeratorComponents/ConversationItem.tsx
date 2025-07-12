import React from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import { Badge } from "@/Components/ui/badge";

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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div 
      className={`
        cursor-pointer transition-all duration-200 hover:bg-accent/50 
        border-b border-l-2 p-3 ${getPriorityColor(conversation.priority || 'medium')}
        ${isSelected ? 'bg-accent border-r-2 border-r-primary' : ''}
        ${conversation.isUnread ? 'bg-blue-50' : ''}
      `}
      onClick={onClick}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            Chat {conversation._id.slice(-6)}
          </span>
          <Badge variant="outline" className="text-xs h-4 px-1">
            {conversation.priority || 'med'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {(conversation.hasModeratorMessages || 0) > 0 && (
            <Eye className="w-3 h-3 text-primary" />
          )}
          <MessageSquare className="w-3 h-3" />
          <span>{conversation.messageCount || 0}</span>
        </div>
      </div>
      
      {/* Message Preview */}
      <p className="text-xs text-muted-foreground truncate mb-2 leading-relaxed">
        {conversation.lastMessage || 'No messages yet...'}
      </p>
      
      {/* Footer - Compact */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>User: {conversation.userId?.slice(-8) || 'Unknown'}</span>
        <span>{formatTime(conversation.lastTimestamp || '')}</span>
      </div>
    </div>
  );
};

export default ConversationItem;