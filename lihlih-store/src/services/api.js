import axios from "axios";

// Update this to your server's IP when deploying to Octenium
const API_URL = "http://localhost:3000/api";

/**
 * Centralized API service for the Store Dashboard
 */
export const storeAPI = {
  // Phase 5.1: Accept an order (Moves status from Pending -> Preparing)
  acceptOrder: async (orderId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/store-accept`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to accept order:", error);
      throw error;
    }
  },

  // Phase 5.1: Reject an order (Out of stock, etc.)
  rejectOrder: async (orderId, reason = "Out of stock") => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/store-reject`,
        { reason },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reject order:", error);
      throw error;
    }
  },

  // (Upcoming) Fetch active orders for the Kanban board on page load
  getActiveOrders: async (storeId) => {
    const response = await axios.get(
      `${API_URL}/stores/${storeId}/active-orders`,
    );
    return response.data;
  },

  // (Upcoming) Toggle menu item availability from the Stock Switchboard
  toggleItemAvailability: async (itemId) => {
    const response = await axios.patch(
      `${API_URL}/items/${itemId}/toggle-availability`,
    );
    return response.data;
  },
  // Phase 5.1: Reject an order
  rejectOrder: async (orderId, reason = "Out of stock") => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/store-reject`,
        { reason },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reject order:", error);
      throw error;
    }
  },

  // NEW: Phase 5.2 - Tell the database the food is cooked
  markOrderReady: async (orderId) => {
    try {
      const response = await axios.patch(`${API_URL}/orders/${orderId}/ready`);
      return response.data;
    } catch (error) {
      console.error("Failed to mark order as ready:", error);
      throw error;
    }
  },
};
