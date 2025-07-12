import React, { useState, useEffect } from 'react';
import Sidebar from './Components/ModeratorComponents/Sidebar'
import ChatArea from './Components/ModeratorComponents/ChatArea';
import EmptyState from './Components/ModeratorComponents/EmptyState';

const ModeratorDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [moderatorId] = useState('mod-' + Math.random().toString(36).substr(2, 9));

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [page, priorityFilter, searchTerm]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE}/moderator/conversations?${params}`);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      try {
        const fallbackResponse = await fetch(`${API_BASE}/conversations/all`);
        const fallbackData = await fallbackResponse.json();
        setConversations(fallbackData.conversations || []);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE}/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/moderator/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/moderator/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          conversationId: selectedConversation._id,
          moderatorId: moderatorId
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedConversation._id);
        await fetchConversations();
      } else {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await fetch(`${API_BASE}/moderator/mark-read/${conversationId}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const updatePriority = async (conversationId, priority) => {
    try {
      await fetch(`${API_BASE}/moderator/priority/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });
      await fetchConversations();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        stats={stats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        formatTime={formatTime}
        getPriorityColor={getPriorityColor}
      />

      {selectedConversation ? (
        <ChatArea
          selectedConversation={selectedConversation}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          loading={loading}
          updatePriority={updatePriority}
          formatTime={formatTime}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default ModeratorDashboard;