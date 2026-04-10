'use client';

// Components
import AlertHeading from './_components/AlertHeading';
import AlertTable from './_components/AlertTable';
import AlertToolbar from './_components/AlertToolbar';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { featureNotImplemented } from '@/utils/toast';

// Types
import { Alert } from '@/types/shared/alert';

export default function AlertPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');

  const handleDeleteAlert = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/events/${id}`);
      toast.success('Xóa cảnh báo thành công');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      toast.error('Xóa cảnh báo thất bại');
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <AlertHeading />

      {/* Toolbar */}
      <AlertToolbar onExport={featureNotImplemented} />

      {/* Table */}
      <AlertTable
        onDelete={(id) => {
          setSelectedAlertId(id);
          setIsModalConfirmOpen(true);
        }}
        onView={(alert: Alert) => {
          featureNotImplemented();
        }}
      />

      {/* Modals */}
      <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
        <ModalConfirm
          title="Xóa cảnh báo"
          description="Bạn có chắc chắn muốn xóa lịch sử cảnh báo này? Hành động này không thể hoàn tác."
          isLoading={isLoading}
          onCancel={() => setIsModalConfirmOpen(false)}
          onConfirm={() => handleDeleteAlert(selectedAlertId)}
        />
      </ModalWrapper>
    </div>
  );
}
