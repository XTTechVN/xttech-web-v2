'use client';

// Components
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import WorkerHeading from './_components/WorkerHeading';
import WorkerTable from './_components/WorkerTable';
import WorkerToolbar from './_components/WorkerToolbar';
import WorkerAddModal from './_components/WorkerAddModal';
import WorkerEditModal from './_components/WorkerEditModal';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { featureNotImplemented } from '@/utils/toast';

// Types
import { Worker, WorkerFormModalData } from '@/types/shared/worker';

export default function WorkerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<Worker | undefined>(undefined);

  const handleAddWorker = async (data: WorkerFormModalData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/workers', data);
      toast.success('Thêm worker thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    } catch (error) {
      toast.error('Thêm worker thất bại');
      setIsLoading(false);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/workers/${id}`);
      toast.success('Xóa worker thành công');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    } catch (error) {
      toast.error('Xóa worker thất bại');
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  const handleEditWorker = async (data: WorkerFormModalData) => {
    setIsLoading(true);
    try {
      await api.patch(`/api/v1/workers/${selectedWorkerId}`, data);
      toast.success('Cập nhật worker thành công');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    } catch (error) {
      toast.error('Cập nhật worker thất bại');
    } finally {
      setIsLoading(false);
      setIsEdit(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <WorkerHeading />

      {/* Toolbar */}
      <WorkerToolbar 
        onAdd={() => setIsModalOpen(true)} 
        onExport={featureNotImplemented} 
      />

      {/* Table */}
      <WorkerTable
        onDelete={(id) => {
          setSelectedWorkerId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(worker: Worker) => {
          setDefaultValues(worker);
          setSelectedWorkerId(worker.id);
          setIsEdit(true);
        }}
        onView={(worker: Worker) => {
          featureNotImplemented();
        }}
      />

      {/* Modals */}
      <>
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <WorkerAddModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddWorker}
          />
        </ModalWrapper>
        
        <ModalWrapper isOpen={isEdit} onClose={() => setIsEdit(false)}>
          <WorkerEditModal
            isLoading={isLoading}
            onClose={() => setIsEdit(false)}
            onEdit={handleEditWorker}
            defaultValues={defaultValues}
          />
        </ModalWrapper>

        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Worker"
            description="Bạn có chắc chắn muốn xóa worker này? Các camera đang kết nối với worker này có thể bị gián đoạn."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteWorker(selectedWorkerId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
