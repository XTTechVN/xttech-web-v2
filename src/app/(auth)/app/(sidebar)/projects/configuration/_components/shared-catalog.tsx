'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyCatalogItem, type CatalogKind } from '@/actions';
import { IconAction, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import { showErrorToast } from '@/utils';
import { cn } from '@/utils/cn';

// Danh mục dùng chung của nền tảng: nhãn "Hệ thống" + nút sao chép về doanh nghiệp (cần quyền tạo danh mục, `catalog:create`)
export function SystemTag() {
  return <Tag tone="teal">Hệ thống</Tag>;
}

interface Props {
  kind: CatalogKind;
  id: number;
  name: string;
  /** Gọi sau khi sao chép xong (vd đóng drawer) */
  onCopied?: () => void;
  /** `icon`: nút tròn trên đầu drawer; `card`: nút trong chân thẻ */
  variant: 'icon' | 'card';
}

export function CopyToOrg({ kind, id, name, onCopied, variant }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const copy = useMutation({
    mutationFn: () => copyCatalogItem(kind, id),
    onSuccess: () => {
      toast.success('Đã sao chép về doanh nghiệp, bạn có thể chỉnh sửa bản riêng');
      qc.invalidateQueries();
      onCopied?.();
    },
    onError: (e) => showErrorToast(e, 'Không sao chép được'),
  });

  if (!can('catalog:create')) return null;
  const label = `Sao chép ${name} về doanh nghiệp để chỉnh riêng`;
  if (variant === 'icon') {
    return (
      <IconAction label={label} disabled={copy.isPending} onClick={() => copy.mutate()}>
        <Copy size={16} />
      </IconAction>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      title="Sao chép về doanh nghiệp để chỉnh riêng"
      disabled={copy.isPending}
      onClick={() => copy.mutate()}
      className={cn(
        'flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-400 transition active:scale-95 disabled:cursor-default disabled:opacity-50 md:size-9 md:hover:bg-slate-100 md:hover:text-primary',
      )}
    >
      <Copy size={14} />
    </button>
  );
}
