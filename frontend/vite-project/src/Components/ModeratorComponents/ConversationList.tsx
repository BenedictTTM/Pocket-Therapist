import React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { ScrollArea } from "@/Components/ui/scroll-area";

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  formatTime: (timestamp: string) => string;
  loading?: boolean;
  searchTerm?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  formatTime,
  loading = false,
  searchTerm = '',
}) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400 mx-auto"></div>
          <p className="text-xs text-amber-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          {searchTerm ? (
            <>
              <Search className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <div>
                <h4 className="font-medium text-sm">No results</h4>
                <p className="text-xs text-muted-foreground">Try different search terms</p>
              </div>
            </>
          ) : (
            <>
              <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <div>
                <h4 className="font-medium text-sm">No conversations</h4>
                <p className="text-xs text-muted-foreground">Conversations will appear here</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div>
        {conversations.map((conv) => (
          <ConversationItem
            key={conv._id}
            conversation={conv}
            isSelected={selectedConversation?._id === conv._id}
            onClick={() => onSelectConversation(conv)}
            formatTime={formatTime}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;