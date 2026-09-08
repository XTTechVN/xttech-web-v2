'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Avatar, Select } from '@/components';
import { Briefcase, Check, X, Building2, AlertTriangle } from 'lucide-react';
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
  // Lấy thông tin vị trí và phòng ban hiện tại của nhân sự (nếu có)
  const currentPos = (employee.positions && employee.positions.length > 0) ? (employee.positions[0] as any) : null;
  const currentDeptId = currentPos ? (currentPos.departmentId || currentPos.department_id || currentPos.department?.id) : null;

  // Khởi tạo phòng ban ban đầu
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (defaultDepartmentId) return String(defaultDepartmentId);
    if (currentDeptId) return String(currentDeptId);
    return '';
  });

  // Mỗi nhân viên chỉ chọn tối đa 1 vị trí (chỉ pre-select nếu vị trí hiện tại thuộc đúng phòng ban đang chọn)
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(() => {
    if (currentPos && currentDeptId) {
      const initialDept = defaultDepartmentId ? String(defaultDepartmentId) : String(currentDeptId);
      if (String(currentDeptId) === initialDept) {
        return Number(currentPos.id);
      }
    }
    return null;
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

  const departmentList: Department[] = useMemo(() => deptsData?.items || [], [deptsData?.items]);
  const allPositions: Position[] = useMemo(() => positionsData?.items || [], [positionsData?.items]);

  // Lọc danh sách vị trí theo phòng ban được chọn (chỉ hiển thị khi đã chọn phòng ban)
  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return [];
    return allPositions.filter(
      (p: any) => String(p.departmentId || p.department_id || p.department?.id) === String(selectedDeptId)
    );
  }, [allPositions, selectedDeptId]);

  // Tìm object vị trí đang được chọn
  const selectedPosObj = useMemo(() => {
    if (!selectedPositionId) return null;
    return allPositions.find((p) => Number(p.id) === selectedPositionId) || null;
  }, [allPositions, selectedPositionId]);

  // Tìm tên phòng ban cũ nếu nhân sự đang ở phòng ban khác
  const currentDeptObj = useMemo(() => {
    if (!currentDeptId) return null;
    return departmentList.find((d) => String(d.id) === String(currentDeptId)) || null;
  }, [departmentList, currentDeptId]);

  // Mutation cập nhật vị trí cho nhân viên
  const { mutate: handleSavePositions, isPending } = useMutation({
    mutationFn: async () => {
      if (!employee?.id) throw new Error('Không tìm thấy thông tin nhân sự');
      // Gửi danh sách gồm đúng 1 vị trí được chọn hoặc rỗng nếu bỏ chọn
      const positionIds = selectedPositionId ? [selectedPositionId] : [];
      await setUserPositions(String(employee.id), positionIds);
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

  const handleSelectPosition = (posId: number) => {
    setSelectedPositionId((prev) => (prev === posId ? null : posId));
  };

  const deptOptions = departmentList.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const isSwitchingDepartment = currentDeptId && selectedDeptId && String(currentDeptId) !== String(selectedDeptId);

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

      {/* Cảnh báo chuyển phòng ban nếu nhân sự đang ở phòng ban khác */}
      {isSwitchingDepartment && (
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Nhân sự này hiện đang giữ chức vụ{' '}
            <span className="font-bold text-amber-950">{currentPos?.name || 'Chức vụ'}</span> tại phòng ban{' '}
            <span className="font-bold text-amber-950">{currentDeptObj?.name || `Phòng ban #${currentDeptId}`}</span>.
            Khi chọn chức vụ mới ở đây, nhân sự sẽ được chuyển sang phòng ban này.
          </div>
        </div>
      )}

      {/* Chọn Phòng ban */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 select-none">
          Phòng ban trực thuộc
        </label>
        <Select
          placeholder={isLoadingDepts ? 'Đang tải phòng ban...' : '-- Chọn phòng ban --'}
          options={deptOptions}
          value={selectedDeptId}
          onChange={(e) => {
            const newDeptId = e.target.value;
            setSelectedDeptId(newDeptId);
            // Khi đổi sang phòng ban khác, bỏ chọn vị trí cũ nếu không thuộc phòng ban mới
            if (selectedPositionId) {
              const pos = allPositions.find((p) => Number(p.id) === selectedPositionId);
              const posDeptId = pos ? String((pos as any).departmentId || (pos as any).department_id || (pos as any).department?.id) : '';
              if (posDeptId !== newDeptId) {
                setSelectedPositionId(null);
              }
            }
          }}
        />
      </div>

      {/* Vị trí đang chọn (Single Select) */}
      {selectedPositionId && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 select-none">
            Chức vụ đang chọn (Tối đa 1 chức vụ)
          </label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Briefcase size={14} className="text-primary shrink-0" />
              <span>{selectedPosObj?.name || `Vị trí #${selectedPositionId}`}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedPositionId(null)}
              className="text-slate-400 hover:text-red-600 rounded p-1 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1"
              title="Bỏ chọn chức vụ"
            >
              <X size={13} />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Chọn Vị trí trong danh sách */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 select-none">
          Danh sách vị trí {selectedDeptId ? 'thuộc phòng ban này' : ''}
        </label>
        
        {!selectedDeptId ? (
          <div className="p-8 border border-dashed border-gray-200 rounded-lg bg-gray-50/60 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Building2 size={18} />
            </div>
            <p className="text-xs font-medium text-gray-500">
              Vui lòng chọn phòng ban ở trên để xem danh sách chức vụ
            </p>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-gray-200 rounded-lg p-1 divide-y divide-gray-100 bg-white">
            {isLoadingPositions ? (
              <div className="p-4 text-center text-xs text-gray-400">Đang tải danh sách vị trí...</div>
            ) : filteredPositions.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <Briefcase size={18} />
                <p className="text-xs">Phòng ban này hiện chưa có vị trí chức vụ nào</p>
              </div>
            ) : (
              filteredPositions.map((pos) => {
                const isSelected = selectedPositionId === pos.id;
                return (
                  <div
                    key={pos.id}
                    onClick={() => handleSelectPosition(pos.id)}
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
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 w-full pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSavePositions()}
          loading={isPending}
          disabled={isPending || !selectedPositionId}
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
