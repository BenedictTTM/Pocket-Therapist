import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Plus, Trash2, User, Bot, Settings, Search } from 'lucide-react';
import { useAuth, useUser } from "@clerk/clerk-react";
import LandingPage from './Components/landingPage';
import { Card, CardHeader, CardContent, CardTitle } from "./Components/ui/card";
import { Badge } from "./Components/ui/badge";
import { Button } from "./Components/ui/button";
import { ScrollArea } from "./Components/ui/scroll-area";
import { Separator } from "./Components/ui/separator";

interface Conversation {
  _id: string;
  lastMessage?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface Message {
  role: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const ChatApp = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { getToken } = useAuth();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Get actual user ID from Clerk
  const userId = user?.id || 'anonymous';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/conversations/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [getToken, userId]);

  useEffect(() => {
    if (userId !== 'anonymous') {
      loadConversations();
    }
  }, [userId, loadConversations]);

  const loadMessages = async (conversationId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewConversation = () => {
    const newConversationId = 'conv-' + Date.now();
    setCurrentConversationId(newConversationId);
    setMessages([]);
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    loadMessages(conversationId);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/conversations/${conversationId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setConversations(conversations.filter(conv => conv._id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const deleteCurrentChat = () => {
    if (currentConversationId && window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      deleteConversation(currentConversationId);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || userId === 'anonymous') return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      message: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversationId: currentConversationId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to UI
        const aiMessage: Message = {
          role: 'ai',
          message: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Refresh conversations to update last message
        loadConversations();
      } else {
        console.error('Error from server:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign-in redirect
  const handleSignIn = () => {
    window.location.href = '/sign-in';
  };

  // Show sign-in prompt if user is not authenticated
  if (userId === 'anonymous') {
    return (
      <LandingPage 
        showSignInPrompt={true}
        description="You need to be signed in to use the chat."
        buttonText="Lets Talk"
        buttonHref="/sign-in"
        onButtonClick={handleSignIn}
      />
    );
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Enhanced Sidebar */}
      <div className="w-1/3 bg-gray-900 border-r border-amber-300 flex flex-col h-screen shadow-xl">
        {/* Fixed Header - Compact */}
        <div className="flex-shrink-0">
          <Card className="rounded-none border-l-0 border-r-0 border-t-0 bg-gray-800 border-amber-300">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white font-bold">Your Chats</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-amber-300/10 border-amber-300 text-amber-300 h-5 text-xs">
                    {conversations.length}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-300 hover:text-amber-400 hover:bg-gray-700">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* New Conversation Button - Compact */}
              <Button
                onClick={createNewConversation}
                className="w-full bg-amber-300 text-black hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold py-4 rounded-lg mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </CardHeader>
            
            <CardContent className="pt-0 pb-3">
              {/* Search Bar - Compact */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-amber-300" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-amber-300 text-white placeholder-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none transition-all duration-200 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-amber-300/30" />

        {/* Scrollable Conversation List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 text-amber-300 mx-auto mb-3 opacity-50" />
                  <p className="text-white text-sm">
                    {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    {searchTerm ? 'Try a different search term' : 'Start a new conversation to begin!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <Card
                      key={conv._id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        currentConversationId === conv._id
                          ? 'bg-amber-300 border-amber-300 shadow-lg scale-[1.02]'
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-amber-300'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => selectConversation(conv._id)}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentConversationId === conv._id ? 'bg-gray-800' : 'bg-amber-300'
                              }`}>
                                <MessageCircle className={`w-4 h-4 ${
                                  currentConversationId === conv._id ? 'text-amber-400' : 'text-black'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm ${
                                  currentConversationId === conv._id ? 'text-black' : 'text-white'
                                }`}>
                                  Chat {conv._id.split('-')[1] || 'Session'}
                                </h3>
                                <p className={`text-xs ${
                                  currentConversationId === conv._id ? 'text-gray-700' : 'text-gray-300'
                                }`}>
                                  {(conv.updatedAt || conv.createdAt)
                                    ? new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()
                                    : 'Recent'
                                  }
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm truncate ${
                              currentConversationId === conv._id ? 'text-gray-700' : 'text-gray-200'
                            }`}>
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv._id);
                            }}
                            className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                              currentConversationId === conv._id 
                                ? 'hover:bg-red-600 text-red-700 hover:text-red-100' 
                                : 'hover:bg-red-600 text-red-400 hover:text-red-100'
                            }`}
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Enhanced Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {currentConversationId ? (
          <>
            {/* Enhanced Chat Header - Compact */}
            <div className="flex-shrink-0">
              <Card className="rounded-none border-l-0 border-r-0 border-t-0 bg-white border-gray-300 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-300 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">
                          Unmute
                        </CardTitle>
                        <p className="text-xs text-gray-600">Powered by AlleAI • Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-600 h-5 text-xs">
                        Active
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteCurrentChat}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        title="Delete this chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-50 to-white">
              <ScrollArea className="h-full">
                <div className="p-4 max-w-4xl mx-auto space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'ai' && (
                        <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <div
                        className={`max-w-lg px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                          message.role === 'user'
                            ? 'bg-blue-50 text-gray-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {message.message}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-gray-600' : 'text-gray-600'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-amber-300 shadow-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start gap-3">
                      <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Enhanced Message Input - Compact */}
            <div className="flex-shrink-0">
              <Card className="rounded-none border-l-0 border-r-0 border-b-0 bg-white border-gray-300">
                <CardContent className="p-4">
                  <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all duration-200 resize-none shadow-lg min-h-[35px] max-h-[80px] text-sm"
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="px-4 py-2 bg-amber-300 text-black rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold min-h-[35px]"
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <Card className="max-w-md mx-auto bg-white shadow-2xl border-amber-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to Your Chat</h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  Start a new conversation or select an existing one to begin chatting with our AI assistant
                </p>
                <Button
                  onClick={createNewConversation}
                  className="bg-amber-300 text-black px-6 py-2 rounded-lg hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;