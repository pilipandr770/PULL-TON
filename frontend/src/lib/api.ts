import axios from 'axios';
import { useAuthStore, useAdminStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API with separate token
export const adminApi = axios.create({
  baseURL: '/api/admin',
});

adminApi.interceptors.request.use((config) => {
  const token = useAdminStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  getNonce: () => api.get('/auth/nonce'),
  verify: (address: string, proof?: any) => 
    api.post('/auth/verify', { address, proof }),
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),
};

// Pool API
export const poolApi = {
  getInfo: () => api.get('/pool/info'),
  getPosition: (address: string) => api.get(`/pool/position/${address}`),
  getDepositInfo: () => api.get('/pool/deposit-info'),
  getWithdrawInfo: () => api.get('/pool/withdraw-info'),
};

// User API
export const userApi = {
  getMe: () => api.get('/user/me'),
  getTransactions: (page = 1) => api.get(`/user/transactions?page=${page}`),
  getDashboard: () => api.get('/user/dashboard'),
};

// Subscription API
export const subscriptionApi = {
  getStatus: () => api.get('/subscription/status'),
  createCheckout: () => api.post('/subscription/checkout'),
  createPortal: () => api.post('/subscription/portal'),
  getPricing: () => api.get('/subscription/pricing'),
};

// Admin API functions
export const adminApiFunc = {
  getStats: () => adminApi.get('/stats'),
  getUsers: (page = 1, search?: string) => 
    adminApi.get(`/users?page=${page}${search ? `&search=${search}` : ''}`),
  getUser: (id: string) => adminApi.get(`/users/${id}`),
  getSubscriptions: (status?: string, page = 1) =>
    adminApi.get(`/subscriptions?page=${page}${status ? `&status=${status}` : ''}`),
};

export default api;
