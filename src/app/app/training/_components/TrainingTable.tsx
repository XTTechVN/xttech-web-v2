'use client';

import { TableData } from '@/components/table2/table-data';
import type { ITableColumn } from '@/components/table2/table-data';
import api from '@/utils/api';
import { CheckCircle, Clock, Tag } from 'lucide-react';
import { useQueryParam } from '@/hooks/useQueryParam';
import type { LabelImage } from '@/types/shared/label';

export type { LabelImage };

interface TrainingTableProps {
  onLabel: (image: LabelImage) => void;
  onDelete: (image: LabelImage) => void;
}

export default function TrainingTable({ onLabel, onDelete }: TrainingTableProps) {
  const [source, setSource] = useQueryParam('source');
  const [isLabeled, setIsLabeled] = useQueryParam('isLabeled');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) =>
    api
      .get('/api/v1/label/images', {
        params: {
          offset,
          limit,
          source: source || undefined,
          isLabeled: isLabeled !== undefined ? isLabeled : undefined,
        },
      })
      .then((res) => res.data);

  const renderCard = (row: LabelImage) => (
    <div key={row.id} className="p-4 rounded-xl border border-gray-150 bg-white flex gap-3">
      <img
        src={row.imageUrl}
        alt="label"
        className="w-20 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/80x64?text=img';
        }}
      />
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1">
          {row.isLabeled ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              <CheckCircle size={11} /> Đã label
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
              <Clock size={11} /> Chờ label
            </span>
          )}
          <span
            className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
              row.source === 'active_learning'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {row.source === 'active_learning' ? 'AI' : 'Upload'}
          </span>
        </div>
        {row.aiLabel && (
          <p className="text-xs text-gray-500">
            AI: {row.aiLabel}
            {row.aiConfidence != null && ` (${Math.round(row.aiConfidence * 100)}%)`}
          </p>
        )}
        <p className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onLabel(row)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Label
          </button>
          <button
            onClick={() => onDelete(row)}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  const columns: ITableColumn<LabelImage>[] = [
    {
      key: 'imageUrl',
      label: 'Ảnh',
      minWidth: '80px',
      maxWidth: '100px',
      cell: (row) => (
        <img
          src={row.imageUrl}
          alt="label"
          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/64x48?text=img';
          }}
        />
      ),
    },
    {
      key: 'source',
      label: 'Nguồn',
      minWidth: '130px',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            row.source === 'active_learning'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {row.source === 'active_learning' ? 'Active Learning' : 'Upload'}
        </span>
      ),
    },
    {
      key: 'isLabeled',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) =>
        row.isLabeled ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            <CheckCircle size={12} /> Đã label
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
            <Clock size={12} /> Chờ label
          </span>
        ),
    },
    {
      key: 'annotations',
      label: 'Số box',
      minWidth: '80px',
      cell: (row) => (
        <span className="text-sm text-gray-600">{(row.annotations as unknown[])?.length ?? 0}</span>
      ),
    },
    {
      key: 'aiLabel',
      label: 'AI đoán',
      minWidth: '130px',
      visible: true,
      cell: (row) =>
        row.aiLabel ? (
          <span className="text-xs text-gray-700">
            {row.aiLabel}
            {row.aiConfidence != null && (
              <span className="ml-1 text-gray-400">({Math.round(row.aiConfidence * 100)}%)</span>
            )}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '110px',
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      minWidth: '120px',
      sticky: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLabel(row)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
          >
            <Tag size={12} /> Label
          </button>
          <button
            onClick={() => onDelete(row)}
            className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <TableData<LabelImage>
      queryKey={['label-images', source, isLabeled]}
      fetcher={fetcher}
      columns={columns}
      renderCard={renderCard}
      filters={[
        {
          label: 'Nguồn',
          value: source,
          onChange: setSource,
          options: [
            { value: undefined, label: 'Tất cả' },
            { value: 'upload', label: 'Upload thủ công' },
            { value: 'active_learning', label: 'Active Learning' },
          ],
        },
        {
          label: 'Trạng thái',
          value: isLabeled,
          onChange: setIsLabeled,
          options: [
            { value: undefined, label: 'Tất cả' },
            { value: 'false', label: 'Chưa label' },
            { value: 'true', label: 'Đã label' },
          ],
        },
      ]}
    />
  );
}
