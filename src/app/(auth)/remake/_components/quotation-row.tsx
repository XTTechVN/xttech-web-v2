import { formatVnd, type MockQuotation } from '../_mock/mock-quotations';
import { StatusBadge } from './status-badge';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface QuotationRowProps {
  item: MockQuotation;
  index: number;
  onOpen: () => void;
}

// Dòng danh sách: chính (đậm) / phụ / trạng thái + một thông tin quan trọng. Chi tiết nằm trong sheet.
export function QuotationRow({ item, index, onOpen }: QuotationRowProps) {
  return (
    <li className="motion-safe:animate-rm-rise" style={{ animationDelay: `calc(${Math.min(index, 5)} * var(--rm-stagger))` }}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-rm-row w-full items-center gap-3 px-rm-gutter py-2 text-left transition-colors duration-(--rm-dur-fast) active:bg-rm-bg hover:bg-rm-bg"
      >
        <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-xs font-semibold text-rm-primary">
          {initials(item.customer)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-rm-text">{item.customer}</span>
          <span className="block truncate text-xs text-rm-muted">
            {item.code} · {item.date}
          </span>
        </span>
        <span className="flex max-w-[40%] flex-none flex-col items-end gap-1">
          <span className="max-w-full truncate text-sm font-medium text-rm-text">{formatVnd(item.total)}</span>
          <StatusBadge status={item.status} />
        </span>
      </button>
    </li>
  );
}
