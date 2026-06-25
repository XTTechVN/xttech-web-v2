'use client';

import api from '@/utils/api';
import { TableData } from '@/components/table2/table-data';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Space } from '@/types/shared/space';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function TestPage() {
  const [search, setSearch] = useQueryParam('search');
  const [status, setStatus] = useQueryParam('status');

  // Fetch all spaces to create a lookup map for parent names
  const { data: allSpaces = [] } = useQuery<Space[]>({
    queryKey: ['spaces-flat-all'],
    queryFn: () => api.get('/api/v1/spaces/flat').then((res: any) => res.data || []),
  });

  // Fetcher simulates offset-based pagination and search filter on client side
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    return api
      .get(`/api/v1/spaces/flat`, {
        params: {
          search: search || undefined,
          status,
          offset,
          limit,
        },
      })
      .then((res) => res.data);
  };

  const columns = [
    {
      key: 'spaceId',
      label: 'Mã khu vực',
      minWidth: '150px',
      cell: (row: Space) => <span>{row.spaceId}</span>,
    },
    {
      key: 'name',
      label: 'Tên khu vực',
      minWidth: '200px',
      cell: (row: Space) => <span>{row.name}</span>,
    },
    {
      key: 'parentSpace',
      label: 'Khu vực cha',
      minWidth: '150px',
      cell: (row: Space) => {
        if (!row.parentId) return <span className="text-gray-400 italic">Không có (Gốc)</span>;
        // const parentName = spaceMap.get(row.parentId);
        // return <span>{parentName || row.parentId}</span>;
      },
    },
    {
      key: 'level',
      label: 'Cấp độ',
      minWidth: '100px',
      cell: (row: Space) => <span>Cấp {row.level}</span>,
    },
  ];

  // Mobile card rendering
  const renderCard = (row: Space, index: number) => (
    <div
      key={row.id || index}
      className="flex flex-col gap-2 p-4 border border-border-secondary rounded-lg bg-white shadow-sm"
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-900">{row.name}</span>
        <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          Cấp {row.level}
        </span>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          <strong>Mã:</strong> {row.spaceId}
        </div>
        <div>
          <strong>Khu vực cha:</strong>{' '}
          {/* {row.parentId ? spaceMap.get(row.parentId) || row.parentId : 'Không có (Gốc)'} */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Table2 - Quản lý Khu vực</h1>
          <p className="text-sm text-gray-500">
            Trang thử nghiệm bộ component TableDataRework (table2) tích hợp phân trang và
            responsive.
          </p>
        </div>

        <TableData<Space>
          queryKey={['test-spaces', search]}
          fetcher={fetcher}
          columns={columns}
          renderCard={renderCard}
          filters={[
            {
              label: 'Trạng thái',
              value: status,
              options: [
                { value: 'active', label: 'Hoạt động' },
                { value: 'inactive', label: 'Không hoạt động' },
                { value: undefined, label: 'Tất cả' },
              ],
              className: 'w-fit',
              onChange: setStatus,
            },
          ]}
          search={{
            placeholder: 'Tìm kiếm theo tên hoặc mã khu vực...',
            value: search,
            onChange: setSearch,
            className: 'w-fit',
          }}
        />
      </div>
    </div>
  );
}
