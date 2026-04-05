/**
 * Chat Page - Messaging interface
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { chatService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../services/api';
import { format } from 'date-fns';

export const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(bookingId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBooking) {
      loadMessages();
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (!selectedBooking) return;
    const interval = window.setInterval(() => {
      loadMessages();
      loadConversations();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedBooking, user]);

  const loadConversations = async () => {
    if (!user) return;
    const data = await chatService.getConversations(user.id);
    setConversations(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!selectedBooking) return;
    const data = await chatService.getMessages(selectedBooking);
    setMessages(data);
    if (user) {
      await Promise.all(
        data
          .filter((message) => !message.is_read && message.receiver_id === user.id)
          .map((message) => chatService.markAsRead(message.id))
      );
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking || !user) return;

    const conversation = conversations.find((c) => c.booking_id === selectedBooking);
    if (!conversation) return;

    const { error: sendError } = await chatService.sendMessage({
      booking_id: selectedBooking,
      sender_id: user.id,
      receiver_id: conversation.other_user.id,
      content: newMessage,
    });

    if (sendError) {
      setError(sendError.message || 'Could not send message.');
      return;
    }

    setNewMessage('');
    setError('');
    loadMessages();
  };

  const selectedConversation = conversations.find((c) => c.booking_id === selectedBooking);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.booking_id}
                onClick={() => setSelectedBooking(conv.booking_id)}
                className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedBooking === conv.booking_id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {conv.other_user?.profile_image ? (
                    <img
                      src={conv.other_user.profile_image}
                      alt={conv.other_user.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {conv.other_user?.full_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.other_user?.full_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.skill?.title}
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.last_message.content}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                {selectedConversation.other_user?.profile_image ? (
                  <img
                    src={selectedConversation.other_user.profile_image}
                    alt={selectedConversation.other_user.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedConversation.other_user?.full_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.other_user?.full_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedConversation.skill?.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {format(new Date(msg.created_at), 'hh:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
