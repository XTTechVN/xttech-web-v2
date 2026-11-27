'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { exportCustomersExcel, getUsers } from '@/actions';
import { Button, Chip, DateTimeField, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import { showErrorToast } from '@/utils';

type Preset = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'this_week', label: 'Tuần này' },
  { value: 'last_week', label: 'Tuần trước' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'all', label: 'Tất cả' },
  { value: 'custom', label: 'Tùy chọn' },
];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function rangeOf(p: Preset): { from: string; to: string } {
  const now = new Date();
  if (p === 'this_week' || p === 'last_week') {
    const mon = new Date(now);
    mon.setDate(now.getDate() + (now.getDay() === 0 ? -6 : 1) - now.getDay() - (p === 'last_week' ? 7 : 0));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: iso(mon), to: iso(sun) };
  }
  if (p === 'this_month' || p === 'last_month') {
    const offset = p === 'last_month' ? -1 : 0;
    return {
      from: iso(new Date(now.getFullYear(), now.getMonth() + offset, 1)),
      to: iso(new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)),
    };
  }
  return { from: '', to: '' };
}

function ExportPanel({ onClose }: { onClose: () => void }) {
  const { can, isWide } = useCan();
  const me = useAuthStore((s) => s.user);
  const canViewAll = isWide('customer:update');
  const [preset, setPreset] = useState<Preset>('this_week');
  const [range, setRange] = useState(() => rangeOf('this_week'));
  const [staffId, setStaffId] = useState('');

  const staff = useQuery({
    queryKey: ['users', 'customer-staff'],
    queryFn: () => getUsers({ limit: 1000, permission: 'customer:update' }),
    enabled: canViewAll && can('user:read'),
  });

  const pick = (p: Preset) => {
    setPreset(p);
    if (p !== 'custom') setRange(rangeOf(p));
  };
  const setDate = (k: 'from' | 'to', v: string) => {
    setPreset('custom');
    setRange((r) => ({ ...r, [k]: v }));
  };

  const run = useMutation({
    mutationFn: () =>
      exportCustomersExcel({
        fromDate: range.from || undefined,
        toDate: range.to || undefined,
        staffId: canViewAll ? staffId || undefined : me?.id,
      }),
    onSuccess: () => {
      toast.success('Xuất file Excel thành công');
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không thể xuất file Excel'),
  });

  return (
    <>
      <DrawerHeader compact title="Xuất báo cáo khách hàng" onClose={onClose} />
      <DrawerBody>
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Khoảng thời gian</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Chip key={p.value} selected={preset === p.value} onClick={() => pick(p.value)}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
            <DateTimeField label="Từ ngày" mode="date" value={range.from} max={range.to || undefined} onChange={(v) => setDate('from', v)} />
            <DateTimeField label="Đến ngày" mode="date" value={range.to} min={range.from || undefined} onChange={(v) => setDate('to', v)} />
          </div>
          {canViewAll && (
            <Select
              label="Nhân viên phụ trách"
              value={staffId}
              loading={staff.isLoading}
              clearLabel="Tất cả nhân viên"
              options={(staff.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName || u.username || u.email }))}
              onChange={setStaffId}
            />
          )}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={run.isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button className="flex-1 md:flex-none" loading={run.isPending} onClick={() => run.mutate()}>
            Xuất file Excel
          </Button>
        </div>
      </DrawerFooter>
    </>
  );
}

export default function ExportDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Xuất báo cáo khách hàng">
      <ExportPanel onClose={onClose} />
    </Drawer>
  );
}
