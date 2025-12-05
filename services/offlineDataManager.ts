import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, Conversation } from '../services/chatService';

export interface OfflineAction {
  id: string;
  type: 'send_message' | 'delete_message' | 'mark_read' | 'typing_indicator';
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string;
  pendingActions: number;
  syncInProgress: boolean;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolvedData: any;
  conflictReason: string;
}

class OfflineDataManager {
  private static instance: OfflineDataManager;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private lastSyncTime: string = new Date().toISOString();
  private pendingActions: OfflineAction[] = [];
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  // Storage keys
  private readonly STORAGE_KEYS = {
    PENDING_ACTIONS: 'offline_pending_actions',
    LAST_SYNC_TIME: 'offline_last_sync_time',
    CONVERSATIONS: 'offline_conversations',
    MESSAGES: 'offline_messages',
    SYNC_STATUS: 'offline_sync_status',
  };

  private constructor() {
    this.initializeOfflineManager();
  }

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  private async initializeOfflineManager(): Promise<void> {
    try {
      // Load pending actions from storage
      const storedActions = await AsyncStorage.getItem(this.STORAGE_KEYS.PENDING_ACTIONS);
      if (storedActions) {
        this.pendingActions = JSON.parse(storedActions);
      }

      // Load last sync time
      const storedSyncTime = await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC_TIME);
      if (storedSyncTime) {
        this.lastSyncTime = storedSyncTime;
      }

      // Set up network status monitoring
      this.setupNetworkMonitoring();

      console.log('Offline Data Manager initialized');
    } catch (error) {
      console.error('Error initializing offline manager:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    // Monitor network status
    // In a real implementation, you would use @react-native-netinfo/netinfo
    // For now, we'll simulate network status changes
    
    // Simulate network status changes for testing
    setInterval(() => {
      const wasOnline = this.isOnline;
      this.isOnline = Math.random() > 0.1; // 90% chance of being online
      
      if (!wasOnline && this.isOnline) {
        this.handleNetworkReconnect();
      } else if (wasOnline && !this.isOnline) {
        this.handleNetworkDisconnect();
      }
      
      this.notifySyncListeners();
    }, 10000); // Check every 10 seconds
  }

  private handleNetworkReconnect(): void {
    console.log('Network reconnected, starting sync...');
    this.syncPendingActions();
  }

  private handleNetworkDisconnect(): void {
    console.log('Network disconnected, switching to offline mode');
  }

  // Queue actions for offline execution
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.pendingActions.push(offlineAction);
    await this.savePendingActions();

    // Try to execute immediately if online
    if (this.isOnline) {
      this.executeAction(offlineAction);
    }

    this.notifySyncListeners();
    return offlineAction.id;
  }

  // Execute a single action
  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      let success = false;

      switch (action.type) {
        case 'send_message':
          success = await this.executeSendMessage(action.data);
          break;
        case 'delete_message':
          success = await this.executeDeleteMessage(action.data);
          break;
        case 'mark_read':
          success = await this.executeMarkAsRead(action.data);
          break;
        case 'typing_indicator':
          success = await this.executeTypingIndicator(action.data);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }

      if (success) {
        // Remove successful action from pending list
        this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
        await this.savePendingActions();
        this.updateLastSyncTime();
      } else {
        // Increment retry count
        action.retryCount++;
        if (action.retryCount >= action.maxRetries) {
          // Remove failed action after max retries
          this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
          await this.savePendingActions();
          console.error('Action failed after max retries:', action);
        }
      }

