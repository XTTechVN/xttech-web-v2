'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { emptyTrash, getTrashItems, purgeTrashItem, restoreTrashItem } from '@/actions';
import { Button, ConfirmDelete, PageHeading, SearchField, TabState } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import type { TrashItem } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { TrashDrawer } from './_components/trash-drawer';
import { TrashList } from './_components/trash-list';

type Confirm = { kind: 'purge'; item: TrashItem } | { kind: 'empty' };

// Thùng rác tài liệu: khôi phục, xóa vĩnh viễn từng mục hoặc dọn sạch
export default function TrashPage() {
  const { can, isReady } = useCan();
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['trash'], queryFn: getTrashItems, enabled: isReady && can('trash:read') });
  const items = useMemo(() => data ?? [], [data]);
  const kw = search.trim();
  const rows = useMemo(() => items.filter((i) => !kw || includesSearchText(i.title, kw) || includesSearchText(i.code, kw)), [items, kw]);
  const selected = useMemo(() => items.find((i) => `${i.itemType}-${i.id}` === selectedKey) ?? null, [items, selectedKey]);

  const done = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['trash'] });
    toast.success(msg);
    setSelectedKey(null);
    setConfirm(null);
  };
  const restore = useMutation({
    mutationFn: (i: TrashItem) => restoreTrashItem({ itemType: i.itemType, itemId: i.id }),
    onSuccess: () => done('Đã khôi phục'),
    onError: (e) => showErrorToast(e, 'Không thể khôi phục'),
  });
  const purge = useMutation({
    mutationFn: (i: TrashItem) => purgeTrashItem({ itemType: i.itemType, itemId: i.id }),
    onSuccess: () => done('Đã xóa vĩnh viễn'),
    onError: (e) => showErrorToast(e, 'Không thể xóa vĩnh viễn'),
  });
  const empty = useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => done('Đã dọn sạch thùng rác'),
    onError: (e) => showErrorToast(e, 'Không thể dọn thùng rác'),
  });

  if (!isReady) return null;
  if (!can('trash:read')) return <AccessDenied />;

  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Thùng rác" description="Mục đã xóa sẽ tự mất sau một thời gian." />
      <div className="mb-4 flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm mục đã xóa" placeholder="Tìm theo mã hoặc tên..." />
        {can('trash:purge') && items.length > 0 && (
          <Button variant="outline" icon={<Trash2 size={16} />} iconOnly="mobile" className="ml-auto flex-none" onClick={() => setConfirm({ kind: 'empty' })}>
            Dọn sạch
          </Button>
        )}
      </div>

      <TabState
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        empty={rows.length === 0}
        emptyText={kw ? 'Không có mục nào khớp từ khóa.' : 'Thùng rác trống.'}
      >
        <TrashList rows={rows} onOpen={(i) => setSelectedKey(`${i.itemType}-${i.id}`)} />
      </TabState>

      <TrashDrawer
        item={selected}
        canRestore={can('trash:restore')}
        canPurge={can('trash:purge')}
        restoring={restore.isPending}
        onClose={() => setSelectedKey(null)}
        onRestore={(i) => restore.mutate(i)}
        onPurge={(item) => {
          setSelectedKey(null);
          setConfirm({ kind: 'purge', item });
        }}
      />
      <ConfirmDelete
        isOpen={!!confirm}
        title={confirm?.kind === 'empty' ? 'Dọn sạch thùng rác' : 'Xóa vĩnh viễn'}
        pending={purge.isPending || empty.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => (confirm?.kind === 'purge' ? purge.mutate(confirm.item) : empty.mutate())}
      >
        {confirm?.kind === 'purge' ? (
          <>
            Xóa vĩnh viễn <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{confirm.item.title}</strong>?
          </>
        ) : (
          `Xóa vĩnh viễn ${items.length} mục trong thùng rác?`
        )}
      </ConfirmDelete>
    </div>
  );
}
