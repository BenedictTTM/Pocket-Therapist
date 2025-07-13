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
        <div className="text-xl font-bold text-blue-300">
          {stats.totalConversations || 0}
        </div>
        <div className="text-xs text-amber-200">Total Chats</div>
      </div>

      <div>
        <div className="text-xl font-bold text-green-300">
          {stats.activeToday || 0}
        </div>
        <div className="text-xs text-amber-200">Active Today</div>
      </div>

      <div>
        <div className="text-xl font-bold text-red-300">
          {stats.highPriority || 0}
        </div>
        <div className="text-xs text-amber-200">High Priority</div>
      </div>

      <div>
        <div className="text-xl font-bold text-emerald-300">
          {stats.resolved || 0}
        </div>
        <div className="text-xs text-amber-200">Resolved</div>
      </div>
    </div>
  );
};

export default ConversationStats;