// filepath: c:\Users\HP\Desktop\MERN PROJECTS\Next\New folder\frontend\vite-project\src\components\moderator\MessageBubble.tsx
import React from 'react';
import { Users, MessageCircle, Eye, Clock } from 'lucide-react';
import { Badge } from "@/Components/ui/badge";

interface Message {
  _id: string;
  role: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  formatTime: (timestamp: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, formatTime }) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'user':
        return {
          icon: <Users className="w-3 h-3" />,
          avatar: 'U',
          bubbleClass: 'bg-gray-100 text-gray-800',
          alignment: 'justify-start',
          name: 'User'
        };
      case 'ai':
        return {
          icon: <MessageCircle className="w-3 h-3" />,
          avatar: 'AI',
          bubbleClass: 'bg-blue-100 text-blue-800',
          alignment: 'justify-start',
          name: 'AI'
        };
      case 'moderator':
        return {
          icon: <Eye className="w-3 h-3" />,
          avatar: 'M',
          bubbleClass: 'bg-primary text-primary-foreground',
          alignment: 'justify-end',
          name: 'You'
        };
      default:
        return {
          icon: <MessageCircle className="w-3 h-3" />,
          avatar: 'U',
          bubbleClass: 'bg-gray-100 text-gray-800',
          alignment: 'justify-start',
          name: 'User'
        };
    }
  };

  const config = getRoleConfig(message.role);

  return (
    <div className={`flex ${config.alignment} mb-3`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'moderator' ? 'flex-row-reverse' : ''}`}>
        {/* Compact Avatar */}
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold mt-1 flex-shrink-0">
          {config.avatar}
        </div>
        
        {/* Message Bubble */}
        <div className={`rounded-lg px-3 py-2 ${config.bubbleClass} shadow-sm`}>
          {/* Header - More compact */}
          <div className="flex items-center gap-1 mb-1">
            {config.icon}
            <Badge variant="outline" className="text-xs h-4 px-1">
              {config.name}
            </Badge>
            <span className="text-xs opacity-75">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          {/* Message Content */}
          <p className="text-sm leading-relaxed">
            {message.message}
          </p>
          
          {/* Read Status for moderator */}
          {message.role === 'moderator' && (
            <div className="flex items-center justify-end mt-1">
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Clock className="w-2.5 h-2.5" />
                <span>{message.isRead ? 'Read' : 'Sent'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;