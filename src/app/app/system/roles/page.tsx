'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import RoleTable from './_components/RoleTable';
import RoleModal, { RoleFormData } from './_components/RoleModal';
import RolePermissionsModal from './_components/RolePermissionsModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { PlusIcon, Key } from 'lucide-react';

// Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { Role } from '@/types/shared/role';

export default function RolesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [defaultValues, setDefaultValues] = useState<Role | undefined>(undefined);

  const handleAddRole = async (data: RoleFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/roles', data);
      toast.success('Thêm vai trò thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm vai trò thất bại';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleEditRole = async (data: RoleFormData) => {
    setIsLoading(true);
    try {
      await api.put(`/api/v1/roles/${selectedRoleId}`, data);
      toast.success('Cập nhật vai trò thành công');
      setIsModalOpen(false);
      setIsEdit(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật vai trò thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/roles/${id}`);
      toast.success('Xóa vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa vai trò thất bại';
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
          { label: 'Quản lý vai trò' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Quản lý vai trò</Heading>
        <SubHeading>Danh sách vai trò và phân quyền hạn cho người dùng hệ thống</SubHeading>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <Search
            size="sm"
            className="w-full md:w-96"
            placeholder="Tìm kiếm vai trò..."
            onChange={(val) => setSearchVal(val)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-fit">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/app/system/permissions')}
            icon={<Key size={16} />}
          >
            Quản lý quyền hạn
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setDefaultValues(undefined);
              setIsEdit(false);
              setIsModalOpen(true);
            }}
            icon={<PlusIcon size={16} />}
          >
            Thêm vai trò
          </Button>
        </div>
      </div>

      {/* Table */}
      <RoleTable
        searchQuery={searchVal}
        onDelete={(id) => {
          setSelectedRoleId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(role: Role) => {
          setDefaultValues(role);
          setSelectedRoleId(role.id);
          setIsEdit(true);
          setIsModalOpen(true);
        }}
        onManagePermissions={(role: Role) => {
          setSelectedRole(role);
          setIsPermissionsModalOpen(true);
        }}
      />

      {/* Modals */}
      <>
        {/* Add/Edit Role Info Modal */}
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <RoleModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onSave={isEdit ? handleEditRole : handleAddRole}
            defaultValues={isEdit ? defaultValues : undefined}
          />
        </ModalWrapper>

        {/* Manage Permissions for Role Modal */}
        <ModalWrapper
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
        >
          {selectedRole && (
            <RolePermissionsModal
              role={selectedRole}
              onClose={() => setIsPermissionsModalOpen(false)}
            />
          )}
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Vai Trò"
            description="Bạn có chắc chắn muốn xóa vai trò này? Tất cả người dùng đang gán vai trò này sẽ không còn quyền hạn tương ứng."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteRole(selectedRoleId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}