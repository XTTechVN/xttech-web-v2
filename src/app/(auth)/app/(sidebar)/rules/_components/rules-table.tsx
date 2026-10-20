'use client';

import React, { useMemo } from 'react';
import { FilePen, FileSearch, ShieldCheck, Trash2 } from 'lucide-react';
import { TableHeader, TableBody, TablePagination, type ITableColumn } from '@/components/table';
import { cn } from '@/utils';
import type { DocumentItem } from '@/types';
import { SHARE_SCOPE_MAP } from '@/types';
import { RuleStatusBadge, RuleTypeBadge, formatRuleDate } from './rule-badges';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';

interface RulesTableProps {
  items: DocumentItem[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  emptyHint: string;
  context?: RuleActionContext;
  onOpen: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onPageChange: (offset: number) => void;
}

const ReadProgress: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  const isIssued = ['published', 'superseded', 'expired'].includes(doc.status);
  if (!isIssued) {
    return <span className="text-[11px] text-slate-400 italic">Chưa ban hành</span>;
  }

  if (doc.recipientStats) {
    const { readCount, totalRecipients } = doc.recipientStats;
    return (
      <span className="text-[11px] text-slate-600 whitespace-nowrap">
        Đã đọc <strong>{readCount}</strong>/{totalRecipients}
      </span>
    );
  }
  if (doc.requiresAcknowledgement && doc.isAcknowledged !== null && doc.isAcknowledged !== undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap',
          doc.isAcknowledged ? 'text-emerald-600' : 'text-amber-600',
        )}
      >
        <ShieldCheck size={12} />
        {doc.isAcknowledged ? 'Đã xác nhận' : 'Cần xác nhận'}
      </span>
    );
  }
  return <span className="text-[11px] text-slate-400">—</span>;
};

const SkeletonRows: React.FC = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, idx) => (
      <tr key={idx} className="animate-pulse border-b border-slate-200">
        <td className="px-4 py-3">
          <div className="h-3 w-28 bg-slate-200 rounded mb-1.5" />
          <div className="h-4 w-44 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded-full" /></td>
        <td className="px-4 py-3"><div className="h-3 w-24 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-28 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-5 w-12 bg-slate-200 rounded" /></td>
      </tr>
    ))}
  </tbody>
);

export const RulesTable: React.FC<RulesTableProps> = ({
  items,
  total,
  offset,
  limit,
  isLoading,
  emptyHint,
  context,
  onOpen,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  const columns = useMemo<ITableColumn<DocumentItem>[]>(() => [
    {
      key: 'document',
      label: 'Văn bản',
      minWidth: '220px',
      cell: (row) => {
        const isUnread = row.isRead === false;
        return (
          <div className="flex items-start gap-2 max-w-xs">
            <span className={cn('mt-1.5 w-2 h-2 rounded-full shrink-0', isUnread ? 'bg-primary' : 'bg-transparent')} />
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-slate-400">{row.code}</p>
              <p className={cn('truncate text-slate-800 text-xs', isUnread ? 'font-bold' : 'font-medium')}>{row.title}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'documentType',
      label: 'Loại',
      minWidth: '100px',
      cell: (row) => <RuleTypeBadge type={row.documentType} />,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '110px',
      cell: (row) => <RuleStatusBadge doc={row} />,
    },
    {
      key: 'effectiveDate',
      label: 'Hiệu lực',
      minWidth: '140px',
      cell: (row) => (
        <div className="whitespace-nowrap text-slate-600 text-xs">
          {formatRuleDate(row.effectiveDate)}
          {row.expirationDate && <span className="text-slate-400"> → {formatRuleDate(row.expirationDate)}</span>}
        </div>
      ),
    },
    {
      key: 'createdBy',
      label: 'Người soạn / duyệt',
      minWidth: '150px',
      cell: (row) => (
        <div className="text-slate-600 text-xs">
          <p className="truncate max-w-40">{row.createdBy?.fullName || '—'}</p>
          {row.approver && <p className="truncate max-w-40 text-[10px] text-slate-400">Duyệt: {row.approver.fullName}</p>}
        </div>
      ),
    },
    {
      key: 'shareScope',
      label: 'Phạm vi',
      minWidth: '130px',
      cell: (row) => {
        let tooltip: string | undefined = undefined;
        let countSuffix = '';
        if (row.shareScope === 'department' && row.recipientDepartments && row.recipientDepartments.length > 0) {
          countSuffix = ` (${row.recipientDepartments.length})`;
          tooltip = row.recipientDepartments.map((d) => d.name).join(', ');
        } else if (row.shareScope === 'user' && row.recipients && row.recipients.length > 0) {
          countSuffix = ` (${row.recipients.length})`;
          tooltip = row.recipients.map((r) => r.user?.fullName || r.fullName || 'Nhân sự').join(', ');
        }
        return (
          <span
            title={tooltip}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap"
          >
            {SHARE_SCOPE_MAP[row.shareScope] || row.shareScope || 'Toàn công ty'}
            {countSuffix}
          </span>
        );
      },
    },
    {
      key: 'tracking',
      label: 'Theo dõi',
      minWidth: '110px',
      cell: (row) => <ReadProgress doc={row} />,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '80px',
      cell: (row) => {
        const actions = context ? getRuleActions(row, context) : null;
        const canEdit = actions?.canEdit ?? false;
        const canDelete = actions?.canDelete ?? false;

        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && onEdit && (
              <button
                type="button"
                title="Chỉnh sửa văn bản"
                onClick={() => onEdit(row)}
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
              >
                <FilePen size={14} />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                type="button"
                title="Xóa văn bản"
                onClick={() => onDelete(row)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [context, onEdit, onDelete]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      <div className="flex-1 overflow-auto px-4 custom-scrollbar">
        <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto w-full">
            <table className="table w-full border-collapse">
              <TableHeader columns={columns} select={false} />
              {isLoading && items.length === 0 ? (
                <SkeletonRows />
              ) : (
                <TableBody
                  data={items}
                  columns={columns}
                  select={false}
                  onRowClick={onOpen}
                />
              )}
            </table>
          </div>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <FileSearch size={36} />
            <p className="text-sm font-medium text-slate-500">Chưa có cơ chế nào</p>
            <p className="text-xs">{emptyHint}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          onPageChange={(page) => onPageChange((page - 1) * limit)}
          onPageSizeChange={() => {}}
          hideRowPerPage={true}
        />
      </div>
    </div>
  );
};
