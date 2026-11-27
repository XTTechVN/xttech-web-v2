'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';
import { Drawer } from './drawer';
import { Select } from './select';
import { DrawerBody, DrawerFooter, DrawerHeader } from './drawer-parts';

export interface FilterGroup {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterDrawerProps {
  groups: FilterGroup[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  /** Phần lọc thêm không phải ô chọn (ví dụ khoảng ngày): nội dung, số bộ lọc đang bật, và cách xóa */
  extra?: { node: React.ReactNode; count: number; onReset: () => void };
}

// Nút "Lọc" + ngăn kéo; mỗi nhóm một ô chọn (chọn "Tất cả" để bỏ lọc). Áp dụng ngay khi chọn.
export function FilterDrawer({ groups, value, onChange, extra }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const count = Object.values(value).filter(Boolean).length + (extra?.count ?? 0);

  return (
    <>
      <Button
        variant="outline"
        icon={<SlidersHorizontal size={16} />}
        iconOnly="mobile"
        badge={count}
        onClick={() => setOpen(true)}
        className={cn(count > 0 && 'border-primary text-primary')}
      >
        Lọc
      </Button>

      <Drawer sheet isOpen={open} onClose={() => setOpen(false)} label="Bộ lọc">
        <DrawerHeader compact title="Bộ lọc" onClose={() => setOpen(false)} />
        <DrawerBody>
          <div className="flex flex-col gap-4 pt-4">
            {groups.map((g) => (
              <Select
                key={g.key}
                side
                label={g.label}
                value={value[g.key] ?? ''}
                options={g.options}
                onChange={(v) => onChange({ ...value, [g.key]: v })}
                placeholder="Tất cả"
                clearLabel="Tất cả"
              />
            ))}
            {extra?.node}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={count === 0}
              onClick={() => {
                onChange({});
                extra?.onReset();
              }}
            >
              Xóa bộ lọc
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Xong
            </Button>
          </div>
        </DrawerFooter>
      </Drawer>
    </>
  );
}
