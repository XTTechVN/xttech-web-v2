'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Pencil, Trash2, PackageOpen, ChevronLeft, Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { updateAccessoryCombo } from '@/actions';
import { formatCurrency, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { AccessoryCombo } from '@/types';

const APPLY_FOR_LABEL: Record<string, { label: string; cls: string }> = {
  khung: { label: 'Khung', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  canh: { label: 'Cánh', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  huong_mo: { label: 'Hướng mở', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  khac: { label: 'Khác', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const OPENING_TYPE_LABEL: Record<string, string> = {
  vach_co_dinh: 'Vách cố định',
  '2_canh_mo': '2 cánh mở',
  '1_canh_quay_trai': '1 cánh quay (T)',
  '1_canh_quay_phai': '1 cánh quay (P)',
  mo_hat_khong_song: 'Mở hạt',
  mo_lat_khong_song: 'Mở lật',
  lat_xuong: 'Lật xuống',
  quay_va_lat: 'Quay & Lật',
  canh_truot_luoi: 'Trượt lưới',
  canh_truot_ngang: 'Trượt ngang',
};

interface ComboTableProps {
  combos: AccessoryCombo[];
  isLoading: boolean;
  search: string;
  total: number;
  offset: number;
  pageSize: number;
  onEdit: (combo: AccessoryCombo) => void;
  onDelete: (combo: AccessoryCombo) => void;
  onPageChange: (offset: number) => void;
}

function ComboSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-4 px-4"><div className="w-4 h-4 bg-slate-100 rounded" /></td>
          <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
          <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-48" /></td>
          <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-100 rounded w-8 mx-auto" /></td>
          <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
          <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
          <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
          <td className="py-4 px-4 text-right"><div className="h-5 bg-slate-100 rounded w-12 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

function ComboEmptyState({ search }: { search: string }) {
  return (
    <tr>
      <td colSpan={8} className="py-16 text-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <PackageOpen size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {search ? 'Không tìm thấy combo phù hợp' : 'Chưa có gói combo nào'}
          </p>
          <p className="text-xs text-slate-400">Nhấn &quot;Thêm combo mới&quot; để tạo gói combo đầu tiên.</p>
        </div>
      </td>
    </tr>
  );
}

function ComboRow({
  combo,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  combo: AccessoryCombo;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { mutate: toggleDefault, isPending: isSettingDefault } = useMutation({
    mutationFn: () => updateAccessoryCombo(combo.id, { isDefault: !combo.isDefault }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessory-combos'] }),
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật mặc định'),
  });
  return (
    <React.Fragment>
      <tr
        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
        onClick={onToggle}
      >
        {/* Toggle */}
        <td className="py-3.5 px-4 text-slate-400">
          <ChevronRight
            size={14}
            className={`transition-transform duration-150 ${isExpanded ? 'rotate-90 text-primary' : ''}`}
          />
        </td>

        {/* Mã gói */}
        <td className="py-3.5 px-4">
          <span className="font-mono font-bold text-xs text-primary">{combo.code}</span>
        </td>

        {/* Tên gói */}
        <td className="py-3.5 px-4">
          <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
            {combo.name}
          </span>
          {combo.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{combo.description}</p>
          )}
        </td>

        {/* Dành cho */}
        <td className="py-3.5 px-4 text-center">
          {(() => {
            const af = combo.applyFor || 'khung';
            const cfg = APPLY_FOR_LABEL[af] || APPLY_FOR_LABEL.khac;
            return (
              <div className="flex flex-col items-center gap-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.cls}`}>
                  {cfg.label}
                </span>
                {af === 'huong_mo' && combo.openingType && (
                  <span className="text-[10px] text-amber-500 font-medium">
                    {OPENING_TYPE_LABEL[combo.openingType] || combo.openingType}
                  </span>
                )}
              </div>
            );
          })()}
        </td>

        {/* Số món */}
        <td className="py-3.5 px-4 text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {combo.comboItems?.length ?? 0} món
          </span>
        </td>

        {/* Tổng giá */}
        <td className="py-3.5 px-4 text-right">
          <span className="font-semibold text-emerald-700 text-sm whitespace-nowrap">
            {formatCurrency(combo.totalComboPrice || 0)}
          </span>
        </td>

        {/* Mặc định */}
        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={isSettingDefault}
            onClick={() => toggleDefault()}
            title={combo.isDefault ? 'Huỷ mặc định' : 'Đặt làm mặc định'}
            className="cursor-pointer disabled:cursor-wait transition-transform hover:scale-110 active:scale-95 inline-flex"
          >
            <motion.div
              animate={isSettingDefault ? { rotate: 360 } : { rotate: 0 }}
              transition={isSettingDefault
                ? { repeat: Infinity, duration: 0.7, ease: 'linear' }
                : { duration: 0.2 }
              }
            >
              <Star
                size={18}
                className={combo.isDefault
                  ? 'fill-primary text-primary'
                  : 'text-slate-300 hover:text-slate-400'
                }
              />
            </motion.div>
          </button>
        </td>

        {/* Trạng thái */}
        <td className="py-3.5 px-4 text-center">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
              combo.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {combo.isActive ? 'Hoạt động' : 'Tạm ngưng'}
          </span>
        </td>

        {/* Thao tác */}
        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={9} className="p-0">
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 pl-14">
                  <div className="flex flex-col gap-1.5">
                    {(combo.comboItems || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-1.5 px-3 bg-white rounded-lg border border-slate-100 shadow-2xs">
                        {/* Số thứ tự */}
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Code badge */}
                        {item.accessoryCode && (
                          <span className="font-mono text-[11px] font-bold text-primary bg-primary/8 border border-primary/15 px-1.5 py-0.5 rounded shrink-0">
                            {item.accessoryCode}
                          </span>
                        )}

                        {/* Tên */}
                        <span className="flex-1 text-xs text-slate-700 font-medium min-w-0 truncate">
                          {item.accessoryName || '—'}
                        </span>

                        {/* Phân loại */}
                        {item.category && (
                          <span className="text-[11px] text-slate-400 shrink-0 hidden sm:block">{item.category}</span>
                        )}

                        {/* SL + đơn vị */}
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                          ×{item.quantity} {item.unit || ''}
                        </span>

                        {/* Ghi chú */}
                        {item.note && (
                          <span className="text-[11px] text-slate-400 italic shrink-0 hidden md:block max-w-[140px] truncate">
                            {item.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </td>
      </tr>
    </React.Fragment>
  );
}

export function ComboTable({
  combos,
  isLoading,
  search,
  total,
  offset,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
}: ComboTableProps) {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const hasNext = offset + pageSize < total;
  const hasPrev = offset > 0;
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 tracking-normal">
              <th className="py-3 px-4 w-10" />
              <th className="py-3 px-4 w-40">Mã gói</th>
              <th className="py-3 px-4 min-w-[200px]">Tên gói combo</th>
              <th className="py-3 px-4 w-28 text-center">Dành cho</th>
              <th className="py-3 px-4 w-28 text-center">Số món</th>
              <th className="py-3 px-4 w-32 text-right">Tổng giá</th>
              <th className="py-3 px-4 w-20 text-center">Mặc định</th>
              <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
              <th className="py-3 px-4 w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <ComboSkeleton />
            ) : combos.length === 0 ? (
              <ComboEmptyState search={search} />
            ) : (
              combos.map((combo) => (
                <ComboRow
                  key={combo.id}
                  combo={combo}
                  isExpanded={expandedId === combo.id}
                  onToggle={() => setExpandedId(expandedId === combo.id ? null : combo.id)}
                  onEdit={() => onEdit(combo)}
                  onDelete={() => onDelete(combo)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Trang {currentPage} / {totalPages} &nbsp;·&nbsp; {total} gói combo
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onPageChange(Math.max(0, offset - pageSize))}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onPageChange(offset + pageSize)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
