import axios from 'axios';
import { useAuthStore } from '@/stores';
import { BASE_API_URL } from '@/config';

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Thêm request interceptor để đính kèm access token mới nhất vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Tự động refresh access token khi expired
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Lưu lại request lỗi
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // bỏ qua những api không cần kiểm tra
    if (
      originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // đặt limit thử lại
    originalRequest._retryCount = originalRequest._retryCount || 0;

    const statusCode = error.response?.status ?? error.status;

    if (statusCode === 401 && originalRequest._retryCount < 3) {
      originalRequest._retryCount++;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('Không có refresh token');
        }

        // call api refresh
        const response = await axios.post(`${BASE_API_URL}/api/v1/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Lưu access token mới nếu API trả về token mới (hỗ trợ cả camelCase và snake_case)
        const newAccessToken = response.data?.accessToken || response.data?.access_token;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // call lại api đã lỗi với access token mới
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại -> Xóa phiên và đưa về /signin
        useAuthStore.setState({
          isAuthenticated: false,
          accessToken: '',
          refreshToken: '',
          user: null,
        });
        if (typeof document !== 'undefined') {
          document.cookie = 'xt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        }
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
          window.location.replace('/signin');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
