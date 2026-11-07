'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Layers } from 'lucide-react';
import { ConfirmActionModal } from '@/components';
import { getAccessoryCombos } from '@/actions';
import type { Accessory } from '@/types';

interface AccessoryDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  mode: 'single' | 'bulk';
  accessory?: Accessory | null;
  bulkIds?: number[];
  selectedBrandName?: string;
}

export function AccessoryDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  mode,
  accessory,
  bulkIds = [],
  selectedBrandName,
}: AccessoryDeleteConfirmModalProps) {
  const targetIdSet = useMemo(() => {
    if (mode === 'single' && accessory?.id) {
      return new Set<number>([accessory.id]);
    }
    return new Set<number>(bulkIds);
  }, [mode, accessory, bulkIds]);

  const { data: combosData, isLoading: isCombosLoading } = useQuery({
    queryKey: ['accessory-combos', 'delete-impact-check'],
    queryFn: async () => (await getAccessoryCombos({ limit: 9999, offset: 0 })).items || [],
    enabled: isOpen && targetIdSet.size > 0,
  });

  const affectedCombos = useMemo(() => {
    if (!combosData || targetIdSet.size === 0) return [];
    return combosData.filter((combo) =>
      (combo.comboItems || []).some((item) => targetIdSet.has(Number(item.accessoryId))),
    );
  }, [combosData, targetIdSet]);

  const isSingle = mode === 'single';
  const title = isSingle ? 'Xác nhận xóa phụ kiện' : 'Xác nhận xóa hàng loạt phụ kiện';
  const confirmText = isSingle
    ? 'Xác nhận xóa phụ kiện & combo'
    : `Xóa ${bulkIds.length} phụ kiện`;

  const description = isSingle ? (
    <>
      Bạn có chắc chắn muốn xóa phụ kiện{' '}
      <strong className="text-slate-900">{accessory?.name || ''}</strong>
      {accessory?.code ? (
        <>
          {' '}
          (<span className="font-mono text-xs text-slate-700">{accessory.code}</span>)
        </>
      ) : null}{' '}
      không?
    </>
  ) : (
    <>
      Bạn có chắc chắn muốn xóa <strong className="text-slate-900">{bulkIds.length}</strong> phụ kiện
      đã chọn{selectedBrandName ? (
        <>
          {' '}
          thuộc hãng <strong className="text-slate-900">{selectedBrandName}</strong>
        </>
      ) : null}{' '}
      không?
    </>
  );

  const warningNote = (
    <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-rose-700 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-rose-800">Cảnh báo xóa kèm gói Combo phụ kiện:</span>{' '}
          Khi bạn xóa {isSingle ? 'phụ kiện này' : 'các phụ kiện đã chọn'}, hệ thống sẽ{' '}
          <strong>tự động xóa luôn toàn bộ các gói combo phụ kiện có chứa chúng</strong> để tránh phát
          sinh gói combo khuyết vật tư khi thiết kế cửa và bóc tách báo giá.
        </div>
      </div>

      {isCombosLoading ? (
        <div className="text-[11px] text-rose-600 italic pl-6">
          Đang kiểm tra các gói combo phụ kiện bị ảnh hưởng...
        </div>
      ) : affectedCombos.length > 0 ? (
        <div className="pl-6 flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>
              Có {affectedCombos.length} gói combo đang chứa phụ kiện này sẽ bị xóa theo:
            </span>
          </div>
          <ul className="max-h-32 overflow-y-auto rounded-md border border-rose-200/80 bg-white/90 px-2.5 py-1.5 space-y-1 text-[11px] text-slate-700">
            {affectedCombos.map((combo) => (
              <li key={combo.id} className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-slate-800">{combo.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                  {combo.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-[11px] text-slate-600 pl-6">
          Hiện chưa phát hiện gói combo đang hoạt động nào chứa{' '}
          {isSingle ? 'phụ kiện này' : 'các phụ kiện đã chọn'}.
        </div>
      )}
    </div>
  );

  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      warningNote={warningNote}
      confirmText={confirmText}
      variant="danger"
      loading={loading}
    />
  );
}

