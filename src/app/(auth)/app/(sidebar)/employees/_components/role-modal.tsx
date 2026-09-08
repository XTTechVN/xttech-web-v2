/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Button, Avatar } from '@/components';
import { UserCog, ChevronDown, Check } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRoles } from '@/actions/role';
import { assignRole, revokeRole } from '@/actions/user';
import type { Employee, Role } from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { BASE_MINIO_URL } from '@/config';
import { cn } from '@/utils/cn';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function RoleModal({ isOpen, onClose, employee }: RoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
    transform: string;
  }>({ top: 0, left: 0, width: 0, transform: 'none' });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách tất cả các vai trò trong hệ thống
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles({ limit: 100 }),
    enabled: isOpen,
  });

  const allRoles: Role[] = useMemo(() => rolesData?.items ?? [], [rolesData?.items]);

  // Đồng bộ vai trò hiện tại của nhân viên khi mở Modal (mặc định role employee nếu chưa có)
  useEffect(() => {
    if (employee && employee.roles && employee.roles.length > 0) {
      setSelectedRoleId(String(employee.roles[0].id));
    } else {
      const defaultRole = allRoles.find((r) => r.code?.toLowerCase() === 'employee');
      if (defaultRole) {
        setSelectedRoleId(String(defaultRole.id));
      } else {
        setSelectedRoleId(null);
      }
    }
    setIsDropdownOpen(false);
  }, [employee, isOpen, allRoles]);

  // Cập nhật vị trí dropdown nổi (tránh bị overflow/clip bởi modal)
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 240;

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownStyle({
          top: rect.top - 4,
          left: rect.left,
          width: rect.width,
          transform: 'translateY(-100%)',
        });
      } else {
        setDropdownStyle({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          transform: 'none',
        });
      }
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isDropdownOpen, selectedRoleId]);

  // Xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Mutation gọi API gán vai trò cho người dùng: không cho phép rỗng, mặc định là role employee
  const { mutate: handleAssignRoles, isPending } = useMutation({
    mutationFn: async () => {
      if (!employee?.id) throw new Error('Không tìm thấy thông tin nhân sự');

      const defaultRole = allRoles.find((r) => r.code?.toLowerCase() === 'employee');
      const targetRoleId = selectedRoleId || (defaultRole ? String(defaultRole.id) : null);

      if (!targetRoleId) {
        throw new Error('Vui lòng chọn vai trò cho nhân viên (mặc định: Nhân viên)');
      }

      const oldRoleIds = employee.roles ? employee.roles.map((r) => String(r.id)) : [];

      // 1. Xóa tất cả các vai trò cũ của nhân viên nếu có
      if (oldRoleIds.length > 0) {
        await revokeRole(employee.id, oldRoleIds);
      }

      // 2. Luôn gán vai trò hợp lệ (mặc định: employee)
      await assignRole(employee.id, [targetRoleId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Cập nhật vai trò cho ${employee?.fullName || employee?.username} thành công`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi phân vai trò cho người dùng');
    },
  });

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDropdownOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gán vai trò cho nhân viên"
      className="m-2 max-w-lg w-full"
      disabled={isPending}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => handleAssignRoles()}
            loading={isPending}
          >
            Lưu vai trò
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Thông tin nhân viên */}
        {employee && (
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
        )}

        {/* Select Single Vai trò */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 select-none">
            Vai trò áp dụng (Tối đa 1 vai trò)
          </label>

          <div className="relative w-full">
            {/* Single-select Trigger Box */}
            <div
              ref={triggerRef}
              onClick={() => !isPending && setIsDropdownOpen((prev) => !prev)}
              className={cn(
                'min-h-10 w-full pl-3 pr-10 py-2 text-sm bg-white border rounded-md transition-all duration-200 cursor-pointer flex items-center justify-between',
                'hover:border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200',
                isPending && 'bg-gray-50 text-gray-400 pointer-events-none'
              )}
            >
              {!selectedRoleId ? (
                <span className="text-gray-400 select-none text-sm">
                  {isLoadingRoles ? 'Đang tải danh sách vai trò...' : 'Chọn vai trò (Mặc định: Nhân viên)'}
                </span>
              ) : (
                (() => {
                  const selectedRole =
                    allRoles.find((r) => String(r.id) === selectedRoleId) ||
                    employee?.roles?.find((r) => String(r.id) === selectedRoleId);
                  const roleName = selectedRole?.name || `Vai trò #${selectedRoleId}`;

                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                      <span>{roleName}</span>
                    </span>
                  );
                })()
              )}
            </div>

            {/* Custom Arrow Icon */}
            <div className="absolute top-3 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown
                size={16}
                className={cn('transition-transform duration-200', isDropdownOpen && 'rotate-180')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu Portal */}
      {isDropdownOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
              transform: dropdownStyle.transform,
              zIndex: 9999,
            }}
            className="max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1 text-sm"
          >
            {isLoadingRoles ? (
              <div className="px-3 py-2 text-center text-xs text-gray-400">
                Đang tải danh sách vai trò...
              </div>
            ) : allRoles.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-gray-400">
                Không có vai trò nào
              </div>
            ) : (
              allRoles.map((role) => {
                const isSelected = selectedRoleId === String(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(String(role.id))}
                    className={cn(
                      'px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors',
                      isSelected ? 'bg-primary/5 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{role.name}</span>
                      {role.description ? (
                        <span className="text-xs text-gray-400">{role.description}</span>
                      ) : role.code ? (
                        <span className="text-[11px] text-gray-400">{role.code}</span>
                      ) : null}
                    </div>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </Modal>
  );
}

