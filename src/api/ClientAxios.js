import axios from 'axios';
import { toast } from 'react-toastify';

const envApiUrl = import.meta.env.VITE_API_URL?.trim() || '';
const isPlaceholderApiUrl = /your-backend-cloud-url\.onrender\.com/i.test(envApiUrl);
const browserHost = typeof window !== 'undefined' ? window.location.hostname : '';
const isVercelHost = /(?:^|\.)vercel\.app$/i.test(browserHost);
const isRenderApiUrl = /onrender\.com/i.test(envApiUrl);

// On Vercel, prefer same-origin '/api' so requests go through vercel.json rewrites.
const shouldUseRelativeApi = isVercelHost && isRenderApiUrl;

const resolvedBaseURL = shouldUseRelativeApi || isPlaceholderApiUrl
  ? ''
  : envApiUrl.replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (for Render cold starts)
});

// ===== REQUEST INTERCEPTOR =====
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add retry count to config
  config.retryCount = config.retryCount || 0;
  
  return config;
});

// ===== RESPONSE INTERCEPTOR =====
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 - Banned user
    if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Tài khoản của bạn đã bị khóa!';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error(message);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      return Promise.reject(error);
    }

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      return Promise.reject(error);
    }

    // Retry logic for network errors and 5xx errors
    const config = error.config;
    if (!config) {
      return Promise.reject(error);
    }

    if (
      (error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ENOTFOUND' || // Network error
        (error.response?.status >= 500 && error.response?.status < 600)) && // Server error
      config.retryCount < 3 // Max 3 retries
    ) {
      config.retryCount++;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, config.retryCount - 1);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axiosClient(config));
        }, delay);
      });
    }

    // Log detailed error info
    console.error('❌ API Error:', {
      status: error.response?.status,
      code: error.code,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
    });

    return Promise.reject(error);
  }
);

/**
 * Helper function: Retry a request manually
 * Usage: await retryRequest(() => axiosClient.get('/foods'), 3)
 */
export const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      
      // Exponential backoff
      const delay = 1000 * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

export default axiosClient;

