'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Briefcase, UserMinus, ShieldAlert } from 'lucide-react';

import { TableData, TableAction } from '@/components/table';
import { Modal, Button, Badge, Avatar } from '@/components';
import { getEmployees, revokePositions, getUsers, setUserPositions } from '@/actions';
import { useQueryParam } from '@/hooks';
import type { Employee, User } from '@/types';
import queryClient from '@/utils/query';
import { BASE_MINIO_URL } from '@/config';

import PositionModal from '@/app/(auth)/app/(sidebar)/employees/_components/position-modal';

export default function DepartmentMembersPage() {
  const params = useParams();
  const departmentId = Number(params.id);
  const [search, setSearch] = useQueryParam('search');

  // Modal đổi vị trí nhân sự
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [selectedEmpForPos, setSelectedEmpForPos] = useState<Employee | null>(null);

  // Modal gỡ nhân sự khỏi phòng ban
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [empToRemove, setEmpToRemove] = useState<Employee | null>(null);

  // Modal Thêm nhân sự vào phòng ban
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<User | null>(null);

  // Fetcher lấy danh sách nhân sự của phòng ban hiện tại
  const fetcher = async (queryParam: { offset: number; limit: number }) => {
    const res = await getEmployees({
      ...queryParam,
      search: search || undefined,
      departmentId: departmentId,
    } as any);

    if (!res) {
      toast.error('Lỗi khi tải danh sách nhân sự');
      throw new Error('Lỗi khi tải danh sách nhân sự');
    }

    return {
      items: res.items || [],
      meta: {
        total: res.meta?.total || 0,
        offset: res.meta?.offset || 0,
        limit: res.meta?.limit || 10,
        next: res.meta?.next || false,
      },
    };
  };

  // Lấy danh sách toàn bộ người dùng để thêm vào phòng ban
  const { data: allUsersData, isLoading: isLoadingAllUsers } = useQuery({
    queryKey: ['users', 'all-for-department-add'],
    queryFn: () => getUsers({ limit: 200 }),
    enabled: isAddMemberOpen,
  });

  const allCompanyUsers: User[] = allUsersData?.items || [];

  // Mutation gỡ nhân sự khỏi phòng ban (gỡ các position thuộc phòng ban này)
  const { mutate: handleRemoveFromDepartment, isPending: isRemoving } = useMutation({
    mutationFn: async (emp: Employee) => {
      const deptPositions = (emp.positions || []).filter(
        (p: any) => Number(p.departmentId || p.department_id) === departmentId
      );
      const posIdsToRemove = deptPositions.map((p) => Number(p.id));

      if (posIdsToRemove.length > 0) {
        await revokePositions(String(emp.id), posIdsToRemove);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['department_members', departmentId] });
      toast.success('Đã gỡ nhân sự khỏi phòng ban thành công');
      setIsRemoveOpen(false);
      setEmpToRemove(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi gỡ nhân sự khỏi phòng ban');
    },
  });

  // Cấu hình các cột cho Desktop
  const columns: any[] = [
    {
      key: 'index',
      label: 'STT',
      width: '60px',
      cell: (_row: Employee, index: number) => <span className="text-slate-500">{index + 1}</span>,
    },
    {
      key: 'fullName',
      label: 'Nhân sự',
      minWidth: '220px',
      cell: (row: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={
              row.avatar
                ? row.avatar.startsWith('http')
                  ? row.avatar
                  : `${BASE_MINIO_URL}${row.avatar}`
                : undefined
            }
            name={row.fullName || row.username}
            size="sm"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.fullName || row.username}</span>
            <span className="text-xs text-gray-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'identifyCode',
      label: 'Mã nhân viên',
      minWidth: '130px',
      cell: (row: Employee) => (
        <span className="text-slate-700 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.identifyCode || 'NV'}
        </span>
      ),
    },
    {
      key: 'positions',
      label: 'Chức vụ trong phòng ban',
      minWidth: '180px',
      cell: (row: Employee) => {
        const deptPositions = (row.positions || []).filter(
          (p: any) => Number(p.departmentId || p.department_id) === departmentId
        );

        if (deptPositions.length === 0) {
          return <span className="text-gray-400 text-xs italic">Chưa chỉ định chức vụ</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {deptPositions.map((pos: any) => (
              <Badge key={pos.id} variant="info" size="sm">
                {pos.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'phoneNumber',
      label: 'Số điện thoại',
      minWidth: '130px',
      cell: (row: Employee) => (
        <span className="text-slate-600 text-sm">{row.phoneNumber || '---'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Employee) => (
        <TableAction
          items={[
            {
              title: 'Đổi chức vụ / vị trí',
              icon: Briefcase,
              size: 18,
              className: 'hover:text-blue-600 hover:bg-blue-50',
              onClick: () => {
                setSelectedEmpForPos(row);
                setIsPositionModalOpen(true);
              },
            },
            {
              title: 'Gỡ khỏi phòng ban',
              icon: UserMinus,
              size: 18,
              className: 'hover:text-red-600 hover:bg-red-50',
              onClick: () => {
                setEmpToRemove(row);
                setIsRemoveOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Employee, index: number) => {
    const deptPositions = (row.positions || []).filter(
      (p: any) => Number(p.departmentId || p.department_id) === departmentId
    );

    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={
                row.avatar
                  ? row.avatar.startsWith('http')
                    ? row.avatar
                    : `${BASE_MINIO_URL}${row.avatar}`
                  : undefined
              }
              name={row.fullName || row.username}
              size="md"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {row.fullName || row.username}
              </span>
              <span className="text-xs text-gray-400 truncate">{row.email}</span>
              {row.phoneNumber && (
                <span className="text-xs text-slate-500 mt-0.5">{row.phoneNumber}</span>
              )}
            </div>
          </div>

          <TableAction
            items={[
              {
                title: 'Đổi chức vụ / vị trí',
                icon: Briefcase,
                size: 18,
                className: 'hover:text-blue-600 hover:bg-blue-50',
                onClick: () => {
                  setSelectedEmpForPos(row);
                  setIsPositionModalOpen(true);
                },
              },
              {
                title: 'Gỡ khỏi phòng ban',
                icon: UserMinus,
                size: 18,
                className: 'hover:text-red-600 hover:bg-red-50',
                onClick: () => {
                  setEmpToRemove(row);
                  setIsRemoveOpen(true);
                },
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {row.identifyCode || 'NV'}
          </span>

          <div className="flex flex-wrap gap-1">
            {deptPositions.length > 0 ? (
              deptPositions.map((pos: any) => (
                <Badge key={pos.id} variant="info" size="sm">
                  {pos.name}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">Chưa chỉ định chức vụ</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Action */}
      <div className="flex items-center justify-end">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus size={16} />}
          onClick={() => setIsAddMemberOpen(true)}
        >
          Thêm nhân sự vào phòng ban
        </Button>
      </div>

      {/* Bảng nhân sự */}
      <TableData<Employee>
        queryKey={['department_members', departmentId, search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm nhân sự theo tên, mã, email...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Đổi chức vụ vị trí */}
      <PositionModal
        isOpen={isPositionModalOpen}
        onClose={() => {
          setIsPositionModalOpen(false);
          setSelectedEmpForPos(null);
        }}
        employee={selectedEmpForPos}
        defaultDepartmentId={departmentId}
      />

      {/* Modal Thêm nhân sự vào phòng ban */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setSelectedUserToAdd(null);
        }}
        title="Thêm nhân sự vào phòng ban"
        className="m-2 max-w-lg w-full"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500">
            Chọn một nhân sự trong công ty để gán vào vị trí của phòng ban này:
          </p>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
            {isLoadingAllUsers ? (
              <div className="p-4 text-center text-xs text-gray-400">Đang tải danh sách nhân sự...</div>
            ) : allCompanyUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">Không có nhân sự nào</div>
            ) : (
              allCompanyUsers.map((u) => {
                const isSelected = selectedUserToAdd?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserToAdd(u)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={
                          u.avatar
                            ? u.avatar.startsWith('http')
                              ? u.avatar
                              : `${BASE_MINIO_URL}${u.avatar}`
                            : undefined
                        }
                        name={u.fullName || u.username}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">
                          {u.fullName || u.username}
                        </span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </div>
                    </div>

                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddMemberOpen(false);
                        setSelectedEmpForPos(u as any);
                        setIsPositionModalOpen(true);
                      }}
                    >
                      Gán vị trí
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Xác nhận gỡ nhân sự khỏi phòng ban */}
      <Modal
        isOpen={isRemoveOpen}
        onClose={() => {
          setIsRemoveOpen(false);
          setEmpToRemove(null);
        }}
        title="Xác nhận gỡ nhân sự"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-3 items-start py-2">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn gỡ nhân sự{' '}
            <strong className="text-gray-900 font-semibold">
              {empToRemove?.fullName || empToRemove?.username}
            </strong>{' '}
            khỏi phòng ban này? Tất cả các vị trí của nhân sự trong phòng ban sẽ bị hủy bỏ.
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsRemoveOpen(false);
              setEmpToRemove(null);
            }}
            disabled={isRemoving}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (empToRemove) {
                handleRemoveFromDepartment(empToRemove);
              }
            }}
            loading={isRemoving}
          >
            Xác nhận gỡ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
