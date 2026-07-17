'use client';

// Components
import Table from '@/components/table/Table';
import TableAction from '@/components/table/TableAction';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';
import { BiCheckCircle, BiXCircle } from "react-icons/bi";

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { Worker } from '@/types/shared/worker';
import { ResponsePagination } from '@/types/shared/reponse';

export default function WorkerTable({
  onDelete,
  onEdit,
  onView,
}: {
  onDelete: (macId: string) => void;
  onEdit: (worker: Worker) => void;
  onView: (worker: Worker) => void;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Worker>>({
    queryKey: ['workers', offset, limit],
    queryFn: () =>
      api.get(`/api/v1/workers?offset=${offset}&limit=${limit}`).then((res) => res.data),
  });

  const columns = [
    {
      key: 'name',
      label: 'Tên Worker',
      width: '20%',
    },
    {
      key: 'socket',
      label: 'Socket',
      width: '35%',
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      width: '15%',
      render: (item: Worker) => (
        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-error'}`}>
          {item.isActive ? <BiCheckCircle size={20} color='green' /> : <BiXCircle size={20} color='red' />}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '15%',
      render: (item: Worker) => (
        <TableAction
          onView={() => onView(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.macId)}
        />
      ),
    },
  ];

  const cardView = (items: Worker[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Tên Worker:</p>
            <p className="text-sm">{item.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Socket:</p>
            <p className="text-sm">{item.socket}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="font-semibold text-sm">Hành động:</p>
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
      {error && <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>}
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
