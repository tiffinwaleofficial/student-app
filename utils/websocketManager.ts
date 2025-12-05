// Simple EventEmitter implementation for React Native compatibility
class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export interface WebSocketMessage {
  type: string;
  channel?: string;
  data?: any;
  timestamp?: number;
}

export interface WebSocketSubscription {
  channel: string;
  callback: (data: any) => void;
  id: string;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
}

class WebSocketManager extends SimpleEventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private heartbeatInterval = 30000; // 30 seconds
  private subscriptions = new Map<string, WebSocketSubscription[]>();
  private state: WebSocketState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  };
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(baseUrl: string) {
    super();
    this.url = baseUrl.replace('http', 'ws') + '/ws';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state.isConnected || this.state.isConnecting) {
        resolve();
        return;
      }

      this.state.isConnecting = true;
      this.state.reconnectAttempts++;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.state.isConnected = true;
          this.state.isConnecting = false;
          this.state.lastConnectedAt = new Date();
          this.state.reconnectAttempts = 0;
          
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.state.isConnected = false;
          this.state.isConnecting = false;
          this.state.lastDisconnectedAt = new Date();
          
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          // Attempt to reconnect if not a manual close
          if (event.code !== 1000 && this.state.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.state.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.state.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.emit('disconnected');
  }

  /**
   * Subscribe to a specific channel
   */
  subscribe(channel: string, callback: (data: any) => void): string {
    const subscriptionId = `${channel}_${Date.now()}_${Math.random()}`;
    const subscription: WebSocketSubscription = {
      channel,
      callback,
      id: subscriptionId,
    };

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }
    
    this.subscriptions.get(channel)!.push(subscription);

    // Send subscription message to server if connected
    if (this.state.isConnected) {
      this.send({
        type: 'subscribe',
        channel,
      });
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(subscriptionId: string): void {
    for (const [channel, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((sub: WebSocketSubscription) => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        
        // If no more subscriptions for this channel, unsubscribe from server
        if (subscriptions.length === 0) {
          this.subscriptions.delete(channel);
          if (this.state.isConnected) {
            this.send({
              type: 'unsubscribe',
              channel,
            });
          }
        }
        break;
      }
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (!this.state.isConnected || !this.ws) {
      console.warn('WebSocket not connected, cannot send message:', message);
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return { ...this.state };
  }

  /**
   * Get list of active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat responses
    if (message.type === 'pong') {
      return;
    }

    // Handle subscription confirmations
    if (message.type === 'subscribed' && message.channel) {
      console.log(`Subscribed to channel: ${message.channel}`);
      return;
    }

    // Handle unsubscription confirmations
    if (message.type === 'unsubscribed' && message.channel) {
      console.log(`Unsubscribed from channel: ${message.channel}`);
      return;
    }

    // Route message to appropriate subscribers
    if (message.channel && this.subscriptions.has(message.channel)) {
      const subscriptions = this.subscriptions.get(message.channel)!;
      subscriptions.forEach(subscription => {
        try {
          subscription.callback(message.data);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      });
    }

    // Emit raw message for global listeners
    this.emit('message', message);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.state.reconnectAttempts), 30000);
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.state.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Reconnect to WebSocket server
   */
  reconnect(): Promise<void> {
    this.disconnect();
    return this.connect();
  }
}

// Create singleton instance
let wsManager: WebSocketManager | null = null;

import { getApiBaseUrl } from './apiConfig';

export const getWebSocketManager = (baseUrl?: string): WebSocketManager => {
  if (!wsManager) {
    const apiBaseUrl = baseUrl || getApiBaseUrl();
    wsManager = new WebSocketManager(apiBaseUrl);
  }
  return wsManager;
};

export default WebSocketManager;








