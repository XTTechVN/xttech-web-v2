'use client';

import { TableData } from '@/components/table2/table-data';
import type { ITableColumn } from '@/components/table2/table-data';
import api from '@/utils/api';
import { Download, FileArchive, CheckCircle } from 'lucide-react';
import type { ExportBatch } from '@/types/shared';

interface ExportBatchTableProps {
  onDownload: (batch: ExportBatch) => void;
}

export default function ExportBatchTable({ onDownload }: ExportBatchTableProps) {
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) =>
    api.get('/api/v1/label/export/batches', { params: { offset, limit } }).then((res) => res.data);

  const renderCard = (row: ExportBatch) => (
    <div
      key={row.id}
      className="p-4 rounded-xl border border-gray-150 bg-white flex gap-3 items-center"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <FileArchive size={20} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          export_{row.id.slice(0, 8)}.zip
        </p>
        <p className="text-xs text-gray-400">
          {row.imageCount} ảnh · {new Date(row.exportedAt).toLocaleString('vi-VN')}
        </p>
      </div>
      {row.downloadUrl && (
        <button
          onClick={() => onDownload(row)}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors shrink-0"
        >
          <Download size={12} /> Tải về
        </button>
      )}
    </div>
  );

  const columns: ITableColumn<ExportBatch>[] = [
    {
      key: 'id',
      label: 'File',
      minWidth: '180px',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileArchive size={16} className="text-blue-400 shrink-0" />
          <span className="text-sm text-gray-700 font-mono">export_{row.id.slice(0, 8)}.zip</span>
        </div>
      ),
    },
    {
      key: 'imageCount',
      label: 'Số ảnh',
      minWidth: '90px',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <CheckCircle size={13} className="text-green-500" />
          {row.imageCount}
        </span>
      ),
    },
    {
      key: 'format',
      label: 'Định dạng',
      minWidth: '110px',
      cell: (row) => (
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium uppercase">
          {row.format}
        </span>
      ),
    },
    {
      key: 'exportedAt',
      label: 'Thời gian export',
      minWidth: '160px',
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.exportedAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      minWidth: '110px',
      sticky: true,
      cell: (row) =>
        row.downloadUrl ? (
          <button
            onClick={() => onDownload(row)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
          >
            <Download size={12} /> Tải về
          </button>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        ),
    },
  ];

  return (
    <TableData<ExportBatch>
      queryKey={['export-batches']}
      fetcher={fetcher}
      columns={columns}
      renderCard={renderCard}
    />
  );
}
