import React from 'react';
import { DoorCalculateResponse } from '@/types';

const CATEGORY_MAP: Record<string, string> = {
  frame: 'Khung bao',
  sash_h: 'Cánh đứng',
  sash_w: 'Cánh ngang',
  dodong: 'Đố động',
  bead: 'Nẹp kính',
};

interface BomBarsTableProps {
  bars: DoorCalculateResponse['groupedBars'];
}

export const BomBarsTable: React.FC<BomBarsTableProps> = ({ bars }) => {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px] uppercase tracking-wider">
          <th className="py-2.5 px-2.5 sm:px-3">Chi tiết thanh nhôm</th>
          <th className="py-2.5 px-2 text-right whitespace-nowrap">Dài (mm)</th>
          <th className="py-2.5 px-2 text-center whitespace-nowrap">Góc cắt</th>
          <th className="py-2.5 px-2 text-center whitespace-nowrap">SL</th>
          <th className="py-2.5 px-3 text-right hidden sm:table-cell">Trừ lọt</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {bars.map((bar, idx) => (
          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
            <td className="py-2.5 px-2.5 sm:px-3">
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                {bar.name}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5 flex-wrap">
                {bar.profileCode && (
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100/60">
                    {bar.profileCode}
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="font-sans text-slate-400">
                  {CATEGORY_MAP[bar.category] || bar.category}
                </span>
              </div>
            </td>
            <td className="py-2.5 px-2 text-right font-bold text-blue-600 font-mono text-xs sm:text-sm whitespace-nowrap">
              {bar.length.toLocaleString('vi-VN')}
            </td>
            <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-700 whitespace-nowrap">
              {bar.goc1}°/{bar.goc2}°
            </td>
            <td className="py-2.5 px-2 text-center whitespace-nowrap">
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                {bar.qty}
              </span>
            </td>
            <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px] hidden sm:table-cell">
              {bar.formula || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
