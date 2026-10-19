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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSessionAndRedirect = () => {
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
};

// Tự động refresh access token khi expired với cơ chế Queue & Mutex Lock
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Bỏ qua các API auth cơ bản để tránh lặp vô tận
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const statusCode = error.response?.status ?? error.status;

    // Chỉ can thiệp khi gặp mã 401 và request chưa từng retry
    if (statusCode !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu đang có tiến trình refresh chạy trước, đưa request này vào hàng đợi
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }

      const response = await axios.post(`${BASE_API_URL}/api/v1/auth/refresh`, {
        refreshToken,
      });

      // Backend trả về camelCase chuẩn theo quy chuẩn dự án (Rule 13)
      const newAccessToken: string | undefined = response.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('API refresh không trả về access token mới');
      }

      useAuthStore.getState().setAccessToken(newAccessToken);

      // Giải phóng hàng đợi cho tất cả các request đang chờ
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại -> reject toàn bộ hàng đợi và đăng xuất
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
