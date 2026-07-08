'use client';

// Components
import EventHeading from './_components/EventHeading';
import EventTable from './_components/EventTable';
import EventToolbar from './_components/EventToolbar';
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

interface EventPageProps {
  title?: string;
  description?: string;
  search?: string;
}

export default function EventPage({
  title = 'Danh sách sự kiện',
  description = 'Quản lý lịch sử các sự kiện từ hệ thống camera',
  search = '',
}: EventPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');

  const handleDeleteAlert = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/records/${id}`);
      toast.success('Xóa sự kiện thành công');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      toast.error('Xóa sự kiện thất bại');
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <EventHeading title={title} description={description} />

      {/* Toolbar */}
      <EventToolbar onExport={featureNotImplemented} placeholder={`Tìm kiếm trong ${title.toLowerCase()}...`} />

      {/* Table */}
      <EventTable
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
          title="Xóa sự kiện"
          description="Bạn có chắc chắn muốn xóa lịch sử sự kiện này? Hành động này không thể hoàn tác."
          isLoading={isLoading}
          onCancel={() => setIsModalConfirmOpen(false)}
          onConfirm={() => handleDeleteAlert(selectedAlertId)}
        />
      </ModalWrapper>
    </div>
  );
}
