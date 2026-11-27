'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components';
import { Button, FilterDrawer, type FilterGroup } from '@/components-remake';
import { useCan } from '@/hooks';
import type { WarehouseItem, WarehouseOffcut } from '@/types';
import { OFFCUT_STATUS } from '../format';
import { TabState } from '@/components-remake';
import OffcutFormDrawer from './offcut-form-drawer';
import { OffcutList } from './offcut-list';

const GROUPS: FilterGroup[] = [
  { key: 'status', label: 'Trạng thái', options: Object.entries(OFFCUT_STATUS).map(([value, s]) => ({ value, label: s.label })) },
];

interface Props {
  offcuts: WarehouseOffcut[];
  profileItems: WarehouseItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export function OffcutsTab({ offcuts, profileItems, loading, error, onRetry }: Props) {
  const { can } = useCan();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [minLength, setMinLength] = useState('');
  const [adding, setAdding] = useState(false);

  const rows = useMemo(
    () => offcuts.filter((o) => (!filters.status || o.status === filters.status) && (!minLength || o.lengthMm >= Number(minLength))),
    [offcuts, filters, minLength],
  );
  const filtered = !!minLength || Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 text-xs text-slate-500 md:text-sm">
          Thanh thừa từ 1.000 mm, trạng thái Sẵn sàng, được bộ tối ưu cắt dùng lại trước khi cắt cây nguyên 6 m.
        </p>
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer
            groups={GROUPS}
            value={filters}
            onChange={setFilters}
            extra={{
              count: minLength ? 1 : 0,
              onReset: () => setMinLength(''),
              node: (
                <Input
                  label="Chiều dài tối thiểu (mm)"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  fullWidth
                  value={minLength}
                  onChange={(e) => setMinLength(e.target.value)}
                />
              ),
            }}
          />
          {can('offcut:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thu hồi nhôm thừa
            </Button>
          )}
        </div>
      </div>

      <TabState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có thanh nhôm thừa khớp bộ lọc.' : 'Chưa có nhôm thừa tái sử dụng.'}
        emptyAction={
          !filtered &&
          can('offcut:create') && (
            <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
              Thu hồi nhôm thừa
            </Button>
          )
        }
      >
        <OffcutList rows={rows} />
      </TabState>

      <OffcutFormDrawer isOpen={adding} onClose={() => setAdding(false)} profileItems={profileItems} />
    </div>
  );
}
