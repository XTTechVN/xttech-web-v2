'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import SpaceToolbar from './_components/SpaceToolbar';
import SpaceTable from './_components/SpaceTable';
import SpaceAddModal, { SpaceAddFormData } from './_components/SpaceAddModal';
import SpaceEditModal, { SpaceEditFormData } from './_components/SpaceEditModal';
import SpaceUsersModal from './_components/SpaceUsersModal';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { Space } from '@/types/shared/space';

export default function SpacesPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  // Selection states
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');
  const [editDefaultValues, setEditDefaultValues] = useState<Space | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleAddSpace = async (data: SpaceAddFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/spaces', {
        name: data.name,
        spaceId: data.spaceId,
        parentId: data.parentId || null,
        meta: {
          description: data.description || '',
        },
      });
      toast.success('Thêm khu vực thành công');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSpace = async (data: SpaceEditFormData) => {
    setIsLoading(true);
    try {
      await api.patch(`/api/v1/spaces/${selectedSpaceId}`, {
        name: data.name,
        parentId: data.parentId || null,
        meta: {
          description: data.description || '',
        },
      });
      toast.success('Cập nhật khu vực thành công');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/spaces/${selectedSpaceId}`);
      toast.success('Xóa khu vực thành công');
      setIsConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['spaces-flat'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa khu vực thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Quản lý khu vực</Heading>
        <SubHeading>
          Quản lý danh sách các khu vực, phân khu, phòng ban trực thuộc hệ thống giám sát.
        </SubHeading>
      </div>

      {/* Toolbar */}
      <SpaceToolbar
        onAdd={() => setIsAddOpen(true)}
        onChangeSearch={(val) => setSearchQuery(val)}
      />

      {/* Table */}
      <SpaceTable
        searchQuery={searchQuery}
        onDelete={(id, name) => {
          setSelectedSpaceId(id);
          setSelectedSpaceName(name);
          setIsConfirmOpen(true);
        }}
        onEdit={(space) => {
          setEditDefaultValues(space);
          setSelectedSpaceId(space.id);
          setIsEditOpen(true);
        }}
        onAssignUsers={(space) => {
          setSelectedSpaceId(space.id);
          setSelectedSpaceName(space.name);
          setIsUsersOpen(true);
        }}
      />

      {/* Modals */}
      <>
        {/* Add Modal */}
        <ModalWrapper isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
          <SpaceAddModal
            isLoading={isLoading}
            onClose={() => setIsAddOpen(false)}
            onAdd={handleAddSpace}
          />
        </ModalWrapper>

        {/* Edit Modal */}
        <ModalWrapper isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <SpaceEditModal
            isLoading={isLoading}
            onClose={() => setIsEditOpen(false)}
            onEdit={handleEditSpace}
            defaultValues={editDefaultValues}
          />
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa khu vực"
            description={`Bạn có chắc chắn muốn xóa khu vực "${selectedSpaceName}"? Hành động này sẽ xóa toàn bộ các phân khu trực thuộc và không thể hoàn tác.`}
            isLoading={isLoading}
            onCancel={() => setIsConfirmOpen(false)}
            onConfirm={handleDeleteSpace}
          />
        </ModalWrapper>

        {/* Space Users Modal */}
        <ModalWrapper isOpen={isUsersOpen} onClose={() => setIsUsersOpen(false)}>
          <SpaceUsersModal
            spaceId={selectedSpaceId}
            spaceName={selectedSpaceName}
            onClose={() => setIsUsersOpen(false)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
