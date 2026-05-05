import axios from 'axios';

// Update this to your local machine IP (e.g., http://192.168.1.15:3000/api)
// 'localhost' only works for emulators, use physical IP for testing on real devices.
// const API_URL = 'http://localhost:3000/api';
export const API_URL = 'http://192.168.1.12:3000/api';
export const fetchStoresByLocation = async (wilaya: string, baladia: string) => {
  try {
    const response = await axios.get(`${API_URL}/stores/feed`, {
      params: { wilaya, baladia }
    });
    return response.data;
  } catch (error) {
    console.error("Discovery API Error:", error);
    return []; // Return empty array to prevent UI crash
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("Order Creation Error:", error);
    throw error;
  }
};
