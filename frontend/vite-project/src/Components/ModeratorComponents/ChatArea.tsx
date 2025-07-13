import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeaderProps';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ScrollArea } from "@/Components/ui/scroll-area";

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
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <ChatHeader
          selectedConversation={selectedConversation}
          updatePriority={updatePriority}
        />
      </div>

      {/* Scrollable Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  formatTime={formatTime}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Compact Input */}
      <div className="flex-shrink-0">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          loading={loading}
          selectedConversation={selectedConversation}
        />
      </div>
    </div>
  );
};

export default ChatArea;