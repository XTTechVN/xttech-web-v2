import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button, Modal, Heading } from '@/components';

// Config của dữ liệu khách hàng
import {
  getCustomerLogChannelLabel,
  getCustomerLogStatusLabel,
  getCustomerLogTypeLabel,
  getCustomerLogStatusColor,
  CUSTOMER_LOG_CHANNEL_OPTIONS,
  CUSTOMER_LOG_TYPE_OPTIONS,
  CUSTOMER_LOG_STATUS_OPTIONS,
} from '@/app/(auth)/app/(sidebar)/customers/config';

import type { CustomerLog } from '@/types';

import { TableFilters } from '@/components/table/table-filters';

import type { ITableFilterProps } from '@/components/table/types';

import { getCustomerLogs, deleteCustomerLog } from '@/actions';

import toast from 'react-hot-toast';

import { useMutation, useQuery } from '@tanstack/react-query';

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

  const [channelFilter, setChannelFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-logs', customerId, channelFilter, typeFilter, statusFilter],
    queryFn: () => getCustomerLogs(customerId, { 
      offset: 0, 
      limit: 100,
      channel: channelFilter,
      type: typeFilter,
      status: statusFilter,
    }),
  });

  const logs = data?.items || [];

  const logFilters: ITableFilterProps[] = [
    {
      type: 'select',
      label: 'Kênh tương tác',
      value: channelFilter,
      options: CUSTOMER_LOG_CHANNEL_OPTIONS,
      onChange: setChannelFilter,
    },
    {
      type: 'select',
      label: 'Loại tương tác',
      value: typeFilter,
      options: CUSTOMER_LOG_TYPE_OPTIONS,
      onChange: setTypeFilter,
    },
    {
      type: 'select',
      label: 'Trạng thái',
      value: statusFilter,
      options: CUSTOMER_LOG_STATUS_OPTIONS,
      onChange: setStatusFilter,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Heading as="h3" className="text-xs md:text-sm font-bold text-gray-500  tracking-wider">Lịch sử tương tác ({data?.meta?.total || 0})</Heading>
        <Button
          variant="ghost"
          size="sm"
          className="bg-transparent text-primary hover:bg-transparent hover:opacity-80 p-0 font-semibold"
          onClick={() => {
            setSelectedLog(null);
            setIsLogFormOpen(true);
          }}
        >
          Tạo lượt tương tác
        </Button>
      </div>

      <div className="mb-4">
        <TableFilters filters={logFilters} />
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Đang tải dữ liệu...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-xl">Chưa có lịch sử tương tác nào</div>
        ) : (
          logs.map((row: CustomerLog) => (
            <div
              key={row.id}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white flex flex-col gap-2 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400  tracking-wider">Kênh tương tác</span>
                    <span className="text-sm font-bold text-gray-900">{getCustomerLogChannelLabel(row.channel || row.type)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400  tracking-wider">Loại tương tác</span>
                    <span className="text-sm font-semibold text-gray-700">{getCustomerLogTypeLabel(row.type)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400  tracking-wider">Ngày tạo</span>
                    <span className="text-sm font-semibold text-gray-900">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400  tracking-wider">Ngày hẹn tiếp</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {row.nextFollowDate ? new Date(row.nextFollowDate).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 min-w-fit">
                  <div className="flex flex-col gap-1 mr-4">
                    <span className="text-[10px] font-bold text-gray-400  tracking-wider">Trạng thái</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border whitespace-nowrap w-fit ${getCustomerLogStatusColor(row.status)}`}>
                      {getCustomerLogStatusLabel(row.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(row);
                        setIsLogFormOpen(true);
                      }}
                      className="h-7 px-3 py-1 text-[11px]"
                    >
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(row)} className="h-7 px-3 py-1 text-[11px]">
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>

              {row.note && (
                <div className="mt-2 text-sm text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                  <span className="font-semibold text-red-500 mr-2">Ghi chú:</span>
                  {row.note}
                </div>
              )}
            </div>
          ))
        )}
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
