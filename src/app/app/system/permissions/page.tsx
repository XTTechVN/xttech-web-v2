'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import PermissionTable from './_components/PermissionTable';
import PermissionModal, { PermissionFormData } from './_components/PermissionModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { PlusIcon } from 'lucide-react';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { Permission } from '@/types/shared/permission';

export default function PermissionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [selectedPermissionId, setSelectedPermissionId] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<Permission | undefined>(undefined);

  const handleAddPermission = async (data: PermissionFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/permissions', data);
      toast.success('Thêm quyền hạn thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm quyền hạn thất bại';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleEditPermission = async (data: PermissionFormData) => {
    setIsLoading(true);
    try {
      await api.put(`/api/v1/permissions/${selectedPermissionId}`, data);
      toast.success('Cập nhật quyền hạn thành công');
      setIsModalOpen(false);
      setIsEdit(false);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật quyền hạn thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/permissions/${id}`);
      toast.success('Xóa quyền hạn thành công');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa quyền hạn thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: '/app/system/users', label: 'Quản lý người dùng' },
          { path: '/app/system/roles', label: 'Quản lý vai trò' },
          { label: 'Quản lý quyền hạn' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Quản lý quyền hạn</Heading>
        <SubHeading>Danh sách quyền hạn và chức năng hiện có trong hệ thống</SubHeading>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <Search
            size="sm"
            className="w-full md:w-96"
            placeholder="Tìm kiếm quyền hạn..."
            onChange={(val) => setSearchVal(val)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-fit">
          <Button
            size="sm"
            onClick={() => {
              setDefaultValues(undefined);
              setIsEdit(false);
              setIsModalOpen(true);
            }}
            icon={<PlusIcon size={16} />}
          >
            Thêm quyền hạn
          </Button>
        </div>
      </div>

      {/* Table */}
      <PermissionTable
        searchQuery={searchVal}
        onDelete={(id) => {
          setSelectedPermissionId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(perm: Permission) => {
          setDefaultValues(perm);
          setSelectedPermissionId(perm.id);
          setIsEdit(true);
          setIsModalOpen(true);
        }}
      />

      {/* Modals */}
      <>
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PermissionModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onSave={isEdit ? handleEditPermission : handleAddPermission}
            defaultValues={isEdit ? defaultValues : undefined}
          />
        </ModalWrapper>

        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Quyền Hạn"
            description="Bạn có chắc chắn muốn xóa quyền hạn này?\nThao tác này sẽ thu hồi quyền hạn khỏi tất cả vai trò đang liên kết."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeletePermission(selectedPermissionId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
