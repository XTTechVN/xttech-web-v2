'use client';

import React, { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmActionModal,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import { deleteAutoPostingTemplate } from '@/actions';
import {
  ACCOUNTING_REGIME_MAP,
  ACCOUNTING_REGIME_OPTIONS,
  VOUCHER_TYPE_MAP,
  VOUCHER_TYPE_OPTIONS,
} from '@/config/finance';
import type { AutoPostingTemplate } from '@/types';
import { includesSearchText, showErrorToast, showSuccessToast } from '@/utils';
import {
  TEMPLATE_INVOICE_DEFAULT_MAP,
  WORKSHOP_VISIBLE_OPTIONS,
} from './settings-tab.constants';

interface TemplatesSectionProps {
  templates: AutoPostingTemplate[];
  onRefreshMaster: () => Promise<void> | void;
  onCreateAutoPosting: () => void;
  onEditAutoPosting: (template: AutoPostingTemplate) => void;
}

export function TemplatesSection({
  templates,
  onRefreshMaster,
  onCreateAutoPosting,
  onEditAutoPosting,
}: TemplatesSectionProps) {
  const [search, setSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string | undefined>();
  const [regimeFilter, setRegimeFilter] = useState<string | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();
  const [deletingItem, setDeletingItem] = useState<AutoPostingTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(
    () =>
      templates.filter((t) => {
        if (
          search.trim() &&
          !includesSearchText(t.code, search) &&
          !includesSearchText(t.name, search) &&
          !includesSearchText(t.debitAccountCode, search) &&
          !includesSearchText(t.creditAccountCode, search)
        ) {
          return false;
        }
        if (voucherTypeFilter && t.voucherType !== voucherTypeFilter) return false;
        if (regimeFilter && t.regime !== regimeFilter) return false;
        if (workshopFilter !== undefined && t.workshopVisible !== (workshopFilter === 'true')) {
          return false;
        }
        return true;
      }),
    [templates, search, voucherTypeFilter, regimeFilter, workshopFilter],
  );

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteAutoPostingTemplate(deletingItem.id);
      showSuccessToast(`Đã xóa mẫu định khoản ${deletingItem.code}`);
      setDeletingItem(null);
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa mẫu định khoản');
    } finally {
      setDeleting(false);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      {
        label: 'Loại CT',
        value: voucherTypeFilter,
        options: VOUCHER_TYPE_OPTIONS,
        onChange: setVoucherTypeFilter,
      },
      {
        label: 'Chế độ',
        value: regimeFilter,
        options: ACCOUNTING_REGIME_OPTIONS,
        onChange: setRegimeFilter,
      },
      {
        label: 'Chế độ Xưởng',
        value: workshopFilter,
        options: WORKSHOP_VISIBLE_OPTIONS,
        onChange: setWorkshopFilter,
      },
    ],
    [voucherTypeFilter, regimeFilter, workshopFilter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch
            placeholder="Tìm mã mẫu, tên nghiệp vụ, TK Nợ/Có..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <TableFilters filters={filters} />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateAutoPosting}
          leftIcon={<Plus size={14} />}
        >
          Thêm mẫu định khoản
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Mã / Tên nghiệp vụ</th>
                <th className="p-3">Loại CT</th>
                <th className="p-3">Chế độ</th>
                <th className="p-3">Định khoản (Nợ / Có)</th>
                <th className="p-3">Khoản mục</th>
                <th className="p-3">Hóa đơn mặc định</th>
                <th className="p-3 text-center">Hiện ở Xưởng</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Không có mẫu định khoản nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const typeMeta = VOUCHER_TYPE_MAP[t.voucherType];
                  const regMeta = ACCOUNTING_REGIME_MAP[t.regime];
                  const invoiceMeta =
                    TEMPLATE_INVOICE_DEFAULT_MAP[t.defaultHasValidInvoice ? 'true' : 'false'];
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-mono font-bold text-primary">{t.code}</div>
                        <div className="font-semibold text-slate-900">{t.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={typeMeta?.variant || 'default'} size="sm">
                          {typeMeta?.shortLabel || t.voucherType}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={regMeta?.variant || 'default'} size="sm">
                          {regMeta?.shortLabel || t.regime}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        Nợ {t.debitAccountCode || t.debitAccountId} / Có{' '}
                        {t.creditAccountCode || t.creditAccountId}
                      </td>
                      <td className="p-3">{t.defaultCostItemName || '---'}</td>
                      <td className="p-3">
                        <Badge variant={invoiceMeta.variant} size="sm">
                          {invoiceMeta.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={t.workshopVisible ? 'success' : 'default'} size="sm">
                          {t.workshopVisible ? 'Hiện' : 'Ẩn'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onEditAutoPosting(t)}
                            title="Sửa mẫu"
                          >
                            <Edit2 size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeletingItem(t)}
                            title="Xóa mẫu"
                            className="text-rose-600"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={8} className="p-3">
                  Tổng cộng {filtered.length} mẫu định khoản nhanh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Xóa mẫu định khoản nhanh"
        description={`Xác nhận xóa mẫu "${deletingItem?.name}" (${deletingItem?.code})?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
