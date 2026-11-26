'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, FileEdit, Newspaper, Sparkles } from 'lucide-react';
import { StatsCard } from '@/components';
import { ConfirmActionModal } from '@/components/documents';
import { deleteNewsArticle, getAdminNewsList } from '@/actions';
import queryClient from '@/utils/query';
import { showErrorToast, showSuccessToast } from '@/utils';
import type { NewsArticle } from '@/types';
import { NewsAdminTable } from './_components/news-admin-table';

const NewsFormModal = dynamic(
  () => import('./_components/modals/news-form-modal').then((m) => m.NewsFormModal),
  { ssr: false },
);

const NewsPreviewModal = dynamic(
  () => import('./_components/modals/news-preview-modal').then((m) => m.NewsPreviewModal),
  { ssr: false },
);

export default function AdminNewsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: summaryData } = useQuery({
    queryKey: ['admin-news', 'summary-stats'],
    queryFn: () => getAdminNewsList({ limit: 500 }),
  });

  const allItems = summaryData?.items || [];
  const totalCount = summaryData?.meta?.total ?? allItems.length;
  const publishedCount = allItems.filter((item) => item.status === 'published').length;
  const draftCount = allItems.filter((item) => item.status === 'draft').length;
  const featuredCount = allItems.filter((item) => item.isFeatured).length;

  const stats = [
    {
      title: 'Tổng số bài viết',
      value: totalCount,
      icon: <Newspaper />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đã xuất bản',
      value: publishedCount,
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Bản nháp',
      value: draftCount,
      icon: <FileEdit />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Bài viết tiêu điểm',
      value: featuredCount,
      icon: <Sparkles />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormSessionKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormSessionKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    queryClient.invalidateQueries({ queryKey: ['public-news-list'] });
  };

  const handleConfirmDelete = async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);
    try {
      await deleteNewsArticle(deletingArticle.id);
      setDeletingArticle(null);
      showSuccessToast('Đã xóa cứng bài viết và dọn sạch dữ liệu media liên quan!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['public-news-list'] }),
      ]);
    } catch (err) {
      showErrorToast(err, 'Không thể xóa bài viết');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      <NewsAdminTable
        onCreateClick={handleOpenCreate}
        onEditClick={handleOpenEdit}
        onPreviewClick={(article) => setPreviewArticle(article)}
        onDeleteClick={(article) => setDeletingArticle(article)}
      />

      {isFormOpen && (
        <NewsFormModal
          key={editingArticle ? `edit-${editingArticle.id}-${formSessionKey}` : `create-${formSessionKey}`}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={editingArticle}
          onSuccess={handleFormSuccess}
        />
      )}

      {previewArticle && (
        <NewsPreviewModal
          isOpen={Boolean(previewArticle)}
          onClose={() => setPreviewArticle(null)}
          article={previewArticle}
        />
      )}

      <ConfirmActionModal
        isOpen={Boolean(deletingArticle)}
        onClose={() => setDeletingArticle(null)}
        title="Xóa vĩnh viễn bài viết tin tức"
        description={
          <>
            Bạn có chắc chắn muốn xóa cứng bài viết{' '}
            <strong className="text-slate-900">{deletingArticle?.title}</strong>?
          </>
        }
        warningNote="Lưu ý: Bài viết, toàn bộ bình luận đi kèm và tất cả file ảnh bìa / ảnh / video trong bài trên MinIO sẽ bị xóa vĩnh viễn không thể khôi phục."
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
