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
    },
    {
      key: 'rtspUrl',
      label: 'URL RTSP',
    },
    {
      key: 'address',
      label: 'Địa chỉ',
    },
    {
      key: 'workerIp',
      label: 'IP Worker',
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
            <p>{item.workerIp}</p>
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
