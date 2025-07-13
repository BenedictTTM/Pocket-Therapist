import React from 'react';
import { MessageCircle, ArrowLeft, Search, Filter } from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

interface EmptyStateProps {
  hasConversations?: boolean;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  hasConversations = true, 
  isFiltered = false,
  onClearFilters 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-white p-8">
      <Card className="w-full max-w-md bg-white border-amber-500 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {isFiltered ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-amber-100 rounded-full">
                <Search className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">No conversations found</h3>
                <p className="text-gray-600">
                  No conversations match your current filters. Try adjusting your search criteria.
                </p>
              </div>
              {onClearFilters && (
                <Button variant="outline" onClick={onClearFilters} className="gap-2">
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </>
          ) : hasConversations ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-amber-100 rounded-full">
                <MessageCircle className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">Select a conversation</h3>
                <p className="text-gray-600">
                  Choose a chat from the sidebar to start moderating and helping users.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <ArrowLeft className="w-4 h-4" />
                <span>Browse conversations on the left</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No conversations yet</h3>
                <p className="text-muted-foreground">
                  Conversations will appear here when users start chatting with the AI assistant.
                </p>
              </div>
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                💡 Tip: You'll be notified when new conversations need moderation
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;