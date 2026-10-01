import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomGrillesTableProps {
  grilles: DoorCalculateResponse['grilles'];
  totalGrillePrice?: number;
}

export const BomGrillesTable: React.FC<BomGrillesTableProps> = ({
  grilles = [],
  totalGrillePrice,
}) => {
  return (
    <div className="space-y-4">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <th className="py-2 px-2">Ô kính & Bóc tách</th>
            <th className="py-2 px-2">Quy cách nan</th>
            <th className="py-2 px-2 text-center">Bóc tách dài (m)</th>
            <th className="py-2 px-2 text-center">Hoa văn</th>
            <th className="py-2 px-2 text-right">Đơn giá / m</th>
            <th className="py-2 px-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {grilles.map((g, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-2.5 px-2">
                <div className="font-bold text-slate-900 font-mono">{g.cellPath}</div>
                <div className="text-[10px] text-slate-400">
                  Lưới: {g.gridLengthM}m | Viền: {g.borderLengthM}m | Góc: {g.cornerLengthM}m
                </div>
              </td>
              <td className="py-2.5 px-2">
                <span className="font-semibold text-slate-800">
                  Bản {g.barWidthMm}mm ({g.barColor})
                </span>
              </td>
              <td className="py-2.5 px-2 text-center font-bold font-mono text-amber-700">
                {g.totalBarLengthM} m
              </td>
              <td className="py-2.5 px-2 text-center">
                {g.motifQty > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {g.motifQty} con
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                {g.unitPricePerM.toLocaleString('vi-VN')} đ
              </td>
              <td className="py-2.5 px-2 text-right font-bold font-mono text-slate-900">
                {g.totalPrice.toLocaleString('vi-VN')} đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalGrillePrice !== undefined && totalGrillePrice > 0 && (
        <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-900">
          <span>Tổng chi phí gia công kính nan đồng:</span>
          <span className="font-bold text-sm text-amber-700 font-mono">
            {totalGrillePrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
      )}
    </div>
  );
};
