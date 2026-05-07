import axios from 'axios';
import { API_URL } from './api';

export type ActiveRegions = Record<string, string[]>;

export const fetchActiveRegions = async (): Promise<ActiveRegions> => {
  const response = await axios.get(`${API_URL}/system/regions`);
  return response.data;
};
