import axios from 'axios';
import { getToken, clearAuthSession } from '../utils/authStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Automatically attach the Bearer token (if stored) to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Forward Accept-Language so the API returns responses in the active locale
    const lang = localStorage.getItem('i18nextLng') || 'ar';
    config.headers['Accept-Language'] = lang;

    // Let the browser set multipart boundary — manual Content-Type breaks FormData parsing
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
// Handle 401 globally: clear storage and redirect to /login
// Skip redirect for failed login attempts so the form can show the error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('admin/login');

    if (status === 401 && !isLoginRequest) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
