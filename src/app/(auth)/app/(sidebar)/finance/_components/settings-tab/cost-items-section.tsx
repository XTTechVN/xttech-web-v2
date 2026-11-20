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
import { deleteCostItem } from '@/actions';
import {
  COST_FLOW_TYPE_MAP,
  COST_FLOW_TYPE_OPTIONS,
  COST_GROUP_MAP,
  COST_GROUP_OPTIONS,
} from '@/config/finance';
import type { CostItem } from '@/types';
import { includesSearchText, showErrorToast, showSuccessToast } from '@/utils';

interface CostItemsSectionProps {
  costItems: CostItem[];
  onRefreshMaster: () => Promise<void> | void;
  onCreateCostItem: () => void;
  onEditCostItem: (item: CostItem) => void;
}

export function CostItemsSection({
  costItems,
  onRefreshMaster,
  onCreateCostItem,
  onEditCostItem,
}: CostItemsSectionProps) {
  const [search, setSearch] = useState('');
  const [flowFilter, setFlowFilter] = useState<string | undefined>();
  const [groupFilter, setGroupFilter] = useState<string | undefined>();
  const [deletingItem, setDeletingItem] = useState<CostItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(
    () =>
      costItems.filter((item) => {
        if (
          search.trim() &&
          !includesSearchText(item.code, search) &&
          !includesSearchText(item.name, search)
        ) {
          return false;
        }
        if (flowFilter && item.flowType !== flowFilter) return false;
        if (groupFilter && item.costGroup !== groupFilter) return false;
        return true;
      }),
    [costItems, search, flowFilter, groupFilter],
  );

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteCostItem(deletingItem.id);
      showSuccessToast(`Đã xóa khoản mục ${deletingItem.name}`);
      setDeletingItem(null);
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa khoản mục chi phí');
    } finally {
      setDeleting(false);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      {
        label: 'Loại dòng',
        value: flowFilter,
        options: COST_FLOW_TYPE_OPTIONS,
        onChange: setFlowFilter,
      },
      {
        label: 'Nhóm khoản mục',
        value: groupFilter,
        options: COST_GROUP_OPTIONS,
        onChange: setGroupFilter,
      },
    ],
    [flowFilter, groupFilter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch
            placeholder="Tìm mã hoặc tên khoản mục chi phí..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <TableFilters filters={filters} />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateCostItem}
          leftIcon={<Plus size={14} />}
        >
          Thêm khoản mục
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Mã KM</th>
                <th className="p-3">Tên khoản mục</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Nhóm giá thành</th>
                <th className="p-3 text-center">Mặc định TNDN</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const flowMeta = COST_FLOW_TYPE_MAP[item.flowType];
                const groupMeta = COST_GROUP_MAP[item.costGroup];
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-primary">{item.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-3">
                      <Badge variant={flowMeta?.variant || 'default'} size="sm">
                        {flowMeta?.shortLabel || item.flowType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={groupMeta?.variant || 'default'} size="sm">
                        {groupMeta?.shortLabel || item.costGroup}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={item.defaultIsTaxDeductible ? 'success' : 'warning'} size="sm">
                        {item.defaultIsTaxDeductible ? 'Được trừ' : 'Loại B4'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={item.isActive ? 'success' : 'default'} size="sm">
                        {item.isActive ? 'Đang dùng' : 'Ngưng'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => onEditCostItem(item)}>
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDeletingItem(item)}
                          className="text-rose-600"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={7} className="p-3">
                  Tổng cộng {filtered.length} khoản mục chi phí / thu nhập
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Xóa khoản mục chi phí"
        description={`Xác nhận xóa khoản mục "${deletingItem?.name}" (${deletingItem?.code})?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
