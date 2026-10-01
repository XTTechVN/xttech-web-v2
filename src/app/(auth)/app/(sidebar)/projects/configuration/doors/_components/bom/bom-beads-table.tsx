import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomBeadsTableProps {
  beads: DoorCalculateResponse['groupedBeads'];
}

export const BomBeadsTable: React.FC<BomBeadsTableProps> = ({ beads }) => {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px] uppercase tracking-wider">
          <th className="py-2.5 px-2.5 sm:px-3">Vị trí nẹp kính</th>
          <th className="py-2.5 px-2 text-right whitespace-nowrap">Dài (mm)</th>
          <th className="py-2.5 px-2 text-center whitespace-nowrap">Góc cắt</th>
          <th className="py-2.5 px-2 text-center whitespace-nowrap">SL</th>
          <th className="py-2.5 px-3 text-right hidden sm:table-cell">Độ dày</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {beads.map((b, idx) => (
          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
            <td className="py-2.5 px-2.5 sm:px-3">
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                {b.name}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5 flex-wrap">
                {b.profileCode && (
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100/60">
                    {b.profileCode}
                  </span>
                )}
                <span className="sm:hidden text-slate-400 font-sans">
                  · Dày {b.thicknessMm}mm
                </span>
              </div>
            </td>
            <td className="py-2.5 px-2 text-right font-bold text-blue-600 font-mono text-xs sm:text-sm whitespace-nowrap">
              {b.length.toLocaleString('vi-VN')}
            </td>
            <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-700 whitespace-nowrap">
              {b.goc1}° / {b.goc2}°
            </td>
            <td className="py-2.5 px-2 text-center whitespace-nowrap">
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                {b.qty}
              </span>
            </td>
            <td className="py-2.5 px-3 text-right text-slate-600 hidden sm:table-cell font-mono text-xs">
              {b.thicknessMm} mm
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
