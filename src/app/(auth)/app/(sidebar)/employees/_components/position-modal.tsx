'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Avatar, Select } from '@/components';
import { Briefcase, Check, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDepartments, getPositions, setUserPositions } from '@/actions';
import type { Employee, Department, Position } from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { BASE_MINIO_URL } from '@/config';
import { cn } from '@/utils/cn';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  defaultDepartmentId?: number;
}

interface PositionModalFormProps {
  employee: Employee;
  defaultDepartmentId?: number;
  onClose: () => void;
}

function PositionModalForm({ employee, defaultDepartmentId, onClose }: PositionModalFormProps) {
  // Khởi tạo state ban đầu trực tiếp từ props mà không cần useEffect
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (defaultDepartmentId) return String(defaultDepartmentId);
    if (employee.positions && employee.positions.length > 0) {
      const firstDept = (employee.positions[0] as any)?.departmentId || (employee.positions[0] as any)?.department_id;
      return firstDept ? String(firstDept) : '';
    }
    return '';
  });

  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>(() => {
    return (employee.positions || []).map((p: any) => Number(p.id));
  });

  // 1. Lấy danh sách tất cả phòng ban
  const { data: deptsData, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments', 'modal-select'],
    queryFn: () => getDepartments({ limit: 100 }),
  });

  // 2. Lấy danh sách tất cả các vị trí
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions', 'modal-select'],
    queryFn: () => getPositions({ limit: 200 }),
  });

  const departmentList: Department[] = deptsData?.items || [];
  const allPositions: Position[] = positionsData?.items || [];

  // Lọc danh sách vị trí theo phòng ban được chọn
  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return allPositions;
    return allPositions.filter(
      (p: any) => String(p.departmentId || p.department_id) === String(selectedDeptId)
    );
  }, [allPositions, selectedDeptId]);

  // Mutation cập nhật vị trí
  const { mutate: handleSavePositions, isPending } = useMutation({
    mutationFn: async () => {
      if (!employee?.id) throw new Error('Không tìm thấy thông tin nhân sự');
      await setUserPositions(String(employee.id), selectedPositionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['department_members'] });
      toast.success(`Cập nhật chức vụ cho ${employee?.fullName || employee?.username} thành công`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi gán chức vụ cho nhân sự');
    },
  });

  const togglePosition = (posId: number) => {
    setSelectedPositionIds((prev) =>
      prev.includes(posId) ? prev.filter((id) => id !== posId) : [...prev, posId]
    );
  };

  const removePosition = (posId: number) => {
    setSelectedPositionIds((prev) => prev.filter((id) => id !== posId));
  };

  const deptOptions = departmentList.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  return (
    <div className="space-y-4 py-2">
      {/* Thông tin nhân viên */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
        <Avatar
          src={
            employee.avatar
              ? employee.avatar.startsWith('http')
                ? employee.avatar
                : `${BASE_MINIO_URL}${employee.avatar}`
              : undefined
          }
          name={employee.fullName || employee.username}
          size="md"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 text-sm truncate">
            {employee.fullName || employee.username}
          </span>
          <span className="text-xs text-slate-500 truncate">{employee.email}</span>
        </div>
      </div>

      {/* Chọn Phòng ban */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 select-none">
          Phòng ban trực thuộc
        </label>
        <Select
          placeholder={isLoadingDepts ? 'Đang tải phòng ban...' : '-- Tất cả phòng ban --'}
          options={deptOptions}
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
        />
      </div>

      {/* Danh sách các vị trí đã chọn */}
      {selectedPositionIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 select-none">
            Chức vụ đang chọn ({selectedPositionIds.length})
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-10">
            {selectedPositionIds.map((posId) => {
              const pos = allPositions.find((p) => p.id === posId);
              return (
                <span
                  key={posId}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                >
                  <Briefcase size={12} className="text-primary shrink-0" />
                  <span>{pos?.name || `Vị trí #${posId}`}</span>
                  <button
                    type="button"
                    onClick={() => removePosition(posId)}
                    className="text-slate-400 hover:text-red-600 rounded p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Chọn Vị trí trong danh sách */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 select-none">
          Danh sách vị trí {selectedDeptId ? 'thuộc phòng ban này' : ''}
        </label>
        <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-1 divide-y divide-gray-100 bg-white">
          {isLoadingPositions ? (
            <div className="p-3 text-center text-xs text-gray-400">Đang tải danh sách vị trí...</div>
          ) : filteredPositions.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400">
              Không có vị trí nào trong phòng ban này
            </div>
          ) : (
            filteredPositions.map((pos) => {
              const isSelected = selectedPositionIds.includes(pos.id);
              return (
                <div
                  key={pos.id}
                  onClick={() => togglePosition(pos.id)}
                  className={cn(
                    'p-2.5 flex items-center justify-between cursor-pointer rounded-md transition-colors',
                    isSelected ? 'bg-primary/5 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                    <span className="text-sm">{pos.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-primary shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 w-full pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button
          variant="primary"
          leftIcon={<Briefcase size={16} />}
          onClick={() => handleSavePositions()}
          loading={isPending}
        >
          Lưu chức vụ
        </Button>
      </div>
    </div>
  );
}

export default function PositionModal({
  isOpen,
  onClose,
  employee,
  defaultDepartmentId,
}: PositionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gán chức vụ / vị trí cho nhân sự"
      className="m-2 max-w-lg w-full"
    >
      {isOpen && employee ? (
        <PositionModalForm
          key={`${employee.id}-${defaultDepartmentId || 'all'}`}
          employee={employee}
          defaultDepartmentId={defaultDepartmentId}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
