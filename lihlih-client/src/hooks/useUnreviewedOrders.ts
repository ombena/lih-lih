import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../services/api';

export const useUnreviewedOrders = (clientId: number) => {
  return useQuery({
    queryKey: ['unreviewed_orders', clientId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/orders/client/${clientId}/unreviewed`);
      return response.data;
    },
    enabled: !!clientId,
    refetchOnWindowFocus: true, // Check for new delivered orders when app comes back to focus
  });
};
