import type { QueryClient } from '@tanstack/react-query';

export const DOC_QUERY_KEYS = {
  documents: {
    root: ['documents'] as const,
    list: (params?: Record<string, unknown>) => ['documents', 'list', params ?? {}] as const,
    detail: (id?: number | string | null) => ['documents', 'detail', String(id || '')] as const,
    shares: (id?: number | string | null, scope?: string) =>
      ['documents', 'shares', String(id || ''), scope ?? ''] as const,
  },
  categories: {
    root: ['document-categories'] as const,
    tree: ['document-categories', 'tree'] as const,
    shares: (id?: number | string | null) => ['document-categories', 'shares', String(id || '')] as const,
  },
  trash: {
    root: ['trash'] as const,
    items: ['trash', 'items'] as const,
    tree: ['trash', 'tree'] as const,
    folderDocs: (folderId?: number | null) => ['trash', 'folder-docs', folderId ?? 'root'] as const,
  },
  options: {
    employees: ['employees', 'share-options'] as const,
    departments: ['departments', 'share-options'] as const,
  },
};

export const RULES_QUERY_KEYS = {
  root: ['document-rules'] as const,
  list: (params: Record<string, unknown>) => ['document-rules', 'list', params] as const,
  summary: ['document-rules', 'summary'] as const,
  timeline: (id?: number | null) => ['document-rules', 'timeline', id ?? 0] as const,
  detail: (id?: number | null) => ['document-rules', 'detail', id ?? 0] as const,
  supersedeCandidates: ['document-rules', 'supersede-candidates'] as const,
};

export const invalidateDocumentQueries = (
  queryClient: QueryClient,
  options?: { refetchType?: 'active' | 'inactive' | 'all' | 'none' },
) => {
  const refetchType = options?.refetchType ?? 'active';
  queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.documents.root, refetchType });
  queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.categories.root, refetchType });
  queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.trash.root, refetchType });
  queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root, refetchType });
};
