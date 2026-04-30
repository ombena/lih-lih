import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../services/api';

// Connect to the base URL (remove /api from the end)
const SOCKET_URL = API_URL.replace('/api', '');

export const useOrderSocket = (clientId: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(`📡 Attempting to connect to Socket.io at: ${SOCKET_URL}`);
    const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      socket.emit('join_client_room', clientId);
      console.log(`🔌 Connected to socket & joined client_${clientId}`);
    });

    socket.on('order_status_updated', (data) => {
      console.log('🔄 Order Status Update Received:', data);
      
      // Instantly refresh the active orders list in the background
      queryClient.invalidateQueries({ queryKey: ['active_orders', clientId] });
      
      // Also invalidate specific order details if we are on a detail screen
      queryClient.invalidateQueries({ queryKey: ['order', data.order_id] });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
    };
  }, [clientId, queryClient]);
};
