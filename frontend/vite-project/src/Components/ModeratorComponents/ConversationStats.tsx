import React from 'react';
import { Card, CardContent } from "@/Components/ui/card";
import { MessageCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConversationStatsProps {
  stats: {
    totalConversations?: number;
    activeToday?: number;
    highPriority?: number;
    resolved?: number;
  };
}

const ConversationStats: React.FC<ConversationStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Chats",
      value: stats.totalConversations || 0,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Active Today",
      value: stats.activeToday || 0,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "High Priority",
      value: stats.highPriority || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Resolved",
      value: stats.resolved || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {statCards.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} ${stat.borderColor} hover:shadow-md transition-shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${stat.color}`}>
                  {stat.title}
                </div>
                <div className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversationStats;