'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassOrderItem } from '@/types';

import { MANUAL_REASON_MAP, GRIND_LABEL_MAP } from '../_utils/glass-mapping';

interface GlassPanesDetailTableProps {
  items: GlassOrderItem[];
}

export function GlassPanesDetailTable({ items }: GlassPanesDetailTableProps) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        Danh Sách Quy Cách Tấm Kính Cắt Nhà Máy ({items.length})
      </span>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-2.5">Vị Trí Cửa</th>
              <th className="p-2.5">Ký Hiệu Ô Kính</th>
              <th className="p-2.5">Quy Cách Kính</th>
              <th className="p-2.5 text-right">Rộng x Cao (mm)</th>
              <th className="p-2.5 text-right">Diện Tích (m²)</th>
              <th className="p-2.5">Mài Cạnh</th>
              <th className="p-2.5 text-center">Trạng Thái Bản Vẽ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isManual = item.paneSource === 'manual' || !item.positionId;
              const reasonLabel = item.manualReason ? MANUAL_REASON_MAP[item.manualReason] : 'Kính lẻ';

              return (
                <tr key={item.id} className={`hover:bg-slate-50/50 ${isManual ? 'bg-amber-50/30' : ''}`}>
                  <td className="p-2.5 font-medium text-slate-800">
                    {isManual ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        {reasonLabel}
                      </span>
                    ) : (
                      item.doorName || item.positionCode || `Vị trí #${item.positionId}`
                    )}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700">
                    {item.paneLabel || '-'}
                  </td>
                  <td className="p-2.5 text-slate-700">{item.glassType}</td>
                  <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                    {item.widthMm} × {item.heightMm} mm
                  </td>
                  <td className="p-2.5 text-right font-medium text-indigo-700">
                    {item.areaM2.toFixed(3)} m²
                  </td>
                  <td className="p-2.5 text-slate-600">
                    {GRIND_LABEL_MAP[item.grindType || ''] || item.grindType || 'Mài xiết cạnh'}
                  </td>
                  <td className="p-2.5 text-center">
                    {isManual ? (
                      <span className="text-amber-700 font-medium text-[11px]">
                        Kính lẻ phát sinh
                      </span>
                    ) : item.isRevisionStale ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle size={10} />
                        Đã sửa thiết kế sau bóc tách
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[11px]">
                        Đồng bộ chuẩn
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
