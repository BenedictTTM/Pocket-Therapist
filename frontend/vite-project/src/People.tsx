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
      <div className="w-1/3 bg-gray-900 border-r border-amber-500 flex flex-col h-screen shadow-xl">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <Card className="rounded-none border-l-0 border-r-0 border-t-0 bg-gray-800 border-amber-500">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-amber-300 font-bold">Your Chats</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500 text-amber-300">
                    {conversations.length} chats
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-300 hover:text-amber-200 hover:bg-gray-700">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* New Conversation Button */}
              <Button
                onClick={createNewConversation}
                className="w-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold py-6 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Conversation
              </Button>
            </CardHeader>
            
            <CardContent className="pt-0 pb-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-300" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-amber-500 text-amber-100 placeholder-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-amber-500/30" />

        {/* Scrollable Conversation List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-amber-300 mx-auto mb-4 opacity-50" />
                  <p className="text-amber-300 text-sm">
                    {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
                  </p>
                  <p className="text-amber-200 text-xs mt-1">
                    {searchTerm ? 'Try a different search term' : 'Start a new conversation to begin!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConversations.map((conv) => (
                    <Card
                      key={conv._id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        currentConversationId === conv._id
                          ? 'bg-amber-500 border-amber-400 shadow-lg scale-[1.02]'
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-amber-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => selectConversation(conv._id)}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                currentConversationId === conv._id ? 'bg-black' : 'bg-amber-500'
                              }`}>
                                <MessageCircle className={`w-5 h-5 ${
                                  currentConversationId === conv._id ? 'text-amber-400' : 'text-black'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm ${
                                  currentConversationId === conv._id ? 'text-black' : 'text-amber-300'
                                }`}>
                                  Chat {conv._id.split('-')[1] || 'Session'}
                                </h3>
                                <p className={`text-xs ${
                                  currentConversationId === conv._id ? 'text-gray-700' : 'text-amber-200'
                                }`}>
                                  {(conv.updatedAt || conv.createdAt)
                                    ? new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()
                                    : 'Recent'
                                  }
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm truncate ${
                              currentConversationId === conv._id ? 'text-gray-700' : 'text-amber-100'
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
                            className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                              currentConversationId === conv._id 
                                ? 'hover:bg-red-600 text-red-700 hover:text-red-100' 
                                : 'hover:bg-red-600 text-red-400 hover:text-red-100'
                            }`}
                            title="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4" />
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
            {/* Enhanced Chat Header */}
            <div className="flex-shrink-0">
              <Card className="rounded-none border-l-0 border-r-0 border-t-0 bg-gray-800 border-amber-500 shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-amber-300">
                          Chat {currentConversationId.split('-')[1] || ''}
                        </CardTitle>
                        <p className="text-sm text-amber-200">Powered by AlleAI • Online</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-400">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-50 to-white">
              <ScrollArea className="h-full">
                <div className="p-6 max-w-4xl mx-auto space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'ai' && (
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot className="w-5 h-5 text-black" />
                        </div>
                      )}
                      <div
                        className={`max-w-lg px-5 py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                          message.role === 'user'
                            ? 'bg-black text-amber-300 border border-amber-500'
                            : 'bg-amber-500 text-black border border-amber-600'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {message.message}
                        </p>
                        <p className={`text-xs mt-3 ${
                          message.role === 'user' ? 'text-amber-200' : 'text-gray-700'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0 border-2 border-amber-500 shadow-lg">
                          <User className="w-5 h-5 text-amber-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start gap-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-black" />
                      </div>
                      <div className="bg-amber-500 px-5 py-4 rounded-2xl shadow-lg border border-amber-600">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Enhanced Message Input */}
            <div className="flex-shrink-0">
              <Card className="rounded-none border-l-0 border-r-0 border-b-0 bg-gray-800 border-amber-500">
                <CardContent className="p-6">
                  <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full px-4 py-3 border-2 border-amber-500 bg-white text-black placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all duration-200 resize-none shadow-lg min-h-[48px] max-h-[120px]"
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
                        className="px-6 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold min-h-[48px]"
                        title="Send message"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <Card className="max-w-md mx-auto bg-white shadow-2xl border-amber-500">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Your Chat</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Start a new conversation or select an existing one to begin chatting with our AI assistant
                </p>
                <Button
                  onClick={createNewConversation}
                  className="bg-amber-500 text-black px-8 py-3 rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
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