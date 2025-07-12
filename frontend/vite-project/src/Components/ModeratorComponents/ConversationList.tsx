import React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Card, CardContent } from "@/Components/ui/card";

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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-sm mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-medium text-muted-foreground">No results found</h3>
                  <p className="text-sm text-muted-foreground/75 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              </>
            ) : (
              <>
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-medium text-muted-foreground">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground/75 mt-1">
                    Conversations will appear here when users start chatting
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-0">
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