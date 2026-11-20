'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, RefreshCw } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Skeleton,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import { getFinanceAuditLogs } from '@/actions';
import {
  FINANCE_AUDIT_ACTION_MAP,
  FINANCE_AUDIT_ACTION_OPTIONS,
  FINANCE_AUDIT_ENTITY_MAP,
  FINANCE_AUDIT_ENTITY_OPTIONS,
} from '@/config/finance';
import { getErrorMessage } from '@/utils';

export function AuditLogsSection() {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance', 'audit-logs', search, entityType, action],
    queryFn: () =>
      getFinanceAuditLogs({
        search: search || undefined,
        entityType,
        action,
        limit: 100,
      }),
  });

  const logs = useMemo(() => data?.items || [], [data?.items]);

  const filters: ITableFilterProps[] = useMemo(
    () => [
      {
        label: 'Đối tượng',
        value: entityType,
        options: FINANCE_AUDIT_ENTITY_OPTIONS,
        onChange: setEntityType,
      },
      {
        label: 'Hành động',
        value: action,
        options: FINANCE_AUDIT_ACTION_OPTIONS,
        onChange: setAction,
      },
    ],
    [entityType, action],
  );

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch
            placeholder="Tìm lý do, mã chứng từ, kỳ..."
            value={search}
            onChange={setSearch}
            className="w-72"
          />
          <TableFilters filters={filters} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
        >
          Làm mới ({data?.meta.total ?? logs.length})
        </Button>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải nhật ký kiểm toán">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <History size={28} className="mx-auto text-slate-300" />
          <div className="text-sm font-semibold text-slate-700">
            Chưa có bản ghi kiểm toán nào phù hợp bộ lọc
          </div>
          <p className="text-slate-400">
            Mọi thao tác Bỏ ghi sổ, Mở khóa kỳ, Đánh dấu nộp tờ khai thuế, Đổi phân quyền hoặc Đổi tiêu thức 627 đều tự động ghi tại đây.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-40">Thời điểm</th>
                  <th className="p-3">Người thực hiện</th>
                  <th className="p-3">Hành động</th>
                  <th className="p-3">Đối tượng / ID</th>
                  <th className="p-3">Lý do &amp; Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const actionMeta = FINANCE_AUDIT_ACTION_MAP[log.action];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 align-top">
                      <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.createdAt.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                        {log.actorName || log.actorId || 'Hệ thống'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={actionMeta?.variant || 'default'} size="sm">
                          {actionMeta?.shortLabel || log.action}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {FINANCE_AUDIT_ENTITY_MAP[log.entityType] || log.entityType}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          ID: {log.entityId}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{log.reason}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
