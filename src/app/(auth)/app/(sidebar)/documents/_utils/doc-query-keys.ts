import type { QueryClient } from '@tanstack/react-query';

/**
 * Quản lý tập trung toàn bộ React Query Keys cho module Cơ chế & Tài liệu
 * Quy tắc: Mỗi tính năng sử dụng 1 queryKey gốc duy nhất, thêm tham số khi cần phân biệt điều kiện truy vấn.
 */
export const DOC_QUERY_KEYS = {
  // 1. Quản lý Tài liệu (Văn bản của tôi, Được chia sẻ, Quy chế)
  documents: {
    root: ['documents'] as const,
    list: (params?: Record<string, any>) => ['documents', 'list', params ?? {}] as const,
    detail: (id?: number | string | null) => ['documents', 'detail', String(id || '')] as const,
    shares: (id?: number | string | null, scope?: string) => ['documents', 'shares', String(id || ''), scope ?? ''] as const,
  },

  // 2. Quản lý Thư mục (Category Tree & Shares)
  categories: {
    root: ['document-categories'] as const,
    tree: ['document-categories', 'tree'] as const,
    shares: (id?: number | string | null) => ['document-categories', 'shares', String(id || '')] as const,
  },

  // 3. Quản lý Thùng rác (Tách key độc lập ['trash'] để không bị trùng prefix với ['documents'])
  trash: {
    root: ['trash'] as const,
  },

  // 4. Danh mục dùng chung (Nhân sự, Phòng ban)
  options: {
    employees: ['employees', 'share-options'] as const,
    departments: ['departments', 'share-options'] as const,
  },
};

/**
 * Helper làm mới đồng bộ toàn bộ cache của module tài liệu sau mỗi thao tác (Tạo, Sửa, Xóa, Di chuyển, Phê duyệt, Ban hành)
 */
export const invalidateDocumentQueries = (
  queryClient: QueryClient,
  options?: { refetchType?: 'active' | 'inactive' | 'all' | 'none' }
) => {
  queryClient.invalidateQueries({
    queryKey: DOC_QUERY_KEYS.documents.root,
    refetchType: options?.refetchType ?? 'active',
  });
  queryClient.invalidateQueries({
    queryKey: DOC_QUERY_KEYS.categories.root,
    refetchType: options?.refetchType ?? 'active',
  });
};
