import React from 'react';
import { DoorCalculateResponse, formatAccessoryUnit, type HardwareWarningItem } from '@/types';
import { CORNER_JOINT_POSITION_MAP, CORNER_JOINT_TYPE_MAP } from '@/config';
import { HardwareWarningsBanner } from '@/components/door-studio';

interface BomJointsTableProps {
  joints: DoorCalculateResponse['cornerJoints'];
  warnings?: HardwareWarningItem[];
  hasUnconfiguredJoints?: boolean;
  totalJointPrice?: number;
}

export const BomJointsTable: React.FC<BomJointsTableProps> = ({ joints = [], warnings, hasUnconfiguredJoints, totalJointPrice }) => {
  const jointWarnings = (warnings ?? []).filter((w) => w.target === 'frame' || w.target === 'sash' || w.target === 'safety_frame');

  return (
    <div className="space-y-3">
      <HardwareWarningsBanner warnings={jointWarnings} fallbackUnconfigured={!warnings?.length ? hasUnconfiguredJoints : false} compact />

      {joints.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-block p-8 text-center bg-slate-50/50 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Chưa có con ke góc nào trong gói thiết kế.</p>
          <p className="text-[11px] text-slate-400">Chọn gói combo phụ kiện khung hoặc cánh có kèm con ke góc để thống kê chi tiết.</p>
        </div>
      ) : (
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px]">
              <th className="py-2.5 px-2.5 sm:px-3">Vị trí & Con ke</th>
              <th className="py-2.5 px-2 hidden sm:table-cell">Phương pháp liên kết</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">SL</th>
              <th className="py-2.5 px-2 text-right hidden sm:table-cell">Đơn giá</th>
              <th className="py-2.5 px-2.5 sm:px-3 text-right whitespace-nowrap">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {joints.map((j, idx) => {
              const posLabel = CORNER_JOINT_POSITION_MAP[j.position] || j.position;
              const typeCfg = CORNER_JOINT_TYPE_MAP[j.jointType || ''] || {
                label: 'Ke ép góc',
                methodLabel: 'Dập bấm góc',
                badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200/60',
              };
              const unitLabel = formatAccessoryUnit(j.unit) || 'Cái';

              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-2.5 sm:px-3">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{j.accessoryName || j.name}</div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] mt-0.5 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                        {posLabel}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${typeCfg.badgeClass}`}>{typeCfg.label}</span>
                      {j.isConfigured ? (
                        <span className="tabular-nums text-slate-600 font-medium">{j.accessoryCode}</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-1 rounded text-[10px] font-semibold border border-amber-200/60">
                          Chưa cấu hình mã
                        </span>
                      )}
                      {j.comboName && <span className="text-slate-400">· {j.comboName}</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 hidden sm:table-cell text-slate-600">
                    <div>{typeCfg.methodLabel}</div>
                    {j.note && <div className="text-[10px] text-slate-400 mt-0.5">{j.note}</div>}
                  </td>
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-slate-100 font-bold text-slate-900 text-xs tabular-nums">
                      {j.qty}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{unitLabel}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 hidden sm:table-cell whitespace-nowrap">
                    {j.unitPrice > 0 ? `${j.unitPrice.toLocaleString('vi-VN')} đ` : '—'}
                  </td>
                  <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {j.totalPrice > 0 ? `${j.totalPrice.toLocaleString('vi-VN')} đ` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {totalJointPrice !== undefined && totalJointPrice > 0 && (
        <div className="p-3 bg-slate-50 rounded-block flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Tổng chi phí ke liên kết:</span>
          <span className="font-bold text-sm text-blue-700 tabular-nums">{totalJointPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      )}
    </div>
  );
};
