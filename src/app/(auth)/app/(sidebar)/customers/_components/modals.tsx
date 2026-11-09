/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { exportCustomersExcel, getUsers } from '@/actions';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { usePermission } from '@/hooks';

// Re-export CustomerFormModal from Shared Components (Rule 16)
export { CustomerFormModal } from '@/components/customers';
export type { CustomerFormModalProps } from '@/components/customers';

// Modal xác nhận Xóa khách hàng
export interface CustomerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function CustomerDeleteModal({
  isOpen,
  onClose,
  customerName,
  onConfirm,
  isPending = false,
}: CustomerDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa khách hàng" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <strong className="text-gray-900 font-semibold">{customerName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}

// Modal Xuất Excel danh sách khách hàng theo tuần/thời gian
export interface CustomerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PresetType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all' | 'custom';

export function CustomerExportModal({ isOpen, onClose }: CustomerExportModalProps) {
  const { user, canViewAll } = usePermission();
  const [preset, setPreset] = useState<PresetType>('this_week');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Helper tính khoảng ngày theo preset
  const calculatePresetDates = (p: PresetType) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (p === 'this_week') {
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1) - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return { from: format(mon), to: format(sun) };
    }
    if (p === 'last_week') {
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1) - day - 7;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return { from: format(mon), to: format(sun) };
    }
    if (p === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: format(firstDay), to: format(lastDay) };
    }
    if (p === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: format(firstDay), to: format(lastDay) };
    }
    return { from: '', to: '' };
  };

  // Áp dụng ngày mặc định khi mở modal hoặc đổi preset
  useEffect(() => {
    if (isOpen) {
      if (preset !== 'custom') {
        const { from, to } = calculatePresetDates(preset);
        setFromDate(from);
        setToDate(to);
      }
    }
  }, [isOpen, preset]);

  // Load danh sách nhân viên
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 1000 }),
    enabled: isOpen && canViewAll,
  });

  const staffOptions = [
    { label: 'Tất cả nhân viên', value: '' },
    ...((usersData?.items || [])
      .filter((u: any) => u.roles?.some((r: any) => r.code === 'sale'))
      .map((u: any) => ({
        label: u.fullName || u.username || u.email,
        value: u.id,
      }))),
  ];

  const handleSelectPreset = (newPreset: PresetType) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const { from, to } = calculatePresetDates(newPreset);
      setFromDate(from);
      setToDate(to);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportCustomersExcel({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        staffId: canViewAll ? (selectedStaffId || undefined) : user?.id,
      });
      toast.success('Xuất file Excel thành công');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const presetsList: { id: PresetType; label: string }[] = [
    { id: 'this_week', label: 'Tuần này' },
    { id: 'last_week', label: 'Tuần trước' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'last_month', label: 'Tháng trước' },
    { id: 'all', label: 'Tất cả' },
    { id: 'custom', label: 'Tùy chọn' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xuất báo cáo khách hàng" className="m-2 max-w-md w-full">
      <div className="flex flex-col gap-4 py-2">
        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Khoảng thời gian</span>
          <div className="flex flex-wrap gap-1.5">
            {presetsList.map((p) => {
              const isActive = preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Input
              label="Từ ngày"
              type="date"
              fullWidth
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPreset('custom');
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Input
              label="Đến ngày"
              type="date"
              fullWidth
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPreset('custom');
              }}
            />
          </div>
        </div>

        {/* Staff Filter (if manager) */}
        {canViewAll && (
          <div className="flex flex-col gap-1.5">
            <Select
              label="Nhân viên phụ trách"
              options={staffOptions}
              placeholder={isLoadingUsers ? 'Đang tải nhân viên...' : 'Tất cả nhân viên'}
              fullWidth
              disabled={isLoadingUsers}
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end w-full mt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting}
          >
            Xuất file Excel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
