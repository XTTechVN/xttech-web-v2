'use client';

import React from 'react';
import Image from 'next/image';
import { Layers, Scissors, Wrench, ShieldAlert } from 'lucide-react';
import type { ProductionSheet } from '@/types';
import {
  DoorCadRenderer,
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  type SceneCellNode,
  type FrameShape,
  type FrameConfig,
  type SashConfig,
} from '@/components';
import { QUOTATION_TEMPLATE } from '@/config/quotation-template';
import { getFileUrl } from '@/utils';

interface ProductionSheetCardProps {
  sheet: ProductionSheet;
  index: number;
  printDate?: string;
  className?: string;
}

export function ProductionSheetCard({
  sheet,
  index,
  printDate = new Date().toLocaleDateString('vi-VN'),
  className = '',
}: ProductionSheetCardProps) {
  const sc = (sheet.systemConfig || {}) as Record<string, any>;
  const w: number = Number(sheet.width) || sc.w || 900;
  const h: number = Number(sheet.height) || sc.h || 1200;
  const aluminumColor: string = sc.aluminumColor || sc.surface_color || '#4A5568';
  const hardwareColor: string = sc.hardwareColor || sc.accessory_color || '#1A202C';
  const frameShape: FrameShape = (sc.frameShape as FrameShape) || 'rect';

  const frameConfig: FrameConfig = sc.frameConfig
    ? {
        ...DEFAULT_FRAME_CONFIG,
        ...sc.frameConfig,
        leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(sc.frameConfig.leftEdge || {}) },
        topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(sc.frameConfig.topEdge || {}) },
        rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(sc.frameConfig.rightEdge || {}) },
        bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(sc.frameConfig.bottomEdge || {}) },
      }
    : DEFAULT_FRAME_CONFIG;

  const sashConfig: SashConfig = sc.sashConfig
    ? { ...DEFAULT_SASH_CONFIG, ...sc.sashConfig }
    : DEFAULT_SASH_CONFIG;

  const rootCell: SceneCellNode | null = sc.rootCell ?? null;

  // Gộp danh sách phụ kiện cơ khí và ke góc / ke tăng cứng vào bảng Vật tư phụ
  const combinedMap = new Map<string, { code: string; name: string; quantity: number; unit: string }>();
  const addAcc = (code: string, name: string, qty: number, unit: string) => {
    const key = `${code}_${name}`;
    const existing = combinedMap.get(key);
    if (!existing) {
      combinedMap.set(key, { code, name, quantity: qty, unit });
    } else {
      existing.quantity += qty;
    }
  };
  sheet.accessories.forEach((acc) => addAcc(acc.accessoryCode || '—', acc.accessoryName, acc.quantity, acc.unit));
  sheet.reinforcements.forEach((rf) =>
    addAcc(
      rf.accessoryCode || '—',
      rf.accessoryName || rf.name || 'Ke góc',
      rf.quantity ?? rf.qty ?? 4,
      rf.unit || 'pcs',
    ),
  );
  const combinedAccessories = Array.from(combinedMap.values());

  const doorIndexText = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`production-sheet-page relative mx-auto w-full max-w-[960px] min-h-[1050px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${className}`}
    >
      {/* 1. Header công ty */}
      <div className="flex items-center gap-4 border-b border-slate-300 pb-3">
        <div className="relative h-14 w-28 shrink-0">
          <Image
            src={QUOTATION_TEMPLATE.logoUrl}
            alt="Xuân Tiệp Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1 border-l border-slate-300 pl-4 text-[11px] leading-tight text-slate-700">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
            XUÂN TIỆP WINDOW
          </h2>
          <p className="mt-0.5">
            Trụ sở: TDP Quý Kim 2, (tại nhà ông Bùi Đức Tiệp), phường Nam Đồ Sơn, Hải Phòng.
          </p>
          <p>Nhà máy sx: Số 507 TDP Nghĩa Sơn, phường Nam Đồ Sơn, Hải Phòng.</p>
          <p className="font-medium text-slate-800">
            ĐT: 0569669669 | Email: xuantiepwindow@gmail.com | MST: 0201263785
          </p>
        </div>
      </div>

      {/* 2. Thanh tiêu đề cửa (Khung bo vàng kem như mẫu xưởng) */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <span className="text-amber-700">{doorIndexText} -</span>
          <span>{sheet.positionCode}</span>
          <span className="text-slate-400">|</span>
          <span>S={(sheet.areaM2 || 0).toFixed(1)} m²</span>
          <span className="text-slate-400">|</span>
          <span>{(sheet.totalWeightKg || 0).toFixed(1)} kg</span>
          {sheet.isEstimated && (
            <span className="flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-900">
              <ShieldAlert size={11} /> Ước tính
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-amber-800">
          Số lượng: <span className="text-sm text-amber-900">01</span>
        </div>
      </div>

      {/* 3. Bố cục 2 cột (Cột Trái: CAD + Tóm tắt + Kính + Roan + Phụ kiện | Cột Phải: Profile) */}
      <div className="mt-4 grid grid-cols-12 gap-5">
        {/* CỘT TRÁI (5 / 12) */}
        <div className="col-span-12 space-y-4 md:col-span-5 print:col-span-5">
          {/* Bản vẽ CAD / SVG */}
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white p-2">
            {rootCell ? (
              <div className="h-[290px] w-full">
                <DoorCadRenderer
                  hideDimensions={false}
                  w={w}
                  h={h}
                  aluminumColor={aluminumColor}
                  hardwareColor={hardwareColor}
                  frameShape={frameShape}
                  rootCell={rootCell}
                  frameConfig={frameConfig}
                  sashConfig={sashConfig}
                  selectedCellId={null}
                  onSelectCell={() => {}}
                />
              </div>
            ) : sheet.imagePath ? (
              <div className="relative h-[280px] w-full">
                <Image
                  src={getFileUrl(sheet.imagePath)}
                  alt={sheet.positionCode}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có bản vẽ CAD hoặc ảnh mẫu
              </div>
            )}
          </div>

          {/* Bảng tóm tắt thông số cơ bản */}
          <div className="grid grid-cols-4 rounded-md border border-slate-200 bg-slate-50 p-2 text-center text-[11px]">
            <div>
              <span className="block text-[10px] text-slate-400">Hãng nhôm:</span>
              <span className="font-bold text-slate-700">{sheet.brandName || 'FV'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Màu nhôm:</span>
              <span className="font-bold text-slate-700">{sheet.colorName || 'Xám'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Ký hiệu:</span>
              <span className="font-bold text-slate-700">{sheet.positionCode}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Số lượng:</span>
              <span className="font-bold text-slate-700">1</span>
            </div>
          </div>

          {/* Bảng KÍNH */}
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

          {/* Bảng ROAN */}
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

          {/* Bảng PHỤ KIỆN - VẬT TƯ PHỤ */}
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
                      <td className="px-2 py-1 font-mono text-[10px] text-slate-600">
                        {acc.code}
                      </td>
                      <td className="px-2 py-1">{acc.name}</td>
                      <td className="px-2 py-1 text-right font-mono font-bold">
                        {acc.quantity}
                      </td>
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
        </div>

        {/* CỘT PHẢI (7 / 12): BẢNG PROFILE CẮT NHÔM */}
        <div className="col-span-12 md:col-span-7 print:col-span-7">
          <div className="overflow-hidden rounded-md border border-slate-200">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">
              <Scissors size={13} className="text-primary" /> PROFILE CẮT NHÔM & NẸP
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
        </div>
      </div>

      {/* 4. Footer tờ A4 */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        <span className="italic font-medium text-slate-600">Cửa vững nhà an!</span>
        <span>Ngày xuất: {printDate}</span>
      </div>
    </div>
  );
}
