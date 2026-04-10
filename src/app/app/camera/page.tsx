'use client';

// Components
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import CameraHeading from './_components/CameraHeading';
import CameraTable from './_components/CameraTable';
import CameraToolbar from './_components/CameraToolbar';
import CameraAddModal from './_components/CameraAddModal';
import CameraEditModal from './_components/CameraEditModal';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { featureNotImplemented } from '@/utils/toast';

// Types
import { Camera } from '@/types/shared/camera';
import { CameraFormModalData } from './_components/CameraAddModal';

export default function CameraPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<CameraFormModalData | undefined>(undefined);

  const handleAddCamera = async (data: CameraFormModalData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/cameras', data);
      toast.success('Thêm camera thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['cameras'] });
    } catch (error) {
      toast.error('Thêm camera thất bại');
      setIsLoading(false);
    }
  };

  const handleDeleteCamera = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/cameras/${id}`);
      toast.success('Xóa camera thành công');
      queryClient.invalidateQueries({ queryKey: ['cameras'] });
    } catch (error) {
      toast.error('Xóa camera thất bại');
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  const handleEditCamera = async (data: CameraFormModalData) => {
    setIsLoading(true);
    try {
      await api.patch(`/api/v1/cameras/${selectedCameraId}`, data);
      toast.success('Cập nhật camera thành công');
      queryClient.invalidateQueries({ queryKey: ['cameras'] });
    } catch (error) {
      toast.error('Cập nhật camera thất bại');
    } finally {
      setIsLoading(false);
      setIsEdit(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <CameraHeading />

      {/* Toolbar */}
      <CameraToolbar onAdd={() => setIsModalOpen(true)} onExport={featureNotImplemented} />

      {/* Table */}
      <CameraTable
        onDelete={(id) => {
          setSelectedCameraId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(cam: Camera) => {
          setIsEdit(true);
          setDefaultValues(cam);
        }}
        onView={(cam: Camera) => {
          featureNotImplemented();
        }}
      />

      {/* Modals */}
      <>
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <CameraAddModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddCamera}
          />
        </ModalWrapper>
        <ModalWrapper isOpen={isEdit} onClose={() => setIsEdit(false)}>
          <CameraEditModal
            isLoading={isLoading}
            onClose={() => setIsEdit(false)}
            onEdit={handleEditCamera}
            defaultValues={defaultValues}
          />
        </ModalWrapper>
        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa camera"
            description="Bạn có chắc chắn muốn xóa camera này?"
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteCamera(selectedCameraId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
