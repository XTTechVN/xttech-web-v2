import { useMemo, useState } from 'react';
import { Briefcase, UserCheck, UserPlus, Users } from 'lucide-react';
import { StatGrid } from '@/components-remake';
import type { Employee } from '@/types';

const NEW_DAYS = 30;

// Bốn số tính từ danh sách đã tải: 2 cột trên điện thoại, 4 cột từ 768px
export function EmployeeStats({ rows }: { rows: Employee[] }) {
  const [now] = useState(() => Date.now());
  const items = useMemo(() => {
    const since = now - NEW_DAYS * 86_400_000;
    return [
      { label: 'Tổng nhân sự', value: rows.length, icon: Users },
      { label: 'Đã có chức vụ', value: rows.filter((r) => r.positions?.length > 0).length, icon: Briefcase },
      { label: 'Thiếu chức vụ', value: rows.filter((r) => !r.positions?.length).length, icon: UserCheck },
      { label: `Mới ${NEW_DAYS} ngày`, value: rows.filter((r) => new Date(r.createdAt).getTime() >= since).length, icon: UserPlus },
    ];
  }, [rows, now]);

  return <StatGrid items={items} />;
}
