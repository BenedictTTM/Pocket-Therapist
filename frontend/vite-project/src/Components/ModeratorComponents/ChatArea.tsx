import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeaderProps';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  selectedConversation: any;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  loading: boolean;
  updatePriority: (conversationId: string, priority: string) => void;
  formatTime: (timestamp: string) => string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  loading,
  updatePriority,
  formatTime,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        selectedConversation={selectedConversation}
        updatePriority={updatePriority}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            formatTime={formatTime}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        loading={loading}
      />
    </div>
  );
};

export default ChatArea;