import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomGlassTableProps {
  cells: DoorCalculateResponse['cells'];
}

export const BomGlassTable: React.FC<BomGlassTableProps> = ({ cells }) => {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px] uppercase tracking-wider">
          <th className="py-2.5 px-2.5 sm:px-3">Quy cách & Vị trí kính</th>
          <th className="py-2.5 px-2 text-right whitespace-nowrap">Rộng × Cao (mm)</th>
          <th className="py-2.5 px-2 sm:px-3 text-right whitespace-nowrap">Diện tích (m²)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {cells.map((c, idx) => (
          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
            <td className="py-2.5 px-2.5 sm:px-3">
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                {c.glassName || 'Kính cường lực tiêu chuẩn'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100/60">
                  {c.path}
                </span>
                {c.openType && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-sans text-slate-400 capitalize">
                      {c.openType === 'fixed' ? 'Ô cố định' : c.openType}
                    </span>
                  </>
                )}
              </div>
            </td>
            <td className="py-2.5 px-2 text-right font-bold text-emerald-600 font-mono text-xs sm:text-sm whitespace-nowrap">
              {c.glassW} × {c.glassH}
            </td>
            <td className="py-2.5 px-2 sm:px-3 text-right font-semibold text-slate-800 font-mono text-xs sm:text-sm whitespace-nowrap">
              {c.areaM2.toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
