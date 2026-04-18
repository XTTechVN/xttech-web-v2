'use client';

import Table from '@/components/table/Table';
import TablePagination from '@/components/table/TablePagination';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Eye } from 'lucide-react';

interface DetectionResultTableProps {
  label: string;
  onTrace: (detectionResult: string) => void;
}

export default function Component({ label, onTrace }: DetectionResultTableProps) {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);

  // Fetching data from API
  const { data } = useQuery({
    queryKey: ['detection-results', label, offset, limit],
    queryFn: async () => {
      // TODO: Xử lý khi label === 'all' thì query tất cả các đối tượng
      // http://localhost:5100/api/v1/detected-objects/detection-results?offset=0&limit=100
      if (label === 'all') {
        const res = await api.get(
          `/api/v1/detected-objects/detection-results?offset=${offset}&limit=${limit}`,
        );
        return res.data;
      }

      const res = await api.get(
        `/api/v1/detected-objects/detection-results?label=${label}&offset=${offset}&limit=${limit}`,
      );
      return res.data;
    },
    enabled: !!label && offset >= 0 && limit > 0,
    refetchOnWindowFocus: false,
  });

  // Table Columns
  const columns = [
    {
      key: 'cameraName',
      label: 'Phát hiện tại',
      render: (item: any) => <p className="">{item.event.camera.name}</p>,
    },
    {
      key: 'label',
      label: 'Nhãn đối tượng',
      render: (item: any) => <p className="">{item.label}</p>,
    },
    {
      key: 'detectionResult',
      label: 'Kết quả phát hiện',
      render: (item: any) => <p className="">{item.detectionResult}</p>,
    },
    {
      key: 'score',
      label: 'Độ tin cậy',
      render: (item: any) => <p className="">{item.confidenceScore}</p>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (item: any) => (
        <button
          onClick={() => onTrace(item)}
          className="hover:text-blue-500 transition-colors cursor-pointer"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} data={data?.items || []} />

      <TablePagination
        total={data?.meta?.total || 0}
        offset={data?.meta?.offset || 1}
        limit={data?.meta?.limit || 10}
        next={data?.meta?.next}
        onChange={(offset) => setOffset(offset)}
        className="justify-end"
      />
    </div>
  );
}
