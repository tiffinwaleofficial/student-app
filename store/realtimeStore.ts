import { create } from 'zustand';
import { nativeWebSocketService } from '../services/nativeWebSocketService';

interface RealtimeData {
  [key: string]: unknown;
}

interface PendingSyncAction {
  type: string;
  data?: RealtimeData;
}

interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  lastSyncTime: Date | null;
  pendingSync: PendingSyncAction[];
  subscriptions: Map<string, string>; // channel -> subscriptionId
  connectionState: {
    reconnectAttempts: number;
    lastConnectedAt: Date | null;
    lastDisconnectedAt: Date | null;
  };
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  subscribe: (channel: string, callback: (data: RealtimeData) => void) => string;
  unsubscribe: (subscriptionId: string) => void;
  sendMessage: (type: string, data?: any) => void;
  syncAllStores: () => Promise<void>;
  handleRealtimeUpdate: (channel: string, data: RealtimeData) => void;
  addPendingSync: (action: PendingSyncAction) => void;
  processPendingSync: () => Promise<void>;
  clearError: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  lastSyncTime: null,
  pendingSync: [],
  subscriptions: new Map(),
  connectionState: {
    reconnectAttempts: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  },

  connect: async () => {
    const state = get();
    if (state.isConnected || state.isConnecting) {
      console.log('🔌 Already connected or connecting to WebSocket');
      return;
    }

    set({ isConnecting: true });
    
    try {
      console.log('🔌 Connecting to native WebSocket service...');
      await nativeWebSocketService.connect();
      
      set({ 
        isConnected: true, 
        isConnecting: false,
        connectionState: {
          ...state.connectionState,
          lastConnectedAt: new Date(),
          reconnectAttempts: 0,
        }
      });
      
      console.log('✅ Connected to native WebSocket service');
      
      // Process any pending sync actions
      get().processPendingSync();
      
    } catch (error) {
      console.error('❌ Failed to connect to native WebSocket service:', error);
      set({ 
        isConnected: false, 
        isConnecting: false,
        connectionState: {
          ...state.connectionState,
          lastDisconnectedAt: new Date(),
          reconnectAttempts: state.connectionState.reconnectAttempts + 1,
        }
      });
    }
  },

  disconnect: () => {
    console.log('🔌 Disconnecting from native WebSocket service...');
    nativeWebSocketService.disconnect();
    
    set({ 
      isConnected: false, 
      isConnecting: false,
      connectionState: {
        ...get().connectionState,
        lastDisconnectedAt: new Date(),
      }
    });
    
    console.log('✅ Disconnected from native WebSocket service');
  },

  reconnect: async () => {
    console.log('🔄 Reconnecting to native WebSocket service...');
    get().disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await get().connect();
  },

  subscribe: (channel: string, callback: (data: RealtimeData) => void) => {
    const subscriptionId = `${channel}_${Date.now()}_${Math.random()}`;
    const subscriptions = new Map(get().subscriptions);
    subscriptions.set(channel, subscriptionId);
    
    set({ subscriptions });
    
    // Set up event listener for this channel
    if (typeof window !== 'undefined') {
      const eventHandler = (event: CustomEvent) => {
        if (event.detail.channel === channel) {
          callback(event.detail.data);
        }
      };
      
      window.addEventListener('realtimeUpdate', eventHandler as EventListener);
      
      // Store cleanup function
      (window as any)[`cleanup_${subscriptionId}`] = () => {
        window.removeEventListener('realtimeUpdate', eventHandler as EventListener);
      };
    }
    
    console.log(`📡 Subscribed to channel: ${channel}`);
    return subscriptionId;
  },

  unsubscribe: (subscriptionId: string) => {
    const subscriptions = new Map(get().subscriptions);
    
    // Find and remove the subscription
    for (const [channel, id] of subscriptions.entries()) {
      if (id === subscriptionId) {
        subscriptions.delete(channel);
        
        // Clean up event listener
        if (typeof window !== 'undefined' && (window as any)[`cleanup_${subscriptionId}`]) {
          (window as any)[`cleanup_${subscriptionId}`]();
          delete (window as any)[`cleanup_${subscriptionId}`];
        }
        
        console.log(`📡 Unsubscribed from channel with ID: ${subscriptionId}`);
        break;
      }
    }
    
    set({ subscriptions });
  },

  sendMessage: (type: string, data?: any) => {
    const state = get();
    
    if (!state.isConnected) {
      // Queue message for when connected
      get().addPendingSync({ type, data });
      console.log('📤 Message queued (not connected):', type);
      return;
    }

    try {
      nativeWebSocketService.sendMessage(type, data);
      console.log('📤 Message sent:', type);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Queue the message for retry
      get().addPendingSync({ type, data });
    }
  },
  
  syncAllStores: async () => {
    const state = get();
    
    if (!state.isConnected) {
      console.warn('Cannot sync stores: WebSocket not connected');
      return;
    }
    
    try {
      // Trigger sync for all connected stores
      get().sendMessage('sync_request', { timestamp: Date.now() });
      set({ lastSyncTime: new Date() });
      console.log('🔄 Store sync requested');
    } catch (error) {
      console.error('Error syncing stores:', error);
    }
  },
  
  handleRealtimeUpdate: (channel: string, data: RealtimeData) => {
    // This will be used by individual stores to handle their specific updates
    console.log(`📨 Realtime update received for channel ${channel}:`, data);
    
    // Emit a custom event that stores can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtimeUpdate', {
        detail: { channel, data }
      }));
    }
  },
  
  addPendingSync: (action: PendingSyncAction) => {
    set(state => ({
      pendingSync: [...state.pendingSync, action]
    }));
  },
  
  processPendingSync: async () => {
    const { pendingSync } = get();
    if (pendingSync.length === 0) return;
    
    console.log(`📤 Processing ${pendingSync.length} queued messages`);
    
    const messages = [...pendingSync];
    set({ pendingSync: [] });
    
    messages.forEach(action => {
      try {
        get().sendMessage(action.type, action.data);
      } catch (error) {
        console.error('❌ Failed to send queued message:', error);
        // Re-queue failed messages
        get().addPendingSync(action);
      }
    });
  },
  
  clearError: () => {
    // Reset connection state if needed
    console.log('🧹 Clearing realtime store errors');
  },
}));

// Export helper functions for easier usage
export const realtimeActions = {
  connect: () => useRealtimeStore.getState().connect(),
  disconnect: () => useRealtimeStore.getState().disconnect(),
  reconnect: () => useRealtimeStore.getState().reconnect(),
  subscribe: (channel: string, callback: (data: RealtimeData) => void) => 
    useRealtimeStore.getState().subscribe(channel, callback),
  unsubscribe: (subscriptionId: string) => 
    useRealtimeStore.getState().unsubscribe(subscriptionId),
  sendMessage: (type: string, data?: any) => 
    useRealtimeStore.getState().sendMessage(type, data),
  syncAllStores: () => useRealtimeStore.getState().syncAllStores(),
};

// Auto-connect when store is first used
let autoConnectInitialized = false;

export const initializeRealtimeConnection = async () => {
  if (autoConnectInitialized) return;
  autoConnectInitialized = true;
  
  console.log('🚀 Initializing realtime connection...');
  
  // Wait a bit for auth to be ready
  setTimeout(async () => {
    try {
      await useRealtimeStore.getState().connect();
    } catch (error) {
      console.error('❌ Failed to auto-connect realtime service:', error);
    }
  }, 2000);
};