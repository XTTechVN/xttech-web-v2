import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomJointsTableProps {
  joints: DoorCalculateResponse['cornerJoints'];
  hasUnconfiguredJoints?: boolean;
  totalJointPrice?: number;
}

export const BomJointsTable: React.FC<BomJointsTableProps> = ({
  joints = [],
  hasUnconfiguredJoints,
  totalJointPrice,
}) => {
  return (
    <div className="space-y-3">
      {hasUnconfiguredJoints && (
        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <span className="text-base leading-none">⚠️</span>
          <div className="space-y-0.5">
            <p className="font-bold">Chưa cấu hình con ke cụ thể từ hãng</p>
            <p className="text-[11px] text-amber-800">
              Các vị trí liên kết góc đã được tính số lượng theo thiết kế, nhưng chưa được gán mã con ke trong gói phụ kiện để lấy đơn giá thật.
            </p>
          </div>
        </div>
      )}

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px] uppercase tracking-wider">
            <th className="py-2.5 px-2.5 sm:px-3">Vị trí & Con ke</th>
            <th className="py-2.5 px-2 hidden sm:table-cell">Phương pháp</th>
            <th className="py-2.5 px-2 text-center whitespace-nowrap">SL</th>
            <th className="py-2.5 px-2 text-right hidden sm:table-cell">Đơn giá</th>
            <th className="py-2.5 px-2.5 sm:px-3 text-right whitespace-nowrap">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {joints.map((j, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-2.5 px-2.5 sm:px-3">
                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {j.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] mt-0.5 flex-wrap">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      j.jointType === 'ke_vinh_cuu'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {j.jointType === 'ke_vinh_cuu' ? 'Ke vĩnh cửu' : 'Ke ép góc'}
                  </span>
                  {j.isConfigured ? (
                    <span className="font-mono text-slate-600 font-medium">
                      {j.accessoryCode}
                    </span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-1 rounded text-[10px] font-semibold border border-amber-200/60">
                      Chưa cấu hình mã
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 hidden sm:table-cell text-slate-600">
                {j.jointType === 'ke_vinh_cuu' ? 'Bắt vít lục giác' : 'Dập bấm góc'}
              </td>
              <td className="py-2.5 px-2 text-center whitespace-nowrap">
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                  {j.qty}
                </span>
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-600 hidden sm:table-cell whitespace-nowrap">
                {j.unitPrice && j.unitPrice > 0
                  ? j.unitPrice.toLocaleString('vi-VN') + ' đ'
                  : '—'}
              </td>
              <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                {j.totalPrice && j.totalPrice > 0
                  ? j.totalPrice.toLocaleString('vi-VN') + ' đ'
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalJointPrice !== undefined && totalJointPrice > 0 && (
        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Tổng chi phí ke liên kết:</span>
          <span className="font-bold text-sm text-blue-700 font-mono">
            {totalJointPrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
      )}
    </div>
  );
};
