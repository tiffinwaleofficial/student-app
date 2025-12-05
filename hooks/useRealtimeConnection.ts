import { useEffect } from 'react';
import { useRealtimeStore, initializeRealtimeConnection } from '../store/realtimeStore';

/**
 * Hook to initialize real-time connections
 * This should be used in the main App component or root component
 */
export const useRealtimeConnection = () => {
  const { connect, isConnected, isConnecting } = useRealtimeStore();

  useEffect(() => {
    // Initialize realtime connection
    initializeRealtimeConnection();
  }, []);

  return {
    isConnected,
    isConnecting,
  };
};

/**
 * Hook to manage real-time order tracking
 */
export const useRealtimeOrderTracking = (orderId: string) => {
  const { sendMessage } = useRealtimeStore();

  useEffect(() => {
    if (orderId) {
      // Join order room for real-time updates
      sendMessage('join_order_room', { orderId });
      
      return () => {
        // Leave order room when component unmounts
        sendMessage('leave_order_room', { orderId });
      };
    }
  }, [orderId, sendMessage]);
};

/**
 * Hook to get real-time connection status
 */
export const useRealtimeStatus = () => {
  const { isConnected, isConnecting, connectionState } = useRealtimeStore();
  
  return {
    isConnected,
    isConnecting,
    reconnectAttempts: connectionState.reconnectAttempts,
    lastConnectedAt: connectionState.lastConnectedAt,
    lastDisconnectedAt: connectionState.lastDisconnectedAt,
  };
};

export default useRealtimeConnection;














