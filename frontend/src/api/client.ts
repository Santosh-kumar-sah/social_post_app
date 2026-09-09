import axios from 'axios';
import { storage } from '../utils/storage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if JWT token is stored in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if request was on login/signup endpoints
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        storage.clearAuth();
      }
    }
    return Promise.reject(error);
  }
);
