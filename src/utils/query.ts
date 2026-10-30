import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // Dữ liệu được coi là mới trong 3 phút (không fetch lại liên tục)
      gcTime: 1000 * 60 * 10,    // Giữ trong bộ nhớ đệm 10 phút
      refetchOnWindowFocus: false, // Tắt tự động gọi lại API khi click chuột chuyển cửa sổ
      retry: 1,
    },
  },
});


export default queryClient;
