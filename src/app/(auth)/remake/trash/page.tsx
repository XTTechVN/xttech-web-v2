'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { emptyTrash, getTrashItems, purgeTrashItem, restoreTrashItem } from '@/actions';
import { useCan } from '@/hooks';
import type { TrashItem } from '@/types';
import { DataList } from '../_components/data-list';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, messageOf } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { Sheet } from '../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { TrashCard, trashColumns } from './_components/trash-columns';

// Thùng rác tài liệu: khôi phục, xoá vĩnh viễn từng mục hoặc dọn sạch.
export default function RemakeTrashPage() {
  const { can, isReady } = useCan();
  const qc = useQueryClient();
  const [open, setOpen] = useState<TrashItem | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['trash'], queryFn: getTrashItems, enabled: isReady && can('trash:read') });
  const items = data ?? [];

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['trash'] });
    setOpen(null);
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const restore = useMutation({
    mutationFn: (i: TrashItem) => restoreTrashItem({ itemType: i.itemType, itemId: i.id }),
    onSuccess: () => done('Đã khôi phục'),
    onError: fail,
  });
  const purge = useMutation({
    mutationFn: (i: TrashItem) => purgeTrashItem({ itemType: i.itemType, itemId: i.id }),
    onSuccess: () => done('Đã xoá vĩnh viễn'),
    onError: fail,
  });
  const empty = useMutation({ mutationFn: emptyTrash, onSuccess: () => done('Đã dọn sạch thùng rác'), onError: fail });
  const busy = restore.isPending || purge.isPending;

  if (!isReady) return <ListSkeleton />;
  if (!can('trash:read')) return <EmptyState title="Bạn chưa có quyền xem thùng rác" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader title="Thùng rác" description="Mục xoá sẽ tự mất sau một thời gian." />

      {can('trash:purge') && items.length > 0 && (
        <button
          type="button"
          disabled={empty.isPending}
          onClick={() => window.confirm('Dọn sạch thùng rác? Không thể hoàn tác.') && empty.mutate()}
          className={`${BTN_DANGER} mb-3 w-full md:w-auto`}
        >
          Dọn sạch thùng rác
        </button>
      )}

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được thùng rác" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && <EmptyState title="Thùng rác trống" description="Tài liệu bị xoá sẽ nằm ở đây." />}
      {items.length > 0 && (
        <DataList
          label="Danh sách mục đã xoá"
          rows={items}
          rowKey={(i) => `${i.itemType}-${i.id}`}
          columns={trashColumns}
          card={(i) => <TrashCard i={i} />}
          onOpen={setOpen}
        />
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.code ?? 'Thùng rác'}>
        {open && (
          <div className="flex flex-col gap-4 p-rm-gutter">
            <p className="text-sm font-medium [overflow-wrap:anywhere]">{open.title}</p>
            <p className="text-sm text-rm-muted">
              {open.itemType === 'folder' ? 'Thư mục' : 'Tài liệu'}
              {open.categoryName && ` · ${open.categoryName}`} · tự xoá sau {open.daysLeft} ngày
            </p>
            <div className="flex gap-2">
              {can('trash:purge') && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm('Xoá vĩnh viễn? Không thể hoàn tác.') && purge.mutate(open)}
                  className={`${BTN_LINE} flex-1 text-rm-danger`}
                >
                  Xoá vĩnh viễn
                </button>
              )}
              {can('trash:restore') && (
                <button type="button" disabled={busy} onClick={() => restore.mutate(open)} className={`${BTN_PRIMARY} flex-1`}>
                  Khôi phục
                </button>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
