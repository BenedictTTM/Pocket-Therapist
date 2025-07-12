import React from 'react';

interface ConversationStatsProps {
  stats: {
    totalConversations?: number;
    activeToday?: number;
    highPriority?: number;
    resolved?: number;
  };
}

const ConversationStats: React.FC<ConversationStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-3 py-1 text-center">
      <div>
        <div className="text-xl font-bold text-blue-600">
          {stats.totalConversations || 0}
        </div>
        <div className="text-xs text-muted-foreground">Total Chats</div>
      </div>

      <div>
        <div className="text-xl font-bold text-green-600">
          {stats.activeToday || 0}
        </div>
        <div className="text-xs text-muted-foreground">Active Today</div>
      </div>

      <div>
        <div className="text-xl font-bold text-red-600">
          {stats.highPriority || 0}
        </div>
        <div className="text-xs text-muted-foreground">High Priority</div>
      </div>

      <div>
        <div className="text-xl font-bold text-emerald-600">
          {stats.resolved || 0}
        </div>
        <div className="text-xs text-muted-foreground">Resolved</div>
      </div>
    </div>
  );
};

export default ConversationStats;