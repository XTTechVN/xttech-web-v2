'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, ConfirmDelete, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { NEWS_CATEGORY_OPTIONS } from '@/config';
import { deleteNewsArticle, updateNewsArticleStatus } from '@/actions';
import { showErrorToast } from '@/utils';
import type { NewsArticle } from '@/types';
import { refreshNews } from './refresh';
import { usePlatformCan } from '../../_components/use-platform-can';

const categoryLabel = (c: string) => NEWS_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;

export const statusTag = (a: NewsArticle) => (
  <Tag tone={a.status === 'published' ? 'green' : 'amber'}>{a.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</Tag>
);

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
}

// Chi tiết nhanh một bài viết: đổi trạng thái, ghim tiêu điểm; sửa nội dung ở trang riêng
export function NewsDrawer({ article: a, onClose }: Props) {
  const { can } = usePlatformCan();
  const [confirming, setConfirming] = useState(false);
  const canUpdate = can('news:update');
  const canPublish = can('news:publish');
  const canDelete = can('news:delete');

  const patch = useMutation({
    mutationFn: (body: { status?: 'draft' | 'published'; isFeatured?: boolean }) => updateNewsArticleStatus(a!.id, body),
    onSuccess: () => {
      refreshNews();
      toast.success('Đã cập nhật bài viết');
    },
    onError: (e) => showErrorToast(e, 'Không thể cập nhật bài viết'),
  });
  const remove = useMutation({
    mutationFn: () => deleteNewsArticle(a!.id),
    onSuccess: () => {
      refreshNews();
      toast.success('Đã xóa bài viết và dữ liệu media liên quan');
      setConfirming(false);
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa bài viết'),
  });

  return (
    <Drawer isOpen={!!a} onClose={onClose} label="Chi tiết bài viết">
      {a && (
        <>
          <DrawerHeader
            compact
            title="Bài viết"
            onClose={onClose}
            actions={
              <>
                {canUpdate && (
                  <Link
                    href={`/platform/news/${a.id}/edit`}
                    aria-label="Sửa bài viết"
                    title="Sửa bài viết"
                    className="flex size-11 flex-none items-center justify-center rounded-full text-slate-600 active:bg-slate-900/10 md:size-9 md:hover:bg-slate-900/10"
                  >
                    <Pencil size={16} />
                  </Link>
                )}
                {canDelete && (
                  <IconAction label="Xóa bài viết" danger onClick={() => setConfirming(true)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="mb-4 font-heading text-lg font-semibold text-slate-900 [overflow-wrap:anywhere]">{a.title}</h3>
              <DrawerSection title="Thông tin">
                <InfoRow label="Trạng thái">{statusTag(a)}</InfoRow>
                <InfoRow label="Chuyên mục">{categoryLabel(a.category)}</InfoRow>
                <InfoRow label="Tiêu điểm">{a.isFeatured ? 'Có' : 'Không'}</InfoRow>
                <InfoRow label="Tác giả">{a.author?.fullName || '–'}</InfoRow>
                <InfoRow label="Lượt xem">{a.viewCount}</InfoRow>
                <InfoRow label="Lượt thích">{a.likeCount}</InfoRow>
                <InfoRow label="Bình luận">{a.commentCount}</InfoRow>
                <InfoRow label="Cập nhật">{new Date(a.updatedAt).toLocaleString('vi-VN')}</InfoRow>
                <InfoRow label="Đường dẫn">{a.slug}</InfoRow>
              </DrawerSection>
              {a.summary && (
                <DrawerSection title="Tóm tắt">
                  <p className="text-sm text-slate-900 [overflow-wrap:anywhere]">{a.summary}</p>
                </DrawerSection>
              )}
            </div>
          </DrawerBody>
          {(canPublish || canUpdate) && (
            <DrawerFooter>
              <div className="flex gap-2">
                {canUpdate && (
                  <Button variant="outline" className="flex-1" loading={patch.isPending} onClick={() => patch.mutate({ isFeatured: !a.isFeatured })}>
                    {a.isFeatured ? 'Bỏ tiêu điểm' : 'Ghim tiêu điểm'}
                  </Button>
                )}
                {canPublish && (
                  <Button
                    className="flex-1"
                    loading={patch.isPending}
                    onClick={() => patch.mutate({ status: a.status === 'published' ? 'draft' : 'published' })}
                  >
                    {a.status === 'published' ? 'Gỡ xuống nháp' : 'Xuất bản'}
                  </Button>
                )}
              </div>
            </DrawerFooter>
          )}
          <ConfirmDelete
            isOpen={confirming}
            title="Xác nhận xóa bài viết"
            pending={remove.isPending}
            onClose={() => setConfirming(false)}
            onConfirm={() => remove.mutate()}
          >
            <>
              Xóa vĩnh viễn <strong>{a.title}</strong>? Bài viết, bình luận và toàn bộ ảnh, video trong bài sẽ bị xóa.
            </>
          </ConfirmDelete>
        </>
      )}
    </Drawer>
  );
}
