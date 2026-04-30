import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../services/api';

export const useSubmitReview = (
  orderId: number, 
  storeId: number, 
  clientId: number, 
  onSuccessCb: () => void
) => {
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState({
    rating_quality: 0,
    rating_accuracy: 0,
    rating_packaging: 0,
    rating_value: 0,
    rating_speed: 0,
  });
  const [comment, setComment] = useState('');

  const updateRating = (key: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const isReady = Object.values(ratings).every(val => val > 0);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        order_id: orderId,
        store_id: storeId,
        client_id: clientId,
        ...ratings,
        comment: comment.trim() || null
      };
      return axios.post(`${API_URL}/reviews`, payload);
    },
    onSuccess: () => {
      // Invalidate both unreviewed orders and discovery feed (since ratings changed)
      queryClient.invalidateQueries({ queryKey: ['unreviewed_orders', clientId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      onSuccessCb();
    }
  });

  return { 
    ratings, 
    updateRating, 
    comment, 
    setComment, 
    submitReview: mutation.mutate, 
    isPending: mutation.isPending, 
    isReady 
  };
};
