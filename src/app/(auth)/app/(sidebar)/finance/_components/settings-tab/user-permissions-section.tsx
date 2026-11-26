'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Alert, Badge, Button, Skeleton, TableSearch } from '@/components';
import { getFinancePermissions, updateFinancePermission } from '@/actions';
import type {
  FinanceUserPermission,
  FinanceUserPermissionUpdate,
} from '@/types';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';

const PERM_COLUMNS: Array<{
  key: keyof FinanceUserPermissionUpdate;
  label: string;
  hint: string;
}> = [
  { key: 'canCreateVoucher', label: 'Lập CT', hint: 'Tạo/sửa/xóa CT nháp' },
  { key: 'canPostVoucher', label: 'Ghi sổ', hint: 'Post GL chứng từ' },
  { key: 'canUnpostVoucher', label: 'Bỏ ghi sổ', hint: 'Gỡ sổ + Audit Log' },
  { key: 'canCashierConfirm', label: 'Thủ quỹ', hint: 'Xác nhận thu/chi & kiểm kê' },
  { key: 'canLockPeriod', label: 'Khóa kỳ', hint: 'Khóa/mở kỳ & khóa nộp thuế' },
  { key: 'canApproveNonInvoice', label: 'Duyệt nội bộ', hint: 'Duyệt chi không HĐ' },
  { key: 'canManageSettings', label: 'Cài đặt TC', hint: 'Quản trị cấu hình & phân quyền' },
  { key: 'canApproveTaxFiling', label: 'Duyệt thuế', hint: 'Duyệt tờ khai thuế & hồ sơ quyết toán' },
  { key: 'canExportStatutory', label: 'Xuất BCTC', hint: 'Xuất BCTC & XML HTKK' },
  { key: 'canMarkTaxFiled', label: 'Chốt nộp thuế', hint: 'Đánh dấu kỳ đã nộp tờ khai thuế' },
];

export function UserPermissionsSection() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, FinanceUserPermissionUpdate>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance', 'permissions', 'list', search],
    queryFn: () => getFinancePermissions({ search: search || undefined, limit: 100 }),
  });

  const rows = useMemo(() => data?.items || [], [data?.items]);

  const getEffectiveFlag = (
    row: FinanceUserPermission,
    key: keyof FinanceUserPermissionUpdate,
  ): boolean => {
    const patch = drafts[row.userId];
    if (patch && patch[key] !== undefined) {
      return Boolean(patch[key]);
    }
    return Boolean(row[key]);
  };

  const handleToggle = (
    row: FinanceUserPermission,
    key: keyof FinanceUserPermissionUpdate,
  ) => {
    const nextVal = !getEffectiveFlag(row, key);
    setDrafts((prev) => ({
      ...prev,
      [row.userId]: {
        ...(prev[row.userId] || {}),
        [key]: nextVal,
      },
    }));
  };

  const handleSaveRow = async (row: FinanceUserPermission) => {
    const patch = drafts[row.userId];
    if (!patch) return;
    setSavingUserId(row.userId);
    try {
      await updateFinancePermission(row.userId, patch);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[row.userId];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã cập nhật quyền tài chính cho ${row.userName || row.username}`);
    } catch (err) {
      showErrorToast(err, 'Không thể cập nhật phân quyền tài chính');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <TableSearch
          placeholder="Tìm theo họ tên, username hoặc email..."
          value={search}
          onChange={setSearch}
          className="w-72"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
        >
          Làm mới ({data?.meta.total ?? rows.length})
        </Button>
      </div>

      <Alert variant="info" title="Ma trận phân quyền chi tiết cấp User (Không ảnh hưởng HRM Roles)">
        Hệ thống tách biệt 10 quyền nghiệp vụ tài chính &amp; thuế cho từng nhân sự (Người lập, Ghi sổ, Bỏ ghi sổ, Thủ quỹ, Duyệt thuế, Xuất BCTC, Chốt nộp thuế...). Các thay đổi được ghi vào Nhật ký Kiểm toán.
      </Alert>

      {isError && (
        <Alert variant="danger" title="Không thể tải ma trận phân quyền">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 min-w-[190px]">Nhân sự</th>
                  {PERM_COLUMNS.map((col) => (
                    <th key={col.key} className="p-2.5 text-center" title={col.hint}>
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 text-center">Nguồn quyền</th>
                  <th className="p-3 text-right">Lưu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-400">
                      Không tìm thấy nhân sự phù hợp.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isDirty = Boolean(drafts[row.userId]);
                    const busy = savingUserId === row.userId;
                    return (
                      <tr key={row.userId} className="hover:bg-slate-50/70">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">
                            {row.userName || row.username}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            @{row.username}
                            {row.roles.length > 0 ? ` • ${row.roles.join(', ')}` : ''}
                          </div>
                        </td>
                        {PERM_COLUMNS.map((col) => (
                          <td key={col.key} className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={getEffectiveFlag(row, col.key)}
                              disabled={busy}
                              onChange={() => handleToggle(row, col.key)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="p-3 text-center">
                          <Badge
                            variant={row.isDefaultFallback ? 'default' : 'success'}
                            size="sm"
                          >
                            {row.isDefaultFallback ? 'Mặc định role' : 'Cấu hình riêng'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            size="xs"
                            variant={isDirty ? 'primary' : 'outline'}
                            disabled={!isDirty}
                            loading={busy}
                            leftIcon={isDirty ? <Save size={12} /> : <ShieldCheck size={12} />}
                            onClick={() => handleSaveRow(row)}
                          >
                            {isDirty ? 'Lưu' : 'Đã khớp'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
