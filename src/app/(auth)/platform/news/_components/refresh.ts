import queryClient from '@/utils/query';

// Làm mới danh sách tin tức quản trị và tin công khai sau khi thêm, sửa, xóa
export const refreshNews = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-news'] });
  queryClient.invalidateQueries({ queryKey: ['public-news-list'] });
};
