import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Select a conversation
        </h3>
        <p className="text-gray-500">
          Choose a chat from the sidebar to start moderating
        </p>
      </div>
    </div>
  );
};

export default EmptyState;