      return success;
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }
  }

  // Execute send message action
  private async executeSendMessage(data: any): Promise<boolean> {
    try {
      // This would call your actual API service
      // const response = await chatService.sendMessage(data.conversationId, data.content, data.replyTo);
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Message sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Execute delete message action
  private async executeDeleteMessage(data: any): Promise<boolean> {
    try {
      // This would call your actual API service
      // const response = await chatService.deleteMessage(data.messageId);
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Message deleted successfully:', data);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Execute mark as read action
  private async executeMarkAsRead(data: any): Promise<boolean> {
    try {
      // This would call your actual API service
      // const response = await chatService.markMessagesAsRead(data.conversationId, data.messageIds);
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Messages marked as read:', data);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Execute typing indicator action
  private async executeTypingIndicator(data: any): Promise<boolean> {
    try {
      // This would call your actual API service
      // const response = await chatService.sendTypingIndicator(data.conversationId, data.isTyping);
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Typing indicator sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }

  // Sync all pending actions
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifySyncListeners();

    try {
      const actionsToSync = [...this.pendingActions];
      
      for (const action of actionsToSync) {
        await this.executeAction(action);
        
        // Add delay between actions to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
      this.notifySyncListeners();
    }
  }

  // Store data locally for offline access
  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  // Retrieve data from local storage
  async getOfflineData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  // Store conversations offline
  async storeConversationsOffline(conversations: Conversation[]): Promise<void> {
    await this.storeOfflineData(this.STORAGE_KEYS.CONVERSATIONS, conversations);
  }

  // Get conversations from offline storage
  async getConversationsOffline(): Promise<Conversation[]> {
    return await this.getOfflineData(this.STORAGE_KEYS.CONVERSATIONS) || [];
  }

  // Store messages offline
  async storeMessagesOffline(conversationId: string, messages: ChatMessage[]): Promise<void> {
    const key = `${this.STORAGE_KEYS.MESSAGES}_${conversationId}`;
    await this.storeOfflineData(key, messages);
  }

  // Get messages from offline storage
  async getMessagesOffline(conversationId: string): Promise<ChatMessage[]> {
    const key = `${this.STORAGE_KEYS.MESSAGES}_${conversationId}`;
    return await this.getOfflineData(key) || [];
  }

  // Conflict resolution
  async resolveConflict(
    localData: any,
    serverData: any,
    strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual' = 'server_wins'
  ): Promise<ConflictResolution> {
    let resolvedData: any;
    let conflictReason = '';

    switch (strategy) {
      case 'server_wins':
        resolvedData = serverData;
        conflictReason = 'Server data takes precedence';
        break;
      case 'client_wins':
        resolvedData = localData;
        conflictReason = 'Client data takes precedence';
        break;
      case 'merge':
        resolvedData = this.mergeData(localData, serverData);
        conflictReason = 'Data merged from both sources';
        break;
      case 'manual':
        // This would trigger a manual resolution UI
        resolvedData = serverData; // Default to server for now
        conflictReason = 'Manual resolution required';
        break;
    }

    return {
      strategy,
      resolvedData,
      conflictReason,
    };
  }

  // Merge data from local and server sources
  private mergeData(localData: any, serverData: any): any {
    // Simple merge strategy - in a real implementation, this would be more sophisticated
    if (Array.isArray(localData) && Array.isArray(serverData)) {
      // Merge arrays, removing duplicates
      const merged = [...localData, ...serverData];
      return merged.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
    } else if (typeof localData === 'object' && typeof serverData === 'object') {
      // Merge objects
      return { ...localData, ...serverData };
    } else {
      // Return server data as default
      return serverData;
    }
  }

  // Save pending actions to storage
  private async savePendingActions(): Promise<void> {
    await this.storeOfflineData(this.STORAGE_KEYS.PENDING_ACTIONS, this.pendingActions);
  }

  // Update last sync time
  private updateLastSyncTime(): void {
    this.lastSyncTime = new Date().toISOString();
    AsyncStorage.setItem(this.STORAGE_KEYS.LAST_SYNC_TIME, this.lastSyncTime);
  }

  // Notify sync listeners
  private notifySyncListeners(): void {
    const status: SyncStatus = {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingActions: this.pendingActions.length,
      syncInProgress: this.syncInProgress,
    };

    this.syncListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error notifying sync listener:', error);
      }
    });
  }

  // Add sync status listener
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  // Remove sync status listener
  removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingActions: this.pendingActions.length,
      syncInProgress: this.syncInProgress,
    };
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.PENDING_ACTIONS,
        this.STORAGE_KEYS.LAST_SYNC_TIME,
        this.STORAGE_KEYS.CONVERSATIONS,
        this.STORAGE_KEYS.MESSAGES,
        this.STORAGE_KEYS.SYNC_STATUS,
      ]);
      
      this.pendingActions = [];
      this.lastSyncTime = new Date().toISOString();
      
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Force sync (for manual trigger)
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingActions();
    }
  }

  // Get pending actions count
  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  // Check if online
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const offlineDataManager = OfflineDataManager.getInstance();
export default offlineDataManager;






















