/**
 * TiffinWale Native WebSocket Service
 * Universal WebSocket implementation using React Native's native WebSocket API
 * 
 * Features:
 * - Works on all platforms (Web, iOS, Android, Expo Go)
 * - No external dependencies
 * - Automatic reconnection
 * - Message queuing during offline
 * - Integration with notification system
 */

import { notificationService } from './notificationService';
import { useAuthStore } from '../store/authStore';
import { API_CONFIG } from '../utils/apiConfig';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export interface WebSocketNotification {
  id: string;
  type: 'toast' | 'modal' | 'banner';
  variant: 'success' | 'error' | 'warning' | 'info' | 'order' | 'promotion';
  category: 'order' | 'promotion' | 'system' | 'chat' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface OrderUpdate {
  orderId: string;
  status: string;
  estimatedTime?: string;
  partnerId?: string;
  timestamp: Date;
}

type EventHandler = (data: any) => void;

class NativeWebSocketService {
  private static instance: NativeWebSocketService;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private currentOrderId: string | null = null;
  private reconnectTimer: any = null;
  private heartbeatInterval: any = null;
  private eventListeners: Map<string, Set<EventHandler>> = new Map();

  private constructor() {
    console.log('🔌 Native WebSocket service initialized');
  }

  public static getInstance(): NativeWebSocketService {
    if (!NativeWebSocketService.instance) {
      NativeWebSocketService.instance = new NativeWebSocketService();
    }
    return NativeWebSocketService.instance;
  }

  /**
   * Initialize WebSocket connection
   * Note: WebSocket is currently disabled for mobile platforms to prevent 404 errors
   */
  public async initialize(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.token;

      if (!token) {
        if (__DEV__) console.log('⚠️ No auth token available - WebSocket will connect after login');
        return;
      }

      // Temporarily disable WebSocket auto-connection for mobile platforms
      // TODO: Enable when backend WebSocket endpoint is ready
      if (__DEV__) console.log('ℹ️ WebSocket auto-connection disabled for mobile platforms');
      return;

      // await this.connect();
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Connect to WebSocket server using native WebSocket API
   * Note: Currently disabled for mobile platforms
   */
  public async connect(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.token;

      if (!token) {
        if (__DEV__) console.log('⚠️ No auth token available for WebSocket connection');
        return;
      }

      // Temporarily disable WebSocket for mobile platforms to prevent 404 errors
      if (__DEV__) console.log('ℹ️ WebSocket connection disabled - waiting for backend support');
      return;

      // Disconnect existing connection
      if (this.socket) {
        this.disconnect();
      }

      // Use the dedicated native WebSocket URL
      let wsUrl = API_CONFIG.NATIVE_WS_URL;
      if (wsUrl.startsWith('http://')) {
        wsUrl = wsUrl.replace('http://', 'ws://');
      } else if (wsUrl.startsWith('https://')) {
        wsUrl = wsUrl.replace('https://', 'wss://');
      }

      // Add auth token as query parameter (token is guaranteed to be string here)
      wsUrl += `?token=${encodeURIComponent(token as string)}`;
      
      if (__DEV__) console.log('🔌 Connecting to native WebSocket:', wsUrl);

      // Create native WebSocket connection
      this.socket = new WebSocket(wsUrl);

      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection opened
    this.socket.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      if (__DEV__) console.log('✅ WebSocket connected');
      
      // Process queued messages
      this.processMessageQueue();
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Join current order room if tracking an order
      if (this.currentOrderId) {
        this.joinOrderRoom(this.currentOrderId);
      }
    };

    // Message received
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        if (__DEV__) console.error('❌ Failed to parse WebSocket message:', error);
      }
    };

    // Connection closed
    this.socket.onclose = (event) => {
      this.isConnected = false;
      this.stopHeartbeat();
      if (__DEV__) console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      
      // Don't reconnect on 404 errors (endpoint not available)
      if (event.code === 1006 && event.reason?.includes('404')) {
        if (__DEV__) console.log('⚠️ WebSocket endpoint not available - skipping reconnection');
        return;
      }
      
      // Auto-reconnect unless it was a clean close
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    // Connection error
    this.socket.onerror = (error) => {
      if (__DEV__) console.error('❌ WebSocket error:', error);
      this.isConnected = false;
      this.stopHeartbeat();
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any): void {
    if (__DEV__) console.log('📨 WebSocket message received:', message.type);

    switch (message.type) {
      case 'notification':
        this.handleNotification(message.data);
        break;
      case 'order_update':
        this.handleOrderUpdate(message.data);
        break;
      case 'chat_message':
        this.handleChatMessage(message.data);
        break;
      case 'pong':
        // Heartbeat response - connection is alive
        break;
      default:
        if (__DEV__) console.log('📨 Unknown message type:', message.type);
    }
  }

  /**
   * Handle notification messages
   */
  private handleNotification(data: WebSocketNotification): void {
    if (__DEV__) console.log('🔔 Received notification:', data.title);
    
    // Emit event to subscribers
    this.emit('notification', data);
    
    // Show notification using notification service
    notificationService.show({
      id: data.id,
      type: data.type,
      variant: data.variant,
      title: data.title,
      message: data.message,
      category: data.category,
      data: data.data,
      timestamp: new Date(data.timestamp),
    });
  }

  /**
   * Handle order update messages
   */
  private handleOrderUpdate(data: OrderUpdate): void {
    if (__DEV__) console.log('📦 Order update received:', data.orderId, data.status);
    
    // Emit event to subscribers
    this.emit('order_update', data);
    
    // Show order update notification
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup/delivery',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const message = statusMessages[data.status as keyof typeof statusMessages] || `Order status: ${data.status}`;

    notificationService.show({
      id: `order_${data.orderId}_${Date.now()}`,
      type: 'toast',
      variant: data.status === 'cancelled' ? 'error' : 'success',
      title: 'Order Update',
      message,
      category: 'order',
      data: { orderId: data.orderId, status: data.status },
      timestamp: new Date(data.timestamp),
    });
  }

  /**
   * Handle chat messages
   */
  private handleChatMessage(data: any): void {
    if (__DEV__) console.log('💬 Chat message received:', data);
    // Emit event to subscribers
    this.emit('chat_message', data);
  }

  /**
   * Send message to WebSocket server
   */
  public sendMessage(type: string, data?: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    if (!this.socket || !this.isConnected) {
      // Queue the message for when connected
      this.messageQueue.push(message);
      if (__DEV__) console.log('📤 Message queued (not connected):', type);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
      if (__DEV__) console.log('📤 Message sent:', type);
    } catch (error) {
      if (__DEV__) console.error('❌ Failed to send message:', error);
      // Queue the message for retry
      this.messageQueue.push(message);
    }
  }

  /**
   * Join order room for real-time updates
   */
  public joinOrderRoom(orderId: string): void {
    this.currentOrderId = orderId;
    this.sendMessage('join_order_room', { orderId });
  }

  /**
   * Leave order room (with optional orderId parameter for compatibility)
   */
  public leaveOrderRoom(orderId?: string): void {
    const idToLeave = orderId || this.currentOrderId;
    if (idToLeave) {
      this.sendMessage('leave_order_room', { orderId: idToLeave });
      if (orderId === this.currentOrderId || !orderId) {
      this.currentOrderId = null;
      }
    }
  }

  /**
   * Mark notification as read
   */
  public markNotificationRead(notificationId: string): void {
    this.sendMessage('mark_notification_read', { notificationId });
  }

  /**
   * Send message to partner (for chat)
   */
  public sendMessageToPartner(partnerId: string, message: string, orderId?: string): void {
    this.sendMessage('send_message_to_partner', { partnerId, message, orderId });
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    if (__DEV__) console.log(`📤 Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach(message => {
      try {
        this.socket?.send(JSON.stringify(message));
      } catch (error) {
        if (__DEV__) console.error('❌ Failed to send queued message:', error);
        // Re-queue failed messages
        this.messageQueue.push(message);
      }
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.sendMessage('ping');
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (__DEV__) console.log('❌ Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    if (__DEV__) console.log(`🔄 Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Update user authentication
   */
  public updateAuth(token: string): void {
    if (__DEV__) console.log('🔐 Updating WebSocket authentication');
    // Reconnect with new token (currently disabled)
    // this.connect();
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.currentOrderId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Get connection status
   */
  public getStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Subscribe to an event
   */
  public on(event: string, handler: EventHandler): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, handler: EventHandler): void {
    this.eventListeners.get(event)?.delete(handler);
  }

  /**
   * Emit an event to all subscribers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          if (__DEV__) console.error(`❌ Error in event handler for ${event}:`, error);
        }
      });
    }
  }

}

// Export singleton instance
export const nativeWebSocketService = NativeWebSocketService.getInstance();
export default nativeWebSocketService;
