'use client';

import React from 'react';
import { Scissors, Wrench } from 'lucide-react';
import type { ProductionSheet } from '@/types';
import type { CombinedSheetAccessory } from '../types';

export function ProductionSheetLeftTables({
  sheet,
  combinedAccessories,
}: {
  sheet: ProductionSheet;
  combinedAccessories: CombinedSheetAccessory[];
}) {
  return (
    <>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="flex items-center gap-1.5 bg-sky-50/80 px-2.5 py-1 text-[11px] font-bold text-sky-900">
          <span>🪟</span> KÍNH
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-500">
            <tr>
              <th className="px-2 py-1">Loại</th>
              <th className="px-2 py-1">Kích thước</th>
              <th className="px-1 py-1 text-center">SL</th>
              <th className="px-2 py-1 text-right">Diện tích</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sheet.glasses.length > 0 ? (
              sheet.glasses.map((glass, gIdx) => (
                <tr key={gIdx} className="hover:bg-slate-50/50">
                  <td className="px-2 py-1">{glass.glassName}</td>
                  <td className="px-2 py-1 font-mono">
                    {Math.round(glass.widthMm)} × {Math.round(glass.heightMm)}
                  </td>
                  <td className="px-1 py-1 text-center font-bold">{glass.quantity}</td>
                  <td className="px-2 py-1 text-right font-mono">{glass.areaM2.toFixed(2)}m²</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-2 py-2 text-center text-slate-400">
                  Không có kính
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="flex items-center gap-1.5 bg-purple-50/80 px-2.5 py-1 text-[11px] font-bold text-purple-900">
          <span>➰</span> ROAN
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-500">
            <tr>
              <th className="px-2 py-1">Mã</th>
              <th className="px-2 py-1">Tên</th>
              <th className="px-2 py-1 text-right">SL (m)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sheet.gaskets.length > 0 ? (
              sheet.gaskets.map((gasket, kIdx) => (
                <tr key={kIdx} className="hover:bg-slate-50/50">
                  <td className="px-2 py-1 font-mono text-[10px] text-slate-600">
                    {gasket.code || '—'}
                  </td>
                  <td className="px-2 py-1">{gasket.name || 'Roan'}</td>
                  <td className="px-2 py-1 text-right font-mono font-bold">
                    {(gasket.lengthM || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-center text-slate-400">
                  Không có roan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 text-[11px] font-bold text-amber-900">
          <Wrench size={12} /> PHỤ KIỆN - VẬT TƯ PHỤ
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] text-slate-500">
            <tr>
              <th className="px-2 py-1">Mã</th>
              <th className="px-2 py-1">Tên</th>
              <th className="px-2 py-1 text-right">SL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {combinedAccessories.length > 0 ? (
              combinedAccessories.map((acc, aIdx) => (
                <tr key={aIdx} className="hover:bg-slate-50/50">
                  <td className="px-2 py-1 font-mono text-[10px] text-slate-600">{acc.code}</td>
                  <td className="px-2 py-1">{acc.name}</td>
                  <td className="px-2 py-1 text-right font-mono font-bold">{acc.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-center text-slate-400">
                  Không có phụ kiện
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ProductionSheetProfilesTable({ sheet }: { sheet: ProductionSheet }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">
        <Scissors size={13} className="text-primary" /> PROFILE CẮT NHÔM &amp; NẸP
      </div>
      <table className="w-full border-collapse text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500">
          <tr>
            <th className="px-2.5 py-1.5">Mã profile</th>
            <th className="px-2.5 py-1.5">Tên profile</th>
            <th className="px-2 py-1.5 text-right">Dài (mm)</th>
            <th className="px-2 py-1.5 text-center">Góc cắt</th>
            <th className="px-2 py-1.5 text-center">SL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
          {sheet.profiles.length > 0 ? (
            sheet.profiles.map((profile, pIdx) => (
              <tr key={pIdx} className="hover:bg-slate-50/60">
                <td className="px-2.5 py-2 font-mono font-bold text-primary">
                  {profile.profileCode}
                </td>
                <td className="px-2.5 py-2">
                  <div className="font-medium text-slate-800">{profile.profileName}</div>
                  {profile.stockSource && (
                    <span className="text-[10px] text-slate-400">({profile.stockSource})</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right font-mono font-bold text-slate-900">
                  {profile.cutLengthMm.toFixed(1)}
                </td>
                <td className="px-2 py-2 text-center font-mono text-[10px] text-slate-600">
                  {profile.cutAngle}
                </td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-800">
                  {profile.quantity}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                Chưa có danh sách cắt profile
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

