import { create } from 'zustand';
import { chatService, ChatMessage, Conversation, TypingIndicator } from '../services/chatService';
import { useRealtimeStore } from './realtimeStore';
import { offlineDataManager, SyncStatus } from '../services/offlineDataManager';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  
  // Messages
  messages: Map<string, ChatMessage[]>; // conversationId -> messages
  isLoadingMessages: boolean;
  
  // UI State
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Real-time
  typingIndicators: Map<string, TypingIndicator[]>; // conversationId -> typing users
  onlineUsers: Set<string>;
  
  // Real-time subscriptions
  chatSubscriptions: Map<string, string>; // conversationId -> subscriptionId
  
  // Offline support
  syncStatus: SyncStatus;
  isOfflineMode: boolean;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  
  // Messaging
  sendTextMessage: (conversationId: string, content: string, replyTo?: string) => Promise<void>;
  sendMediaMessage: (conversationId: string, fileUri: string, type: 'image' | 'video', replyTo?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Real-time
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  
  // Real-time updates
  handleNewMessage: (message: ChatMessage) => void;
  handleMessageUpdate: (messageId: string, updates: Partial<ChatMessage>) => void;
  handleTypingIndicator: (indicator: TypingIndicator) => void;
  handleUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  
  // Conversation management
  createSupportConversation: () => Promise<Conversation>;
  createRestaurantConversation: (restaurantId: string) => Promise<Conversation>;
  createGroupOrderConversation: (orderId: string, participants: string[]) => Promise<Conversation>;
  
  // Offline support
  syncOfflineData: () => Promise<void>;
  loadOfflineData: () => Promise<void>;
  getOfflineConversations: () => Promise<Conversation[]>;
  getOfflineMessages: (conversationId: string) => Promise<ChatMessage[]>;
  setOfflineMode: (isOffline: boolean) => void;
  
  // Error handling
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversation: null,
  messages: new Map(),
  isLoadingMessages: false,
  isLoading: false,
  isSending: false,
  error: null,
  typingIndicators: new Map(),
  onlineUsers: new Set(),
  chatSubscriptions: new Map(),
  syncStatus: {
    isOnline: true,
    lastSyncTime: new Date().toISOString(),
    pendingActions: 0,
    syncInProgress: false,
  },
  isOfflineMode: false,
  
  // Fetch conversations
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
        isLoading: false 
      });
    }
  },
  
  // Fetch messages
  fetchMessages: async (conversationId: string, page: number = 1) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const newMessages = await chatService.getMessages(conversationId, page);
      
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        if (page === 1) {
          // Replace messages for first page
          updatedMessages.set(conversationId, newMessages);
        } else {
          // Append messages for subsequent pages
          updatedMessages.set(conversationId, [...newMessages, ...existingMessages]);
        }
        
        return { 
          messages: updatedMessages,
          isLoadingMessages: false 
        };
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        isLoadingMessages: false 
      });
    }
  },
  
  // Set active conversation
  setActiveConversation: (conversation: Conversation | null) => {
    set({ activeConversation: conversation });
    
    // Subscribe to real-time updates for active conversation
    if (conversation) {
      get().subscribeToConversation(conversation.id);
    }
  },
  
  // Send text message
  sendTextMessage: async (conversationId: string, content: string, replyTo?: string) => {
    set({ isSending: true, error: null });
    
    try {
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        conversationId,
        senderId: 'current_user', // This would be the actual user ID
        senderType: 'user',
        senderName: 'You',
        content,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        status: 'sending',
        replyTo,
      };
      
      // Add optimistic message immediately
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        updatedMessages.set(conversationId, [...existingMessages, optimisticMessage]);
        
        return { messages: updatedMessages };
      });
      
      // Send message to server
      const sentMessage = await chatService.sendMessage(conversationId, content, replyTo);
      
      // Replace optimistic message with real message
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        const filteredMessages = existingMessages.filter(msg => msg.id !== optimisticMessage.id);
        updatedMessages.set(conversationId, [...filteredMessages, sentMessage]);
        
        return { 
          messages: updatedMessages,
          isSending: false 
        };
      });
      
      // Update conversation last message
      set(state => {
        const updatedConversations = state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: sentMessage, updatedAt: sentMessage.timestamp }
            : conv
        );
        
        return { conversations: updatedConversations };
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update optimistic message status to failed
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        const updatedMessageList = existingMessages.map(msg =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: 'failed' as const }
            : msg
        );
        
        updatedMessages.set(conversationId, updatedMessageList);
        
        return { 
          messages: updatedMessages,
          error: error instanceof Error ? error.message : 'Failed to send message',
          isSending: false 
        };
      });
    }
  },
  
  // Send media message
  sendMediaMessage: async (
    conversationId: string, 
    fileUri: string, 
    type: 'image' | 'video', 
    replyTo?: string
  ) => {
    set({ isSending: true, error: null });
    
    try {
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        conversationId,
        senderId: 'current_user',
        senderType: 'user',
        senderName: 'You',
        content: '',
        messageType: type,
        mediaUrl: fileUri, // Temporary local URI
        timestamp: new Date().toISOString(),
        status: 'sending',
        replyTo,
      };
      
      // Add optimistic message immediately
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        updatedMessages.set(conversationId, [...existingMessages, optimisticMessage]);
        
        return { messages: updatedMessages };
      });
      
      // Send media message to server
      const sentMessage = await chatService.sendMediaMessage(conversationId, fileUri, type, replyTo);
      
      // Replace optimistic message with real message
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        const filteredMessages = existingMessages.filter(msg => msg.id !== optimisticMessage.id);
        updatedMessages.set(conversationId, [...filteredMessages, sentMessage]);
        
        return { 
          messages: updatedMessages,
          isSending: false 
        };
      });
      
      // Update conversation last message
      set(state => {
        const updatedConversations = state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: sentMessage, updatedAt: sentMessage.timestamp }
            : conv
        );
        
        return { conversations: updatedConversations };
      });
      
    } catch (error) {
      console.error('Error sending media message:', error);
      
      // Update optimistic message status to failed
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        const updatedMessageList = existingMessages.map(msg =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: 'failed' as const }
            : msg
        );
        
        updatedMessages.set(conversationId, updatedMessageList);
        
        return { 
          messages: updatedMessages,
          error: error instanceof Error ? error.message : 'Failed to send media message',
          isSending: false 
        };
      });
    }
  },
  
  // Delete message
  deleteMessage: async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      
      // Remove message from state
      set(state => {
        const updatedMessages = new Map(state.messages);
        
        for (const [conversationId, messages] of updatedMessages.entries()) {
          const filteredMessages = messages.filter(msg => msg.id !== messageId);
          updatedMessages.set(conversationId, filteredMessages);
        }
        
        return { messages: updatedMessages };
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete message'
      });
    }
  },
  
  // Subscribe to conversation real-time updates
  subscribeToConversation: (conversationId: string) => {
    const { chatSubscriptions } = get();
    
    // Don't create duplicate subscriptions
    if (chatSubscriptions.has(conversationId)) {
      return;
    }
    
    const realtimeStore = useRealtimeStore.getState();
    if (realtimeStore.isConnected) {
      const subscriptionId = realtimeStore.subscribe(`chat_${conversationId}`, (data: Record<string, unknown>) => {
        // Handle different types of real-time updates
        if (data.type === 'new_message') {
          get().handleNewMessage(data.message as ChatMessage);
        } else if (data.type === 'message_update') {
          get().handleMessageUpdate(data.messageId as string, data.updates as Partial<ChatMessage>);
        } else if (data.type === 'typing_indicator') {
          get().handleTypingIndicator(data.indicator as TypingIndicator);
        } else if (data.type === 'user_online_status') {
          get().handleUserOnlineStatus(data.userId as string, data.isOnline as boolean);
        }
      });
      
      chatSubscriptions.set(conversationId, subscriptionId);
      set({ chatSubscriptions: new Map(chatSubscriptions) });
    }
  },
  
  // Unsubscribe from conversation
  unsubscribeFromConversation: (conversationId: string) => {
    const { chatSubscriptions } = get();
    const subscriptionId = chatSubscriptions.get(conversationId);
    
    if (subscriptionId) {
      const realtimeStore = useRealtimeStore.getState();
      realtimeStore.unsubscribe(subscriptionId);
      chatSubscriptions.delete(conversationId);
      set({ chatSubscriptions: new Map(chatSubscriptions) });
    }
  },
  
  // Send typing indicator
  sendTypingIndicator: async (conversationId: string, isTyping: boolean) => {
    try {
      await chatService.sendTypingIndicator(conversationId, isTyping);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  },
  
  // Mark messages as read
  markMessagesAsRead: async (conversationId: string, messageIds: string[]) => {
    try {
      await chatService.markMessagesAsRead(conversationId, messageIds);
      
      // Update message status in state
      set(state => {
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = new Map(state.messages);
        
        const updatedMessageList = existingMessages.map(msg =>
          messageIds.includes(msg.id)
            ? { ...msg, status: 'read' as const }
            : msg
        );
        
        updatedMessages.set(conversationId, updatedMessageList);
        
        return { messages: updatedMessages };
      });
      
      // Update conversation unread count
      set(state => {
        const updatedConversations = state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        );
        
        return { conversations: updatedConversations };
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
  
  // Handle new message from real-time
  handleNewMessage: (message: ChatMessage) => {
    set(state => {
      const existingMessages = state.messages.get(message.conversationId) || [];
      const updatedMessages = new Map(state.messages);
      
      // Check if message already exists (avoid duplicates)
      const messageExists = existingMessages.some(msg => msg.id === message.id);
      if (!messageExists) {
        updatedMessages.set(message.conversationId, [...existingMessages, message]);
      }
      
      return { messages: updatedMessages };
    });
    
    // Update conversation last message
    set(state => {
      const updatedConversations = state.conversations.map(conv =>
        conv.id === message.conversationId
          ? { 
              ...conv, 
              lastMessage: message, 
              updatedAt: message.timestamp,
              unreadCount: conv.unreadCount + 1
            }
          : conv
      );
      
      return { conversations: updatedConversations };
    });
  },
  
  // Handle message update from real-time
  handleMessageUpdate: (messageId: string, updates: Partial<ChatMessage>) => {
    set(state => {
      const updatedMessages = new Map(state.messages);
      
      for (const [conversationId, messages] of updatedMessages.entries()) {
        const updatedMessageList = messages.map(msg =>
          msg.id === messageId
            ? { ...msg, ...updates }
            : msg
        );
        updatedMessages.set(conversationId, updatedMessageList);
      }
      
      return { messages: updatedMessages };
    });
  },
  
  // Handle typing indicator from real-time
  handleTypingIndicator: (indicator: TypingIndicator) => {
    set(state => {
      const existingIndicators = state.typingIndicators.get(indicator.conversationId) || [];
      const updatedIndicators = new Map(state.typingIndicators);
      
      if (indicator.isTyping) {
        // Add or update typing indicator
        const filteredIndicators = existingIndicators.filter(ind => ind.userId !== indicator.userId);
        updatedIndicators.set(indicator.conversationId, [...filteredIndicators, indicator]);
      } else {
        // Remove typing indicator
        const filteredIndicators = existingIndicators.filter(ind => ind.userId !== indicator.userId);
        updatedIndicators.set(indicator.conversationId, filteredIndicators);
      }
      
      return { typingIndicators: updatedIndicators };
    });
  },
  
  // Handle user online status
  handleUserOnlineStatus: (userId: string, isOnline: boolean) => {
    set(state => {
      const updatedOnlineUsers = new Set(state.onlineUsers);
      
      if (isOnline) {
        updatedOnlineUsers.add(userId);
      } else {
        updatedOnlineUsers.delete(userId);
      }
      
      return { onlineUsers: updatedOnlineUsers };
    });
  },
  
  // Create support conversation
  createSupportConversation: async () => {
    try {
      const conversation = await chatService.createConversation('support', []);
      
      set(state => ({
        conversations: [conversation, ...state.conversations]
      }));
      
      return conversation;
    } catch (error) {
      console.error('Error creating support conversation:', error);
      throw error;
    }
  },
  
  // Create restaurant conversation
  createRestaurantConversation: async (restaurantId: string) => {
    try {
      const conversation = await chatService.createConversation('restaurant', [restaurantId]);
      
      set(state => ({
        conversations: [conversation, ...state.conversations]
      }));
      
      return conversation;
    } catch (error) {
      console.error('Error creating restaurant conversation:', error);
      throw error;
    }
  },
  
  // Create group order conversation
  createGroupOrderConversation: async (orderId: string, participants: string[]) => {
    try {
      const conversation = await chatService.createConversation('group_order', participants, {
        orderId,
        type: 'group_order'
      });
      
      set(state => ({
        conversations: [conversation, ...state.conversations]
      }));
      
      return conversation;
    } catch (error) {
      console.error('Error creating group order conversation:', error);
      throw error;
    }
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Offline support methods
  syncOfflineData: async () => {
    try {
      await offlineDataManager.syncPendingActions();
      const syncStatus = offlineDataManager.getSyncStatus();
      set({ syncStatus });
    } catch (error) {
      console.error('Error syncing offline data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sync offline data'
      });
    }
  },

  loadOfflineData: async () => {
    try {
      const offlineConversations = await chatService.getOfflineConversations();
      const offlineMessages = new Map<string, ChatMessage[]>();
      
      // Load offline messages for each conversation
      for (const conversation of offlineConversations) {
        const messages = await chatService.getOfflineMessages(conversation.id);
        offlineMessages.set(conversation.id, messages);
      }

      set({ 
        conversations: offlineConversations,
        messages: offlineMessages,
        isOfflineMode: true
      });
    } catch (error) {
      console.error('Error loading offline data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load offline data'
      });
    }
  },

  getOfflineConversations: async () => {
    try {
      return await chatService.getOfflineConversations();
    } catch (error) {
      console.error('Error getting offline conversations:', error);
      return [];
    }
  },

  getOfflineMessages: async (conversationId: string) => {
    try {
      return await chatService.getOfflineMessages(conversationId);
    } catch (error) {
      console.error('Error getting offline messages:', error);
      return [];
    }
  },

  setOfflineMode: (isOffline: boolean) => {
    set({ isOfflineMode: isOffline });
    
    if (isOffline) {
      // Load offline data when switching to offline mode
      get().loadOfflineData();
    } else {
      // Sync data when switching back to online mode
      get().syncOfflineData();
    }
  },
}));
