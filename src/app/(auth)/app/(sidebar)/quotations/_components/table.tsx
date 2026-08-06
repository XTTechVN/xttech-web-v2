'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Quotation, Project } from '@/types';
import { getQuotations } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

interface TableProps {
  onEditClick: (quotation: Quotation) => void;
  onDeleteClick: (quotation: Quotation) => void;
  onAddClick: () => void;
  projects?: Pick<Project, 'id' | 'name'>[];
}

const Table = ({ onEditClick, onDeleteClick, onAddClick, projects = [] }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getQuotations({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách báo giá');
      throw new Error('Lỗi khi tải danh sách báo giá');
    }
    return res;
  };

  const getProjectName = (projectId: number) => {
    return projects.find((p) => p.id === projectId)?.name || `Dự án #${projectId}`;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      draft: { label: 'Bản nháp', style: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Chờ duyệt', style: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', style: 'bg-green-100 text-green-800' },
      rejected: { label: 'Từ chối', style: 'bg-red-100 text-red-855' },
    };
    const current = map[status] || { label: status, style: 'bg-blue-100 text-blue-800' };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${current.style}`}>
        {current.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề báo giá',
      minWidth: '220px',
      cell: (row: Quotation) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <FileSpreadsheet size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Mã báo giá',
      minWidth: '120px',
      cell: (row: Quotation) => <span className="text-gray-600 text-sm">{row.code || '—'}</span>,
    },
    {
      key: 'projectId',
      label: 'Dự án',
      minWidth: '180px',
      cell: (row: Quotation) => <span className="text-gray-700 text-sm font-medium">{getProjectName(row.projectId)}</span>,
    },
    {
      key: 'discountPercentage',
      label: 'Chiết khấu',
      minWidth: '100px',
      cell: (row: Quotation) => <span className="text-gray-600 text-sm">{row.discountPercentage}%</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '130px',
      cell: (row: Quotation) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Quotation) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Quotation, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10">
          <FileSpreadsheet size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.title}</span>
          <span className="text-xs text-gray-500 mt-0.5">Dự án: {getProjectName(row.projectId)}</span>
          <span className="mt-1">{getStatusBadge(row.status)}</span>
        </div>
      </div>
      <TableAction
        onEdit={() => onEditClick(row)}
        onDelete={() => onDeleteClick(row)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center w-full pr-2 pt-2">
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách báo giá
        </Heading>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Tạo báo giá
        </Button>
      </div>
      <TableData<Quotation>
        queryKey={['quotations', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm báo giá...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
