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
      case 'high': return 'border-l-red-400 bg-gray-700';
      case 'medium': return 'border-l-amber-400 bg-gray-700';
      case 'low': return 'border-l-green-400 bg-gray-700';
      default: return 'border-l-gray-400 bg-gray-700';
    }
  };

  return (
    <div 
      className={`
        cursor-pointer transition-all duration-200 hover:bg-gray-600 
        border-b border-amber-500 border-l-2 p-3 ${getPriorityColor(conversation.priority || 'medium')}
        ${isSelected ? 'bg-amber-400 border-r-2 border-r-amber-300' : ''}
        ${conversation.isUnread ? 'bg-gray-600' : ''}
      `}
      onClick={onClick}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isSelected ? 'text-black' : 'text-amber-200'}`}>
            Chat {conversation._id.slice(-6)}
          </span>
          <Badge variant="outline" className={`text-xs h-4 px-1 ${isSelected ? 'border-black text-black bg-white' : 'border-amber-400 text-amber-300'}`}>
            {conversation.priority || 'med'}
          </Badge>
        </div>
        
        <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-black' : 'text-amber-300'}`}>
          {(conversation.hasModeratorMessages || 0) > 0 && (
            <Eye className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-amber-300'}`} />
          )}
          <MessageSquare className="w-3 h-3" />
          <span>{conversation.messageCount || 0}</span>
        </div>
      </div>
      
      {/* Message Preview */}
      <p className={`text-xs truncate mb-2 leading-relaxed ${isSelected ? 'text-black' : 'text-amber-100'}`}>
        {conversation.lastMessage || 'No messages yet...'}
      </p>
      
      {/* Footer - Compact */}
      <div className={`flex items-center justify-between text-xs ${isSelected ? 'text-black' : 'text-amber-200'}`}>
        <span>User: {conversation.userId?.slice(-8) || 'Unknown'}</span>
        <span>{formatTime(conversation.lastTimestamp || '')}</span>
      </div>
    </div>
  );
};

export default ConversationItem;