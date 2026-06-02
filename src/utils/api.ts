import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://api_vision.bosky.vn',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// tự động refresh access token khi expired
api.interceptors.response.use(
  (res) => res,
  async (error) => {
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
        // call api refresh, api này sẽ tự cấp phát vào cookie
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://api_vision.bosky.vn'}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          },
        );

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
