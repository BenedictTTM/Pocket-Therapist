// filepath: c:\Users\HP\Desktop\MERN PROJECTS\Next\New folder\frontend\vite-project\src\components\moderator\MessageBubble.tsx
import React from 'react';
import { Users, MessageCircle, Eye } from 'lucide-react';

interface Message {
  _id: string;
  role: string;
  message: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
  formatTime: (timestamp: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, formatTime }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'ai': return <MessageCircle className="w-4 h-4" />;
      case 'moderator': return <Eye className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex ${message.role === 'moderator' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.role === 'user'
            ? 'bg-gray-200 text-gray-800'
            : message.role === 'ai'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-500 text-white'
        }`}
      >
        <div className="flex items-center space-x-2 mb-1">
          {getRoleIcon(message.role)}
          <span className="text-xs font-medium uppercase">
            {message.role === 'moderator' ? 'You' : message.role}
          </span>
        </div>
        <p className="text-sm">{message.message}</p>
        <p className="text-xs opacity-75 mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;