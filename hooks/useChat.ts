import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { Conversation, ChatMessage } from '../services/chatService';

export const useChat = () => {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    isLoadingMessages,
    error,
    typingIndicators,
    onlineUsers,
    
    // Actions
    fetchConversations,
    fetchMessages,
    setActiveConversation,
    sendTextMessage,
    sendMediaMessage,
    deleteMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    createSupportConversation,
    createRestaurantConversation,
    createGroupOrderConversation,
    clearError,
  } = useChatStore();

  // Auto-fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Get messages for active conversation
  const getActiveMessages = useCallback((): ChatMessage[] => {
    if (!activeConversation) return [];
    return messages.get(activeConversation.id) || [];
  }, [activeConversation, messages]);

  // Get typing users for active conversation
  const getActiveTypingUsers = useCallback(() => {
    if (!activeConversation) return [];
    return typingIndicators.get(activeConversation.id) || [];
  }, [activeConversation, typingIndicators]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Send text message
  const handleSendTextMessage = useCallback(async (
    conversationId: string,
    content: string,
    replyTo?: string
  ) => {
    try {
      await sendTextMessage(conversationId, content, replyTo);
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }, [sendTextMessage]);

  // Send media message
  const handleSendMediaMessage = useCallback(async (
    conversationId: string,
    fileUri: string,
    type: 'image' | 'video',
    replyTo?: string
  ) => {
    try {
      await sendMediaMessage(conversationId, fileUri, type, replyTo);
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }, [sendMediaMessage]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    
    // Fetch messages if not already loaded
    const existingMessages = messages.get(conversation.id);
    if (!existingMessages || existingMessages.length === 0) {
      fetchMessages(conversation.id);
    }
  }, [setActiveConversation, messages, fetchMessages]);

  // Handle typing indicator
  const handleTypingIndicator = useCallback(async (
    conversationId: string,
    isTyping: boolean
  ) => {
    try {
      await sendTypingIndicator(conversationId, isTyping);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [sendTypingIndicator]);

  // Mark messages as read
  const handleMarkMessagesAsRead = useCallback(async (
    conversationId: string,
    messageIds: string[]
  ) => {
    try {
      await markMessagesAsRead(conversationId, messageIds);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [markMessagesAsRead]);

  // Create support conversation
  const handleCreateSupportConversation = useCallback(async (): Promise<Conversation> => {
    try {
      return await createSupportConversation();
    } catch (error) {
      console.error('Error creating support conversation:', error);
      throw error;
    }
  }, [createSupportConversation]);

  // Create restaurant conversation
  const handleCreateRestaurantConversation = useCallback(async (
    restaurantId: string
  ): Promise<Conversation> => {
    try {
      return await createRestaurantConversation(restaurantId);
    } catch (error) {
      console.error('Error creating restaurant conversation:', error);
      throw error;
    }
  }, [createRestaurantConversation]);

  // Create group order conversation
  const handleCreateGroupOrderConversation = useCallback(async (
    orderId: string,
    participants: string[]
  ): Promise<Conversation> => {
    try {
      return await createGroupOrderConversation(orderId, participants);
    } catch (error) {
      console.error('Error creating group order conversation:', error);
      throw error;
    }
  }, [createGroupOrderConversation]);

  // Get conversation by type
  const getConversationByType = useCallback((
    type: 'support' | 'restaurant' | 'group_order',
    filterId?: string
  ): Conversation | null => {
    return conversations.find(conv => {
      if (conv.type !== type) return false;
      
      if (type === 'restaurant' && filterId) {
        return conv.participants.some(p => p.id === filterId && p.type === 'restaurant');
      }
      
      if (type === 'group_order' && filterId) {
        return conv.metadata?.orderId === filterId;
      }
      
      return true;
    }) || null;
  }, [conversations]);

  // Get unread count for all conversations
  const getTotalUnreadCount = useCallback((): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }, [conversations]);

  // Get conversations by type
  const getConversationsByType = useCallback((
    type: 'support' | 'restaurant' | 'group_order'
  ): Conversation[] => {
    return conversations.filter(conv => conv.type === type);
  }, [conversations]);

  // Check if conversation exists
  const conversationExists = useCallback((
    type: 'support' | 'restaurant' | 'group_order',
    filterId?: string
  ): boolean => {
    return getConversationByType(type, filterId) !== null;
  }, [getConversationByType]);

  // Get conversation title
  const getConversationTitle = useCallback((conversation: Conversation): string => {
    switch (conversation.type) {
      case 'support':
        return 'Customer Support';
      case 'restaurant':
        return conversation.participants.find(p => p.type === 'restaurant')?.name || 'Restaurant';
      case 'group_order':
        return `Group Order - ${conversation.metadata?.orderId || 'Unknown'}`;
      default:
        return 'Chat';
    }
  }, []);

  // Get conversation subtitle
  const getConversationSubtitle = useCallback((conversation: Conversation): string => {
    if (conversation.lastMessage) {
      const { content, messageType, senderName } = conversation.lastMessage;
      
      if (messageType === 'text') {
        return `${senderName}: ${content}`;
      } else if (messageType === 'image') {
        return `${senderName}: 📷 Image`;
      } else if (messageType === 'video') {
        return `${senderName}: 🎥 Video`;
      } else if (messageType === 'file') {
        return `${senderName}: 📄 File`;
      }
    }
    
    return 'No messages yet';
  }, []);

  // Format message time
  const formatMessageTime = useCallback((timestamp: string): string => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  return {
    // State
    conversations,
    activeConversation,
    messages: getActiveMessages(),
    isLoading,
    isSending,
    isLoadingMessages,
    error,
    typingUsers: getActiveTypingUsers(),
    onlineUsers,
    totalUnreadCount: getTotalUnreadCount(),
    
    // Actions
    handleSendTextMessage,
    handleSendMediaMessage,
    handleSelectConversation,
    handleTypingIndicator,
    handleMarkMessagesAsRead,
    handleCreateSupportConversation,
    handleCreateRestaurantConversation,
    handleCreateGroupOrderConversation,
    clearError,
    
    // Utilities
    getConversationByType,
    getConversationsByType,
    conversationExists,
    getConversationTitle,
    getConversationSubtitle,
    formatMessageTime,
    isUserOnline,
  };
};

export default useChat;






















