'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Search, MapPin, AlertCircle } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { WarehouseOffcut } from '@/types';

interface OffcutsTabProps {
  offcuts: WarehouseOffcut[];
  loading: boolean;
  onOpenAddOffcut: () => void;
}

const OFFCUT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  available: { label: 'Sẵn sàng', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  reserved: { label: 'Đã giữ chỗ Lệnh SX', bg: 'bg-amber-50', text: 'text-amber-700' },
  consumed: { label: 'Đã sử dụng hết', bg: 'bg-slate-100', text: 'text-slate-500' },
};

export function OffcutsTab({ offcuts, loading, onOpenAddOffcut }: OffcutsTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [minLength, setMinLength] = useState<string>('');

  const filteredOffcuts = useMemo(() => {
    return offcuts.filter((offcut) => {
      const matchStatus = filterStatus === 'all' || offcut.status === filterStatus;
      const matchMinLen = !minLength || offcut.lengthMm >= Number(minLength);
      return matchStatus && matchMinLen;
    });
  }, [offcuts, filterStatus, minLength]);

  return (
    <div className="space-y-4">
      {/* Optimization Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <span className="font-bold">Thuật toán Tối ưu Cắt 1D (Cutting Stock):</span> Toàn bộ các thanh nhôm thừa tái sử dụng có chiều dài từ 1.0m (1000mm) trở lên ở trạng thái <em>Sẵn sàng dùng</em> sẽ được bộ tối ưu cắt tự động quét và phân bổ vào các đơn hàng sản xuất trước khi cắt cây nhôm nguyên 6m, giúp xưởng giảm tối đa tỷ lệ phế liệu nhôm.
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-56">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'available', label: 'Sẵn sàng dùng (Khả dụng)' },
                { value: 'reserved', label: 'Đang giữ chỗ Lệnh SX' },
                { value: 'consumed', label: 'Đã sử dụng hết' },
              ]}
              className="text-xs"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <Input
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
              placeholder="Chiều dài tối thiểu (mm)..."
              className="text-xs"
              min={1000}
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddOffcut}
          leftIcon={<Plus size={14} />}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 shrink-0"
        >
          Thu Hồi Nhôm Thừa Mới
        </Button>
      </div>

      {/* Offcuts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-28">Mã Nhôm Thừa</th>
                <th className="p-3">Thanh Profile</th>
                <th className="p-3">Màu Sắc</th>
                <th className="p-3 text-right">Chiều Dài (mm)</th>
                <th className="p-3">Vị Trí Lưu Kho</th>
                <th className="p-3">Giữ Chỗ Bởi Kế Hoạch</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3">Ngày Thu Hồi</th>
                <th className="p-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Đang tải danh sách nhôm thừa tái sử dụng...
                  </td>
                </tr>
              ) : filteredOffcuts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không có thanh nhôm thừa nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOffcuts.map((item) => {
                  const statusConf = OFFCUT_STATUS_MAP[item.status] || {
                    label: item.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-600',
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        #{item.id}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {item.profileBarCode ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{item.profileBarCode}</span>
                            {item.profileBarName && (
                              <span className="text-[11px] text-slate-500">{item.profileBarName}</span>
                            )}
                          </div>
                        ) : (
                          <span>Thanh Profile #{item.profileBarId}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                            style={{ backgroundColor: item.colorHex || '#cbd5e1' }}
                            title={item.colorHex || undefined}
                          />
                          <span className="text-slate-700 font-medium">
                            {item.colorName || item.colorCode || `Màu #${item.colorId}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700 text-sm">
                        {item.lengthMm.toLocaleString('vi-VN')} mm
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.location ? (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin size={12} className="text-slate-400" />
                            {item.location}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.reservedByPlanId ? (
                          <span className="text-amber-700 font-medium">
                            Kế hoạch #{item.reservedByPlanId}
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa có kế hoạch</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConf.bg} ${statusConf.text}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-slate-500 italic max-w-xs truncate">
                        {item.note || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
