import axios from 'axios';//correct
import { auth } from '../../core/config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const receiptApi = {
  uploadReceipt: async (formData) => {
    return api.post('/receipts', formData);
  },
  getReceipts: async (filters) => {
    return api.get('/receipts', { params: filters });
  },
  getReceiptById: async (id) => {
    return api.get(`/receipts/${id}`);
  }
};

export const categoryApi = {
  getCategories: async () => {
    return api.get('/categories');
  },
  createCategory: async (data) => {
    return api.post('/categories', data);
  }
};
export default api;