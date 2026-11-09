'use client';

import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, ITableFilterProps, TableData } from '@/components';
import { NEWS_CATEGORY_OPTIONS, NEWS_STATUS_OPTIONS } from '@/config';
import { getAdminNewsList, updateNewsArticleStatus } from '@/actions';
import { useQueryParam } from '@/hooks';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import { buildNewsAdminColumns, NewsAdminCard } from './news-admin-card';

export interface NewsAdminTableProps {
  onCreateClick: () => void;
  onEditClick: (article: NewsArticle) => void;
  onPreviewClick: (article: NewsArticle) => void;
  onDeleteClick: (article: NewsArticle) => void;
}

export function NewsAdminTable({
  onCreateClick,
  onEditClick,
  onPreviewClick,
  onDeleteClick,
}: NewsAdminTableProps) {
  const [search, setSearch] = useQueryParam('search');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [featuredFilter, setFeaturedFilter] = useState<string | undefined>(undefined);
  const [sortFilter, setSortFilter] = useState<string | undefined>(undefined);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const tableFilters = useMemo<ITableFilterProps[]>(
    () => [
      {
        label: 'Trạng thái',
        value: statusFilter,
        options: [
          { label: 'Tất cả trạng thái', value: undefined },
          ...NEWS_STATUS_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value })),
        ],
        onChange: (val) => setStatusFilter(val),
      },
      {
        label: 'Chuyên mục',
        value: categoryFilter,
        options: [
          { label: 'Tất cả chuyên mục', value: undefined },
          ...NEWS_CATEGORY_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value })),
        ],
        onChange: (val) => setCategoryFilter(val),
      },
      {
        label: 'Tiêu điểm',
        value: featuredFilter,
        options: [
          { label: 'Tất cả bài viết', value: undefined },
          { label: 'Bài tiêu điểm', value: 'true' },
          { label: 'Bài viết thường', value: 'false' },
        ],
        onChange: (val) => setFeaturedFilter(val),
      },
      {
        label: 'Sắp xếp',
        value: sortFilter,
        options: [
          { label: 'Mới nhất (Mặc định)', value: undefined },
          { label: 'Xem nhiều nhất (Popular)', value: 'popular' },
          { label: 'Nhiều tim nhất (Hot)', value: 'hot' },
        ],
        onChange: (val) => setSortFilter(val),
      },
    ],
    [statusFilter, categoryFilter, featuredFilter, sortFilter],
  );

  const fetcher = async (params: { offset: number; limit: number }) => {
    try {
      return await getAdminNewsList({
        ...params,
        search: search || undefined,
        status: (statusFilter as NewsStatus) || undefined,
        category: (categoryFilter as NewsCategory) || undefined,
        isFeatured:
          featuredFilter === 'true' ? true : featuredFilter === 'false' ? false : undefined,
        popular: sortFilter === 'popular' ? true : undefined,
        hot: sortFilter === 'hot' ? true : undefined,
      });
    } catch (err) {
      showErrorToast(err, 'Không thể tải danh sách bài viết tin tức');
      throw err;
    }
  };

  const handleToggleStatus = async (row: NewsArticle) => {
    const nextStatus: NewsStatus = row.status === 'published' ? 'draft' : 'published';
    setUpdatingId(row.id);
    try {
      await updateNewsArticleStatus(row.id, { status: nextStatus });
      showSuccessToast(
        nextStatus === 'published' ? 'Đã xuất bản bài viết công khai!' : 'Đã chuyển về bản nháp.',
      );
      await queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    } catch (err) {
      showErrorToast(err, 'Không thể đổi trạng thái bài viết');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (row: NewsArticle) => {
    const nextFeatured = !row.isFeatured;
    setUpdatingId(row.id);
    try {
      await updateNewsArticleStatus(row.id, { isFeatured: nextFeatured });
      showSuccessToast(
        nextFeatured ? 'Đã ghim làm bài viết tiêu điểm!' : 'Đã bỏ ghim bài viết tiêu điểm.',
      );
      await queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    } catch (err) {
      showErrorToast(err, 'Không thể cập nhật trạng thái tiêu điểm');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = buildNewsAdminColumns({
    updatingId,
    onToggleStatus: handleToggleStatus,
    onToggleFeatured: handleToggleFeatured,
    onPreviewClick,
    onEditClick,
    onDeleteClick,
  });

  const addButton = (
    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateClick}>
      Viết bài mới
    </Button>
  );

  return (
    <TableData<NewsArticle>
      columns={columns}
      fetcher={fetcher}
      queryKey={['admin-news', search, statusFilter, categoryFilter, featuredFilter, sortFilter]}
      renderCard={(row) => (
        <NewsAdminCard
          article={row}
          onPreviewClick={onPreviewClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      )}
      select={false}
      filters={tableFilters}
      actions={addButton}
      mobileActions={{ primary: addButton }}
      search={{
        placeholder: 'Tìm kiếm theo tiêu đề, tóm tắt, slug...',
        value: search,
        onChange: setSearch,
        className: 'w-80',
      }}
    />
  );
}
