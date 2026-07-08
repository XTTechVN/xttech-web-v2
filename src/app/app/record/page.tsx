'use client';

// Components
import RecordHeading from './_components/RecordHeading';
import RecordTable from './_components/RecordTable';
import RecordToolbar from './_components/RecordToolbar';
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
import { Record } from '@/types/shared/event';

interface RecordPageProps {
  title?: string;
  description?: string;
  search?: string;
}

export default function RecordPage({
  title = 'Danh sách bản ghi',
  description = 'Quản lý lịch sử các bản ghi hình từ hệ thống camera',
  search = '',
}: RecordPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');

  const handleDeleteAlert = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/records/${id}`);
      toast.success('Xóa bản ghi thành công');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      toast.error('Xóa bản ghi thất bại');
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <RecordHeading title={title} description={description} />

      {/* Toolbar */}
      <RecordToolbar onExport={featureNotImplemented} placeholder={`Tìm kiếm trong ${title.toLowerCase()}...`} />

      {/* Table */}
      <RecordTable
        search={search}
        onDelete={(id) => {
          setSelectedAlertId(id);
          setIsModalConfirmOpen(true);
        }}
        onView={(alert: Record) => {
          featureNotImplemented();
        }}
      />

      {/* Modals */}
      <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
        <ModalConfirm
          title="Xóa bản ghi"
          description="Bạn có chắc chắn muốn xóa lịch sử bản ghi này? Hành động này không thể hoàn tác."
          isLoading={isLoading}
          onCancel={() => setIsModalConfirmOpen(false)}
          onConfirm={() => handleDeleteAlert(selectedAlertId)}
        />
      </ModalWrapper>
    </div>
  );
}
