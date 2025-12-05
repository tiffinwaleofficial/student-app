import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { Conversation } from '../services/chatService';
import { useNotification } from '../hooks/useNotification';

interface ChatListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onCreateSupportChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectConversation, onCreateSupportChat }) => {
  const { t } = useTranslation('common');
  const {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createSupportConversation,
    createRestaurantConversation,
    onlineUsers,
    clearError,
  } = useChatStore();

  const { showError } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError, showError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleCreateSupportChat = async () => {
    try {
      const conversation = await createSupportConversation();
      onSelectConversation(conversation);
    } catch (error) {
      console.error('Error creating support chat:', error);
      showError(t('failedToCreateSupportChat'));
    }
  };

  const handleCreateRestaurantChat = async (restaurantId: string) => {
    try {
      const conversation = await createRestaurantConversation(restaurantId);
      onSelectConversation(conversation);
    } catch (error) {
      console.error('Error creating restaurant chat:', error);
      showError(t('failedToCreateRestaurantChat'));
    }
  };

  const getConversationTitle = (conversation: Conversation): string => {
    switch (conversation.type) {
      case 'support':
        return t('customerSupport');
      case 'restaurant':
        return conversation.participants.find(p => p.type === 'restaurant')?.name || t('restaurant');
      case 'group_order':
        return `${t('groupOrder')} - ${conversation.metadata?.orderId || t('unknown')}`;
      default:
        return t('chat');
    }
  };

  const getConversationSubtitle = (conversation: Conversation): string => {
    if (conversation.lastMessage) {
      const { content, messageType, senderName } = conversation.lastMessage;
      
      if (messageType === 'text') {
        return `${senderName}: ${content}`;
      } else if (messageType === 'image') {
        return `${senderName}: ${t('image')}`;
      } else if (messageType === 'video') {
        return `${senderName}: ${t('video')}`;
      } else if (messageType === 'file') {
        return `${senderName}: ${t('file')}`;
      }
    }
    
    return t('noMessagesYet');
  };

  const getConversationIcon = (conversation: Conversation): string => {
    switch (conversation.type) {
      case 'support':
        return '🎧';
      case 'restaurant':
        return '🍽️';
      case 'group_order':
        return '👥';
      default:
        return '💬';
    }
  };

  const formatLastMessageTime = (timestamp: string): string => {
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
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isOnline = item.participants.some(p => onlineUsers.has(p.id));
    const hasUnreadMessages = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnreadMessages && styles.unreadConversation]}
        onPress={() => onSelectConversation(item)}
      >
        <View style={styles.conversationIcon}>
          <Text style={styles.conversationIconText}>{getConversationIcon(item)}</Text>
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationTitle, hasUnreadMessages && styles.unreadTitle]}>
              {getConversationTitle(item)}
            </Text>
            <Text style={styles.conversationTime}>
              {item.lastMessage ? formatLastMessageTime(item.lastMessage.timestamp) : ''}
            </Text>
          </View>
          
          <Text style={[styles.conversationSubtitle, hasUnreadMessages && styles.unreadSubtitle]}>
            {getConversationSubtitle(item)}
          </Text>
          
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>{t('noConversations')}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {t('startConversationWithSupport')}
      </Text>
      <TouchableOpacity style={styles.startChatButton} onPress={handleCreateSupportChat}>
        <Text style={styles.startChatButtonText}>{t('startSupportChat')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('messages')}</Text>
      <TouchableOpacity style={styles.newChatButton} onPress={handleCreateSupportChat}>
        <Text style={styles.newChatButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadConversation: {
    backgroundColor: '#F8F9FF',
  },
  conversationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  conversationIconText: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
    position: 'relative',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  unreadSubtitle: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  startChatButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ChatList;













