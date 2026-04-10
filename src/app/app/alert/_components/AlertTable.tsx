'use client';

// Components
import Table from '@/components/table/Table';
import TableAction from '@/components/table/TableAction';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';
import dayjs from 'dayjs';

// Types
import { Alert } from '@/types/shared/alert';
import { ResponsePagination } from '@/types/shared/reponse';

export default function AlertTable({
  onDelete,
  onView,
}: {
  onDelete: (id: string) => void;
  onView: (alert: Alert) => void;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Alert>>({
    queryKey: ['alerts', offset, limit],
    queryFn: () =>
      api.get(`/api/v1/events?offset=${offset}&limit=${limit}`).then((res) => res.data),
  });

  const columns = [
    {
      key: 'name',
      label: 'Sự kiện',
      width: '30%',
    },
    {
      key: 'camera_name',
      label: 'Camera',
      width: '20%',
      render: (item: Alert) => item.camera_name || item.camera_id,
    },
    {
      key: 'created_at',
      label: 'Thời gian',
      width: '20%',
      render: (item: Alert) =>
        item.created_at ? dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      key: 'description',
      label: 'Mô tả',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '10%',
      render: (item: Alert) => (
        <TableAction
          onView={() => onView(item)}
          onEdit={() => {}} // Disabled for alerts by default
          onDelete={() => onDelete(item.id.toString())}
        />
      ),
    },
  ];

  const cardView = (items: Alert[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id.toString()}
          className="p-4 bg-white rounded-lg border border-gray-100 space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-primary">{item.name}</p>
            <TableAction
              onView={() => onView(item)}
              onEdit={() => {}}
              onDelete={() => onDelete(item.id.toString())}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-700 w-24">Camera:</span>
            <span>{item.camera_name || item.camera_id}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-700 w-24">Thời gian:</span>
            <span>
              {item.created_at ? dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss') : '-'}
            </span>
          </div>
          {item.description && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-semibold text-gray-700 w-24">Mô tả:</span>
              <span>{item.description}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {isLoading && <TableLoading cols={columns} />}
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          Lỗi tải dữ liệu: {(error as Error).message}
        </div>
      )}
      {data && (
        <>
          <Table data={data.items} columns={columns} cardView={cardView} />
          <div className="flex justify-end mt-4">
            <TablePagination {...data.meta} onChange={(newOffset) => setOffset(newOffset)} />
          </div>
        </>
      )}
    </div>
  );
}
