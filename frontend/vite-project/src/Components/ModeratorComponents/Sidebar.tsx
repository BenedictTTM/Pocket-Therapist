import React from 'react';
import ConversationStats from './ConversationStats';
import ConversationFilters from './ConversationFilters';
import ConversationList from './ConversationList';
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Badge } from "@/Components/ui/badge";
import { Bell, Settings } from 'lucide-react';
import { Button } from "@/Components/ui/button";

interface SidebarProps {
  stats: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  conversations: any[];
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
  formatTime: (timestamp: string) => string;
  getPriorityColor: (priority: string) => string;
  unreadCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  stats,
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter,
  conversations,
  selectedConversation,
  onSelectConversation,
  formatTime,
  getPriorityColor,
  unreadCount = 0,
}) => {
  return (
    <div className="w-1/3 bg-background border-r flex flex-col h-screen">
      {/* Fixed Header - Compact */}
      <div className="flex-shrink-0">
        <Card className="rounded-none border-l-0 border-r-0 border-t-0">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Moderator</CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Bell className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <ConversationStats stats={stats} />
          </CardContent>
        </Card>
      </div>

      {/* Fixed Filters */}
      <div className="flex-shrink-0">
        <ConversationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
        <Separator />
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 min-h-0">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={onSelectConversation}
          formatTime={formatTime}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

export default Sidebar;