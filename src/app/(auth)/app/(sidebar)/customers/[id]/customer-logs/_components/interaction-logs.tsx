import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button, Modal } from '@/components';

// Config của dữ liệu khách hàng
import { getCustomerLogChannelLabel, getCustomerLogStatusLabel, getCustomerLogTypeLabel, getCustomerLogStatusColor } from '@/app/(auth)/app/(sidebar)/customers/config';

import type { CustomerLog } from '@/types';

import { TableData, TableAction } from '@/components/table';

import { getCustomerLogs, deleteCustomerLog } from '@/actions';

import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import queryClient from '@/utils/query';

import { LogFormModal } from './log-form-modal';

interface InteractionLogsProps {
  customerId: number;
}

export const InteractionLogs = ({ customerId }: InteractionLogsProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<CustomerLog | null>(null);

  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CustomerLog | null>(null);

  // Xóa lượt tương tác
  const deleteMutation = useMutation({
    mutationFn: deleteCustomerLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-logs', customerId] });
      toast.success('Xóa lượt tương tác thành công');
      setIsDeleteOpen(false);
      setLogToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa lượt tương tác');
    },
  });

  // Xóa lấy thông tin
  const handleDeleteClick = (log: CustomerLog) => {
    setLogToDelete(log);
    setIsDeleteOpen(true);
  };

  // Lấy danh sách lựot tương tác
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    try {
      const res = await getCustomerLogs(customerId, { offset, limit });
      return res;
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lịch sử tương tác');
      throw error;
    }
  };

  // Cấu hình danh sách
  const columns = [
    {
      key: 'date',
      label: 'Ngày tạo',
      minWidth: '120px',
      cell: (row: CustomerLog) => <span className="text-sm font-semibold text-gray-900">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>,
    },
    {
      key: 'type',
      label: 'Loại tương tác',
      minWidth: '200px',
      cell: (row: CustomerLog) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700">{getCustomerLogChannelLabel(row.channel || row.type)}</span>
          <span className="text-xs font-normal text-gray-500">{getCustomerLogTypeLabel(row.type)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '150px',
      cell: (row: CustomerLog) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full border whitespace-nowrap ${getCustomerLogStatusColor(row.status)}`}>
          {getCustomerLogStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '200px',
      cell: (row: CustomerLog) => <span className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-2">{row.note || '-'}</span>,
    },
    {
      key: 'nextFollowDate',
      label: 'Ngày hẹn tiếp',
      minWidth: '140px',
      cell: (row: CustomerLog) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.nextFollowDate ? new Date(row.nextFollowDate).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '100px',
      cell: (row: CustomerLog) => (
        <TableAction
          onEdit={() => {
            setSelectedLog(row);
            setIsLogFormOpen(true);
          }}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  // Cấu hình danh sách render card mobile
  const renderCard = (row: CustomerLog, index: number) => (
    <div key={row.id || index} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">{getCustomerLogChannelLabel(row.channel || row.type)}</span>
          <span className="text-xs text-gray-500 mt-0.5">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full border whitespace-nowrap ${getCustomerLogStatusColor(row.status)}`}>
          {getCustomerLogStatusLabel(row.status)}
        </span>
      </div>
      <div className="text-xs text-gray-600">{getCustomerLogTypeLabel(row.type)}</div>
      {row.nextFollowDate && (
        <div className="text-xs text-gray-600 flex items-center gap-1.5">
          <span className="font-medium">Ngày hẹn tiếp theo:</span>
          <span className="font-semibold text-primary">{new Date(row.nextFollowDate).toLocaleDateString('vi-VN')}</span>
        </div>
      )}
      {row.note && <div className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 whitespace-pre-wrap">{row.note}</div>}
      <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            setSelectedLog(row);
            setIsLogFormOpen(true);
          }}
          className="text-primary hover:bg-primary/5 px-2 h-6"
        >
          Sửa
        </Button>
        <Button variant="ghost" size="xs" onClick={() => handleDeleteClick(row)} className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2 h-6">
          Xóa
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Lịch sử tương tác</h3>
        <Button
          variant="ghost"
          size="sm"
          className="bg-transparent text-primary hover:bg-transparent hover:opacity-80 p-0 font-semibold"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setSelectedLog(null);
            setIsLogFormOpen(true);
          }}
        >
          Tạo lượt tương tác
        </Button>
      </div>

      <div className="">
        <TableData<CustomerLog> queryKey={['customer-logs', customerId]} fetcher={fetcher} columns={columns} renderCard={renderCard} select={false} />
      </div>

      <LogFormModal
        isOpen={isLogFormOpen}
        onClose={() => {
          setIsLogFormOpen(false);
          setSelectedLog(null);
        }}
        customerId={customerId}
        title={selectedLog ? 'Chỉnh sửa lượt tương tác' : 'Tạo mới lượt tương tác'}
        submitText={selectedLog ? 'Cập nhật' : 'Lưu tương tác'}
        initialData={selectedLog}
      />

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Xác nhận xóa" className="m-2 max-w-md w-full">
        <div className="flex gap-4 items-center py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-sm leading-relaxed">Bạn có chắc chắn muốn xóa lượt tương tác này? Hành động này không thể hoàn tác.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => logToDelete && deleteMutation.mutate({ customerId, logId: logToDelete.id })}
            loading={deleteMutation.isPending}
          >
            Xác nhận xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
};
