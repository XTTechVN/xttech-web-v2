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

// Types
import { Camera } from '@/types/shared/camera';
import { ResponsePagination } from '@/types/shared/reponse';

const mappingStatus = {
  stopped: 'Đã dừng',
  streaming: 'Phát trực tiếp',
  recording_continuous: 'Ghi hình liên tục',
  recording_event: 'Ghi hình sự kiện',
};

const mappingRtspType = {
  pull: 'Pull',
  push: 'Push',
};

export default function CameraTable({
  onDelete,
  onEdit,
  onView,
}: {
  onDelete: (id: string) => void;
  onEdit: (cam: Camera) => void;
  onView: (cam: Camera) => void;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Camera>>({
    queryKey: ['cameras', offset, limit],
    queryFn: () =>
      api.get(`/api/v1/cameras?offset=${offset}&limit=${limit}`).then((res) => res.data),
  });

  const columns = [
    {
      key: 'name',
      label: 'Tên camera',
      width: '15%',
    },
    {
      key: 'rtspUrl',
      label: 'URL RTSP',
      width: '20%',
      render: (item: Camera) => <span className="truncate">{item.rtspUrl.substring(0, 35)}</span>,
    },
    {
      key: 'rtspType',
      label: 'Loại RTSP',
      width: '8%',
      render: (item: Camera) => <span className="truncate">{item.rtspType}</span>,
    },
    {
      key: 'address',
      label: 'Địa chỉ',
    },
    {
      key: 'workerName',
      label: 'Worker',
      width: '10%',
      render: (item: any) => <span>{item.worker.name}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: '10%',
      render: (item: Camera) => (
        <span
          className={`badge ${mappingStatus[item.status as keyof typeof mappingStatus] ? 'badge-success' : 'badge-error'}`}
        >
          {mappingStatus[item.status as keyof typeof mappingStatus]}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '10%',
      render: (item: Camera) => (
        <TableAction
          onView={() => onView(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ),
    },
  ];

  const cardView = (items: Camera[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Tên camera:</p>
            <p>{item.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">URL RTSP:</p>
            <p>{item.rtspUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Địa chỉ:</p>
            <p>{item.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">IP Worker:</p>
            <p>{item.worker?.ip}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Hành động:</p>
            <TableAction
              onView={() => onView(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {isLoading && <TableLoading cols={columns} />}
      {error && <div>Error: {error.message}</div>}
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
