'use client';

import React from 'react';
import { DoorCalculateResponse, formatAccessoryUnit } from '@/types';
import { CORNER_JOINT_POSITION_MAP, CORNER_JOINT_TYPE_MAP } from '@/config';

interface ResultsHardwareSectionProps {
  calcData: DoorCalculateResponse;
}

export const ResultsHardwareSection: React.FC<ResultsHardwareSectionProps> = ({ calcData }) => {
  const joints = calcData.cornerJoints ?? [];
  const accessories = calcData.accessories ?? [];
  const totalJointPrice =
    calcData.totalJointPrice ?? joints.reduce((sum, j) => sum + (j.totalPrice || 0), 0);
  const totalAccessoryPrice =
    calcData.totalAccessoryPrice ?? accessories.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  const combinedTotalPrice = totalJointPrice + totalAccessoryPrice;

  return (
    <div className="space-y-5 text-xs">
      {/* 1. Con ke & Liên kết góc */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            1. Con ke & Liên kết góc ({joints.length})
          </h4>
          {totalJointPrice > 0 && (
            <span className="text-slate-600 font-semibold tabular-nums">
              Cộng ke góc: <strong className="text-primary">{totalJointPrice.toLocaleString('vi-VN')} đ</strong>
            </span>
          )}
        </div>

        {joints.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">
            Chưa có dữ liệu con ke góc cho cấu hình cửa này.
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70 text-[11px]">
                  <th className="py-2.5 px-3">Vị trí</th>
                  <th className="py-2.5 px-3">Tên & Mã vật tư</th>
                  <th className="py-2.5 px-3">Kiểu liên kết</th>
                  <th className="py-2.5 px-3">Công thức quy đổi</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {joints.map((j, idx) => {
                  const posLabel = CORNER_JOINT_POSITION_MAP[j.position] || j.position;
                  const typeCfg = CORNER_JOINT_TYPE_MAP[j.jointType || ''] || {
                    label: j.jointType || 'Ke góc',
                    methodLabel: 'Liên kết góc',
                    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200/60',
                  };
                  const unitLabel = formatAccessoryUnit(j.unit) || 'Cái';
                  return (
                    <tr key={`res-joint-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        {posLabel}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">
                          {j.accessoryName || j.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 flex-wrap">
                          {j.isConfigured && j.accessoryCode ? (
                            <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                              {j.accessoryCode}
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-amber-200/60">
                              Chưa gán mã ke
                            </span>
                          )}
                          {j.comboName && (
                            <span className="text-slate-400">· {j.comboName}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${typeCfg.badgeClass}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {j.formula || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {j.qty} <span className="font-normal text-slate-500 text-[11px]">{unitLabel}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {j.unitPrice > 0 ? `${j.unitPrice.toLocaleString('vi-VN')} đ` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {j.totalPrice > 0 ? `${j.totalPrice.toLocaleString('vi-VN')} đ` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Phụ kiện & Vật tư phụ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            2. Phụ kiện & Vật tư phụ ({accessories.length})
          </h4>
          {totalAccessoryPrice > 0 && (
            <span className="text-slate-600 font-semibold tabular-nums">
              Cộng phụ kiện: <strong className="text-primary">{totalAccessoryPrice.toLocaleString('vi-VN')} đ</strong>
            </span>
          )}
        </div>

        {accessories.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">
            Chưa chọn gói phụ kiện hoặc phụ kiện lẻ cho cửa này.
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70 text-[11px]">
                  <th className="py-2.5 px-3">Tên & Mã phụ kiện</th>
                  <th className="py-2.5 px-3">Thuộc gói / Nguồn</th>
                  <th className="py-2.5 px-3">Quy đổi theo cửa</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessories.map((item, idx) => {
                  const unitLabel = formatAccessoryUnit(item.unit) || 'Cái';
                  return (
                    <tr key={`res-acc-${item.accessoryId || idx}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 flex-wrap">
                          {item.code && (
                            <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                              {item.code}
                            </span>
                          )}
                          {item.brandName && (
                            <span className="text-primary font-medium">· {item.brandName}</span>
                          )}
                          {item.note && (
                            <span className="text-slate-400 italic">({item.note})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.comboName || 'Phụ kiện lẻ'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {item.scaleFormula || (item.baseQuantity && item.baseQuantity !== item.quantity ? `Định mức ${item.baseQuantity} → ${item.quantity}` : 'Giữ nguyên định mức')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {item.quantity} <span className="font-normal text-slate-500 text-[11px]">{unitLabel}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString('vi-VN')} đ` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary tabular-nums whitespace-nowrap">
                        {item.totalPrice > 0 ? `${item.totalPrice.toLocaleString('vi-VN')} đ` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tổng cộng chi phí Ke góc + Phụ kiện */}
      <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
        <span className="font-bold text-slate-800">
          Tổng cộng chi phí Phụ kiện & Con ke góc (khớp Tạm tính & Báo giá):
        </span>
        <span className="font-bold text-sm text-primary font-mono tabular-nums">
          {combinedTotalPrice.toLocaleString('vi-VN')} đ
        </span>
      </div>
    </div>
  );
};
