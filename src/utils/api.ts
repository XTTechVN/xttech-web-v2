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

    // Axios v1.x dùng AxiosHeaders instance — gọi .delete() để xóa Content-Type
    // cho FormData, trình duyệt/Node sẽ tự thêm multipart/form-data + boundary đúng
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
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

    // bỏ qua những api không cần kiểm tra
    if (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // đặt limit thử lại
    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.status === 401 && originalRequest._retryCount < 3) {
      originalRequest._retryCount++;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        // call api refresh, api này sẽ tự cấp phát vào cookie
        const response = await axios.post(`${BASE_API_URL}/api/v1/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Lưu access token mới nếu API trả về token mới (nếu có cập nhật trong store)
        const newAccessToken = response.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // call lại api đã lỗi với access token mới
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
