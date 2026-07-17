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
import { Record } from '@/types/shared/event';
import { ResponsePagination } from '@/types/shared/reponse';

export default function RecordTable({
  onDelete,
  onView,
  search = '',
}: {
  onDelete: (id: string) => void;
  onView: (alert: Record) => void;
  search?: string;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Record>>({
    queryKey: ['alerts', offset, limit, search],
    queryFn: () =>
      api
        .get(
          `/api/v1/records?offset=${offset}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        )
        .then((res) => res.data),
  });

  const columns = [
    {
      key: 'thumbnail',
      label: 'Ảnh',
      width: '5%',
      render: (item: Record) =>
        item.thumbnailId ? (
          <img
            src={`http://157.66.100.182:9000/ai-data/${item.thumbnailId}`}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-md border border-gray-100 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        ),
    },
    {
      key: 'name',
      label: 'Sự kiện / Bản ghi',
      width: '20%',
      render: (item: Record) => (
        <div>
          <p className="font-semibold">{item.name}</p>
          <span className="text-xs text-gray-400">ID: {item.id}</span>
        </div>
      ),
    },
    {
      key: 'camera',
      label: 'Camera / Worker',
      width: '10%',
      render: (item: Record) => (
        <div>
          <p className="font-semibold">{item.camera?.name || 'N/A'}</p>
          <p className="text-xs">
            {item.camera?.worker?.name
              ? `${item.camera.worker.name} (${item.camera.worker.socket})`
              : 'N/A'}
          </p>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      width: '15%',
    },
    {
      key: 'aiProcessedLevel',
      label: 'Cấp độ AI',
      width: '10%',
      render: (item: Record) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-600 border border-blue-100">
          Cấp {item.aiProcessedLevel}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Thời gian',
      width: '15%',
      render: (item: Record) =>
        item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '10%',
      render: (item: Record) => (
        <TableAction
          onView={() => onView(item)}
          onEdit={() => {}} // Disabled by default
          onDelete={() => onDelete(item.id.toString())}
        />
      ),
    },
  ];

  const cardView = (items: Record[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id.toString()}
          className="p-4 bg-white rounded-lg border border-gray-100 space-y-3 shadow-sm hover:border-gray-200 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              {item.thumbnailId ? (
                <img
                  src={`http://157.66.100.182:9000/ai-data/thumbnail/${item.thumbnailId}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border border-gray-100 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                  No image
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">ID: {item.id}</p>
              </div>
            </div>
            <TableAction
              onView={() => onView(item)}
              onEdit={() => {}}
              onDelete={() => onDelete(item.id.toString())}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 border-t border-gray-50 pt-2">
            <div>
              <span className="font-semibold text-gray-400 block text-xs">Camera:</span>
              <span className="text-gray-800 font-medium">{item.camera?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400 block text-xs">Worker:</span>
              <span className="text-gray-800 font-medium">
                {item.camera?.worker?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-400 block text-xs">Thời gian:</span>
              <span className="text-gray-800 font-medium">
                {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-400 block text-xs">Cấp độ AI:</span>
              <span className="text-gray-800 font-medium">Cấp {item.aiProcessedLevel}</span>
            </div>
          </div>
          {item.description && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <span className="font-semibold text-gray-500 mr-2">Mô tả:</span>
              {item.description}
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
