'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import UserTable from './_components/UserTable';
import UserModal, { UserFormData } from './_components/UserModal';
import UserRolesModal from './_components/UserRolesModal';
import UserProjectModal from './_components/UserProjectModal';
import { PlusIcon, Shield } from 'lucide-react';

// Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { User } from '@/types/shared/user';

export default function UsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isSpacesModalOpen, setIsSpacesModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [defaultValues, setDefaultValues] = useState<User | undefined>(undefined);

  const handleAddUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/users', data);
      toast.success('Thêm người dùng thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm người dùng thất bại';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await api.put(`/api/v1/users/${selectedUserId}`, data);
      toast.success('Cập nhật người dùng thành công');
      setIsModalOpen(false);
      setIsEdit(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật người dùng thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/users/${id}`);
      toast.success('Xóa người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa người dùng thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Quản lý người dùng</Heading>
        <SubHeading>Danh sách người dùng hiện có trong hệ thống và phân quyền chức năng</SubHeading>
      </div>

      {/* Toolbar */}
      {!isForbidden && (
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-fit">
            <Search
              size="sm"
              className="w-full md:w-96"
              placeholder="Tìm kiếm người dùng..."
              onChange={(val) => setSearchVal(val)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-fit">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/app/system/roles')}
              icon={<Shield size={16} />}
            >
              Quản lý vai trò
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
              Thêm người dùng
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <UserTable
        searchQuery={searchVal}
        onForbiddenChange={setIsForbidden}
        onDelete={(id) => {
          setSelectedUserId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(user: User) => {
          setDefaultValues(user);
          setSelectedUserId(user.id);
          setIsEdit(true);
          setIsModalOpen(true);
        }}
        onManageRoles={(user: User) => {
          setSelectedUser(user);
          setIsRolesModalOpen(true);
        }}
        onManageProjects={(user: User) => {
          setSelectedUser(user);
          setIsSpacesModalOpen(true);
        }}
      />

      {/* Modals */}
      <>
        {/* Add/Edit User Info Modal */}
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <UserModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onSave={isEdit ? handleEditUser : handleAddUser}
            defaultValues={isEdit ? defaultValues : undefined}
          />
        </ModalWrapper>

        {/* Manage Roles for User Modal */}
        <ModalWrapper isOpen={isRolesModalOpen} onClose={() => setIsRolesModalOpen(false)}>
          {selectedUser && (
            <UserRolesModal user={selectedUser} onClose={() => setIsRolesModalOpen(false)} />
          )}
        </ModalWrapper>

        {/* Manage Spaces for User Modal */}
        <ModalWrapper isOpen={isSpacesModalOpen} onClose={() => setIsSpacesModalOpen(false)}>
          {selectedUser && (
            <UserProjectModal user={selectedUser} onClose={() => setIsSpacesModalOpen(false)} />
          )}
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Người Dùng"
            description="Bạn có chắc chắn muốn xóa tài khoản người dùng này? Thao tác này không thể hoàn tác."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteUser(selectedUserId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
