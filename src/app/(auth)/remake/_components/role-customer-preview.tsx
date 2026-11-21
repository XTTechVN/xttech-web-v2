import { Pencil, Plus, Trash2 } from 'lucide-react';

interface RoleCustomerPreviewProps {
  can: (code: string) => boolean;
}

const ICON_BTN =
  'flex size-rm-tap flex-none items-center justify-center rounded-rm text-rm-muted transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-bg';

// Màn "Khách hàng" thu nhỏ: nút nào hiện là do can() của role đang xem
export function RoleCustomerPreview({ can }: RoleCustomerPreviewProps) {
  if (!can('customer:read')) {
    return (
      <div className="rounded-rm-xl border border-rm-edge bg-rm-surface px-4 py-8 text-center">
        <p className="font-heading text-base font-semibold text-rm-text">Bạn chưa có quyền xem trang này</p>
        <p className="mt-1 text-sm text-rm-muted">Role này không có customer:read nên không thấy danh sách.</p>
      </div>
    );
  }
  return (
    <div className="rounded-rm-xl border border-rm-edge bg-rm-surface">
      <div className="flex items-center gap-3 border-b border-rm-line p-3">
        <h3 className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-rm-text">Khách hàng</h3>
        {can('customer:create') && (
          <button
            type="button"
            aria-label="Thêm khách hàng"
            className="flex h-rm-tap min-w-rm-tap flex-none items-center justify-center gap-2 rounded-rm bg-rm-primary px-3 text-sm font-medium text-rm-on-primary active:scale-95 md:h-rm-control"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Thêm</span>
          </button>
        )}
      </div>
      <div className="flex min-h-rm-row items-center gap-1 pl-3 pr-1">
        <div className="min-w-0 flex-1 py-2">
          <p className="truncate text-sm font-medium text-rm-text">Công ty TNHH Xây dựng Cường Thịnh</p>
          <p className="truncate text-xs text-rm-muted">0901000003 · 8 Phạm Văn Đồng, Thủ Đức</p>
        </div>
        {can('customer:update') && (
          <button type="button" aria-label="Sửa khách hàng" className={ICON_BTN}>
            <Pencil size={18} />
          </button>
        )}
        {can('customer:delete') && (
          <button type="button" aria-label="Xoá khách hàng" className={ICON_BTN}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
