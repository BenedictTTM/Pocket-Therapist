import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, Filter, Users, Clock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

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
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Fallback to regular conversations if moderator route fails
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
      
      // Mark moderator messages as read
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
        // Refresh messages and conversations
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'ai': return <MessageCircle className="w-4 h-4" />;
      case 'moderator': return <Eye className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Moderator Dashboard</h1>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Chats</div>
              <div className="text-2xl font-bold text-blue-700">{stats.totalConversations || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Active Today</div>
              <div className="text-2xl font-bold text-green-700">{stats.activeToday || 0}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conv._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Chat {conv._id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conv.priority || 'medium')}`}>
                      {conv.priority || 'medium'}
                    </span>
                  </div>
                  {conv.hasModeratorMessages > 0 && (
                    <Eye className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-1">
                  {conv.lastMessage}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Messages: {conv.messageCount}</span>
                  <span>{formatTime(conv.lastTimestamp)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Chat {selectedConversation._id.slice(-6)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    User: {selectedConversation.userId} • {selectedConversation.messageCount} messages
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedConversation.priority || 'medium'}
                    onChange={(e) => updatePriority(selectedConversation._id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === 'moderator' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-gray-200 text-gray-800'
                        : msg.role === 'ai'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getRoleIcon(msg.role)}
                      <span className="text-xs font-medium uppercase">
                        {msg.role === 'moderator' ? 'You' : msg.role}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message to the user..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;