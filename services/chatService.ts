import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineDataManager } from './offlineDataManager';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'admin' | 'restaurant' | 'system';
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'system';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaSize?: number;
  mediaDuration?: number; // For videos
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string; // Message ID being replied to
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  type: 'support' | 'restaurant' | 'group_order';
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationParticipant {
  id: string;
  type: 'user' | 'admin' | 'restaurant';
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MediaUploadResult {
  url: string;
  thumbnail?: string;
  size: number;
  duration?: number;
  publicId: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

class ChatService {
  private cloudinaryConfig: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset: string;
  };

  constructor() {
    this.cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
    };
  }

  /**
   * Upload media to Cloudinary with optimization
   */
  async uploadMedia(
    fileUri: string,
    type: 'image' | 'video',
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    try {
      const formData = new FormData();
      
      // Create file object
      const file = {
        uri: fileUri,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: `chat_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
      } as any;

      formData.append('file', file);
      formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
      formData.append('cloud_name', this.cloudinaryConfig.cloudName);

      // Add optimization parameters
      if (type === 'image') {
        formData.append('transformation', 'q_auto,f_auto,w_auto:breakpoints');
        formData.append('quality', 'auto');
      } else {
        formData.append('transformation', 'q_auto,f_auto');
        formData.append('resource_type', 'video');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      return {
        url: result.secure_url,
        thumbnail: result.thumbnail_url || result.secure_url,
        size: result.bytes,
        duration: result.duration,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw new Error('Failed to upload media');
    }
  }

  /**
   * Optimize image before upload
   */
  async optimizeImage(fileUri: string): Promise<string> {
    // For React Native, we'll use a simple approach
    // In a real implementation, you might want to use react-native-image-resizer
    return fileUri;
  }

  /**
   * Get conversations for user
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${process.env.API_BASE_URL}/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    replyTo?: string
  ): Promise<ChatMessage> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content,
          messageType: 'text',
          replyTo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send a media message
   */
  async sendMediaMessage(
    conversationId: string,
    fileUri: string,
    type: 'image' | 'video',
    replyTo?: string,
    onProgress?: (progress: number) => void
  ): Promise<ChatMessage> {
    try {
      // Upload media first
      const uploadResult = await this.uploadMedia(fileUri, type, onProgress);

      // Send message with media
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: '', // Empty for media messages
          messageType: type,
          mediaUrl: uploadResult.url,
          mediaThumbnail: uploadResult.thumbnail,
          mediaSize: uploadResult.size,
          mediaDuration: uploadResult.duration,
          replyTo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send media message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/messages/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          messageIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    type: 'support' | 'restaurant' | 'group_order',
    participants: string[],
    metadata?: Record<string, unknown>
  ): Promise<Conversation> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          participants,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const token = await this.getAuthToken();
      await fetch(`${process.env.API_BASE_URL}/api/chat/typing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          isTyping,
        }),
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${process.env.API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get conversation with restaurant
   */
  async getRestaurantConversation(restaurantId: string): Promise<Conversation | null> {
    try {
      const conversations = await this.getConversations();
      return conversations.find(conv => 
        conv.type === 'restaurant' && 
        conv.participants.some(p => p.id === restaurantId)
      ) || null;
    } catch (error) {
      console.error('Error getting restaurant conversation:', error);
      return null;
    }
  }

  /**
   * Get support conversation
   */
  async getSupportConversation(): Promise<Conversation | null> {
    try {
      const conversations = await this.getConversations();
      return conversations.find(conv => conv.type === 'support') || null;
    } catch (error) {
      console.error('Error getting support conversation:', error);
      return null;
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    Alert.alert('Chat Error', message, [{ text: 'OK' }]);
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    Alert.alert('Success', message, [{ text: 'OK' }]);
  }

  /**
   * Send message with offline support
   */
  async sendMessageOffline(
    conversationId: string,
    content: string,
    replyTo?: string
  ): Promise<string> {
    try {
      // Queue action for offline execution
      const actionId = await offlineDataManager.queueAction({
        type: 'send_message',
        data: { conversationId, content, replyTo },
        maxRetries: 3,
      });

      // Store message locally for immediate UI update
      const localMessage: ChatMessage = {
        id: `local_${Date.now()}`,
        conversationId,
        senderId: 'current_user',
        senderType: 'user',
        senderName: 'You',
        content,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        status: 'sending',
        replyTo,
      };

      // Store locally
      await this.storeMessageLocally(localMessage);

      return actionId;
    } catch (error) {
      console.error('Error sending message offline:', error);
      throw error;
    }
  }

  /**
   * Delete message with offline support
   */
  async deleteMessageOffline(messageId: string): Promise<string> {
    try {
      // Queue action for offline execution
      const actionId = await offlineDataManager.queueAction({
        type: 'delete_message',
        data: { messageId },
        maxRetries: 3,
      });

      // Mark as deleted locally
      await this.markMessageDeletedLocally(messageId);

      return actionId;
    } catch (error) {
      console.error('Error deleting message offline:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read with offline support
   */
  async markMessagesAsReadOffline(conversationId: string, messageIds: string[]): Promise<string> {
    try {
      // Queue action for offline execution
      const actionId = await offlineDataManager.queueAction({
        type: 'mark_read',
        data: { conversationId, messageIds },
        maxRetries: 3,
      });

      // Mark as read locally
      await this.markMessagesReadLocally(messageIds);

      return actionId;
    } catch (error) {
      console.error('Error marking messages as read offline:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator with offline support
   */
  async sendTypingIndicatorOffline(conversationId: string, isTyping: boolean): Promise<string> {
    try {
      // Queue action for offline execution
      const actionId = await offlineDataManager.queueAction({
        type: 'typing_indicator',
        data: { conversationId, isTyping },
        maxRetries: 2,
      });

      return actionId;
    } catch (error) {
      console.error('Error sending typing indicator offline:', error);
      throw error;
    }
  }

  /**
   * Sync offline data with server
   */
  async syncOfflineData(): Promise<void> {
    try {
      await offlineDataManager.syncPendingActions();
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
  }

  /**
   * Get offline conversations
   */
  async getOfflineConversations(): Promise<Conversation[]> {
    try {
      return await offlineDataManager.getConversationsOffline();
    } catch (error) {
      console.error('Error getting offline conversations:', error);
      return [];
    }
  }

  /**
   * Get offline messages for conversation
   */
  async getOfflineMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      return await offlineDataManager.getMessagesOffline(conversationId);
    } catch (error) {
      console.error('Error getting offline messages:', error);
      return [];
    }
  }

  /**
   * Store message locally
   */
  private async storeMessageLocally(message: ChatMessage): Promise<void> {
    try {
      const existingMessages = await this.getOfflineMessages(message.conversationId);
      const updatedMessages = [...existingMessages, message];
      await offlineDataManager.storeMessagesOffline(message.conversationId, updatedMessages);
    } catch (error) {
      console.error('Error storing message locally:', error);
    }
  }

  /**
   * Mark message as deleted locally
   */
  private async markMessageDeletedLocally(messageId: string): Promise<void> {
    try {
      // This would update the local message status
      // Implementation depends on your local storage structure
      console.log('Message marked as deleted locally:', messageId);
    } catch (error) {
      console.error('Error marking message as deleted locally:', error);
    }
  }

  /**
   * Mark messages as read locally
   */
  private async markMessagesReadLocally(messageIds: string[]): Promise<void> {
    try {
      // This would update the local message status
      // Implementation depends on your local storage structure
      console.log('Messages marked as read locally:', messageIds);
    } catch (error) {
      console.error('Error marking messages as read locally:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return offlineDataManager.getSyncStatus();
  }

  /**
   * Add sync status listener
   */
  addSyncStatusListener(listener: (status: any) => void): void {
    offlineDataManager.addSyncListener(listener);
  }

  /**
   * Remove sync status listener
   */
  removeSyncStatusListener(listener: (status: any) => void): void {
    offlineDataManager.removeSyncListener(listener);
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
