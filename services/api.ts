import axios, { AxiosHeaders } from 'axios';
import { BASE_URL, AUTH_TOKEN_KEY } from '@/constants/routes';
import { clearAuthSession } from '@/services/auth';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers = AxiosHeaders.from({
        ...config.headers,
        Authorization: `Bearer ${token}`
      });
    }
  }
  console.debug('API Request:', { url: config.url, method: config.method, baseURL: config.baseURL });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.debug('API Response:', { status: response.status, url: response.config.url });
    return response;
  },
  (error) => {
    // Extract meaningful error message from backend response
    let errorMessage = 'An error occurred';
    
    try {
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.response?.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
    } catch (e) {
      // If any error extraction fails, keep default message
      console.error('Error extracting error message:', e);
    }
    
    // Create a new error with the extracted message
    const customError = new Error(errorMessage);
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      const urlPath = requestUrl.startsWith('http') ? new URL(requestUrl).pathname : requestUrl;
      if (urlPath.startsWith('/auth') || currentPath === '/login') {
        return Promise.reject(customError);
      }
      clearAuthSession();
      window.location.replace('/login');
    }
    return Promise.reject(customError);
  }
);

export default api;
