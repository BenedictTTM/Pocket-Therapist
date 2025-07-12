import React from 'react';
import ConversationStats from './ConversationStats';
import ConversationFilters from './ConversationFilters';
import ConversationList from './ConversationList';

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
}) => {
  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Moderator Dashboard</h1>
        <ConversationStats stats={stats} />
      </div>

      <ConversationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={onSelectConversation}
        formatTime={formatTime}
        getPriorityColor={getPriorityColor}
      />
    </div>
  );
};

export default Sidebar;