import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomGlassTableProps {
  cells: DoorCalculateResponse['cells'];
}

export const BomGlassTable: React.FC<BomGlassTableProps> = ({ cells }) => {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px]">
          <th className="py-2.5 px-2.5 sm:px-3">Quy cách & Vị trí kính</th>
          <th className="py-2.5 px-2 text-right whitespace-nowrap">Rộng × Cao (mm)</th>
          <th className="py-2.5 px-2 sm:px-3 text-right whitespace-nowrap">Diện tích (m²)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {cells.map((c, idx) => (
          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
            <td className="py-2.5 px-2.5 sm:px-3">
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug flex items-center gap-1.5 flex-wrap">
                <span>{c.glassName || 'Kính cường lực tiêu chuẩn'}</span>
                {c.isExtra && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Bổ sung
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 tabular-nums mt-0.5">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100/60">{c.path}</span>
                {c.openType && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className=" text-slate-400 capitalize">{c.openType === 'fixed' ? 'Ô cố định' : c.openType}</span>
                  </>
                )}
              </div>
            </td>
            <td className="py-2.5 px-2 text-right font-bold text-emerald-600 tabular-nums text-xs sm:text-sm whitespace-nowrap">
              {c.glassW} × {c.glassH}
            </td>
            <td className="py-2.5 px-2 sm:px-3 text-right font-semibold text-slate-800 tabular-nums text-xs sm:text-sm whitespace-nowrap">
              {c.areaM2.toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
