'use client';

import { useCan } from '@/hooks/use-can';
import { formatVnd, type MockQuotation } from '../_mock/mock-quotations';
import { Sheet } from './sheet';
import { StatusBadge } from './status-badge';

interface QuotationSheetProps {
  item: MockQuotation | null;
  onClose: () => void;
}

// Ít thông tin, ít thao tác -> bottom sheet (điện thoại) / panel phải (từ 768px)
export function QuotationSheet({ item, onClose }: QuotationSheetProps) {
  const { can } = useCan();
  return (
    <Sheet open={!!item} onClose={onClose} title={item ? `Báo giá ${item.code}` : 'Báo giá'}>
      {item && (
        <div className="flex min-h-full flex-col">
          <div className="flex flex-col gap-4 p-rm-gutter">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-rm-muted">Khách hàng</p>
                <p className="font-medium text-rm-text [overflow-wrap:anywhere]">{item.customer}</p>
                <p className="mt-0.5 text-xs text-rm-muted">{item.date}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
              {item.lines.map((line) => (
                <li key={line.name} className="flex min-h-rm-tap items-center gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 text-rm-text [overflow-wrap:anywhere]">{line.name}</span>
                  <span className="flex-none text-rm-muted">{formatVnd(line.amount)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-rm-muted">Tổng cộng</span>
              <span className="font-heading text-lg font-semibold text-rm-text">{formatVnd(item.total)}</span>
            </div>
          </div>

          {can('quotation:approve') && (
            <div className="sticky bottom-0 mt-auto border-t border-rm-line bg-rm-surface p-rm-gutter rm-safe-bottom">
              <button
                type="button"
                onClick={onClose}
                disabled={item.status !== 'pending'}
                className="h-12 w-full rounded-rm bg-rm-primary text-sm font-medium text-rm-on-primary transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 hover:bg-rm-primary-hover disabled:bg-rm-line disabled:text-rm-muted md:h-rm-control"
              >
                Duyệt báo giá
              </button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
