import axios from 'axios';
import { getStoredAuth, removeStoredAuth } from '@/utils/storage';
import { refreshToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const auth = getStoredAuth();
        if (auth?.refreshToken) {
          const { access } = await refreshToken(auth.refreshToken);
          const newAuth = { ...auth, token: access };
          localStorage.setItem('auth', JSON.stringify(newAuth));
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        removeStoredAuth();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;