'use client';

import React from 'react';
import { AccessoryCombo } from '@/types';
import { Wrench, CheckCircle2 } from 'lucide-react';

interface AccessoriesTabViewProps {
  combos: AccessoryCombo[];
  selectedComboId?: number | null;
  onSelectCombo: (comboId: number) => void;
  hardwareColor?: string;
  onChangeHardwareColor?: (color: string) => void;
}

export const AccessoriesTabView: React.FC<AccessoriesTabViewProps> = ({
  combos,
  selectedComboId,
  onSelectCombo,
}) => {
  const activeCombo = combos.find((c) => c.id === selectedComboId) || combos[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex justify-center">
      <div className="max-w-3xl w-full space-y-5 text-xs text-gray-800">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">Bộ Phụ Kiện Kim Khí Đồng Bộ</h3>
          </div>
          <p className="text-xs text-gray-500">
            Chọn bộ combo phụ kiện tiêu chuẩn (Bản lề, Tay nắm, Khóa, Chốt...) tương thích với mẫu cửa
          </p>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {combos.map((c) => {
            const isSelected = (selectedComboId || activeCombo?.id) === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCombo(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 bg-white ${
                  isSelected
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{c.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">Mã: {c.code}</div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">Đơn giá tham khảo:</span>
                  <span className="font-bold text-sm text-blue-700 font-mono">
                    {c.totalComboPrice ? c.totalComboPrice.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chi tiết phụ kiện trong combo */}
        {activeCombo && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="font-bold text-xs text-gray-900 flex items-center justify-between border-b border-gray-100 pb-2">
              <span>Chi tiết vật tư trong: {activeCombo.name}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">Đồng bộ chính hãng</span>
            </div>
            <div className="divide-y divide-gray-100">
              {activeCombo.comboItems && activeCombo.comboItems.length > 0 ? (
                activeCombo.comboItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">
                        {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 font-mono">{item.quantity} món</span>
                      {item.note && <span className="text-[11px] text-gray-400 italic">({item.note})</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-400 italic">Combo đang cập nhật chi tiết vật tư phụ kiện</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
