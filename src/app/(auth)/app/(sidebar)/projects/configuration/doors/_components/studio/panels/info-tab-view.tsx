'use client';

import React from 'react';
import { ALUMINUM_PALETTE, HARDWARE_PALETTE } from '../studio-types';
import { DoorSeries } from '@/types';

interface InfoTabViewProps {
  name: string;
  code: string;
  type: string;
  seriesId?: number;
  specification: string;
  w: number;
  h: number;
  glassPrice: number;
  aluminumColor: string;
  hardwareColor: string;
  doorSeriesList: DoorSeries[];
  onChangeField: (field: string, val: any) => void;
}

export const InfoTabView: React.FC<InfoTabViewProps> = ({
  name,
  code,
  type,
  seriesId,
  specification,
  w,
  h,
  glassPrice,
  aluminumColor,
  hardwareColor,
  doorSeriesList,
  onChangeField,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 text-xs text-gray-800">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">Thông tin Mẫu cửa</h3>
          <p className="text-xs text-gray-500">Khai báo thông số kỹ thuật, hệ nhôm và kích thước tiêu chuẩn</p>
        </div>

        {/* Tên & Mã */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Tên mẫu cửa *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeField('name', e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="VD: Cửa sổ 2 cánh mở quay Class A65"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Mã mẫu cửa *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => onChangeField('code', e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono font-bold rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="VD: CS_CLA65"
            />
          </div>
        </div>

        {/* Loại cửa & Hệ nhôm */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Loại cửa</label>
            <select
              value={type}
              onChange={(e) => onChangeField('type', e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="cs">Cửa sổ</option>
              <option value="cd">Cửa đi</option>
              <option value="vach">Vách kính</option>
              <option value="khac">Khác</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Hệ nhôm kỹ thuật (Door Series)</label>
            <select
              value={seriesId || ''}
              onChange={(e) => onChangeField('seriesId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-9 px-3 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn hệ nhôm --</option>
              {doorSeriesList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kích thước tiêu chuẩn & Đơn giá kính */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-gray-200">
          <div className="space-y-1">
            <label className="font-semibold text-gray-600">Chiều rộng W (mm)</label>
            <input
              type="number"
              value={w}
              onChange={(e) => onChangeField('w', Number(e.target.value))}
              className="w-full h-8 px-2.5 font-bold font-mono text-center rounded-lg border border-gray-300 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-600">Chiều cao H (mm)</label>
            <input
              type="number"
              value={h}
              onChange={(e) => onChangeField('h', Number(e.target.value))}
              className="w-full h-8 px-2.5 font-bold font-mono text-center rounded-lg border border-gray-300 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-600">Đơn giá kính (đ/m²)</label>
            <input
              type="number"
              value={glassPrice}
              onChange={(e) => onChangeField('glassPrice', Number(e.target.value))}
              className="w-full h-8 px-2.5 font-bold font-mono text-center rounded-lg border border-gray-300 bg-white"
            />
          </div>
        </div>

        {/* Màu nhôm & Phụ kiện */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-semibold text-gray-700">Màu nhôm tiêu chuẩn</label>
            <div className="flex items-center gap-2 flex-wrap">
              {ALUMINUM_PALETTE.map((col) => (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onChangeField('aluminumColor', col.colorHex)}
                  className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                    aluminumColor === col.colorHex
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-xs border-transparent'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-semibold text-gray-700">Màu phụ kiện tiêu chuẩn</label>
            <div className="flex items-center gap-2 flex-wrap">
              {HARDWARE_PALETTE.map((col) => (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onChangeField('hardwareColor', col.colorHex)}
                  className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                    hardwareColor === col.colorHex
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-xs border-transparent'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mô tả / Quy cách */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Quy cách kỹ thuật / Ghi chú</label>
          <textarea
            rows={3}
            value={specification}
            onChange={(e) => onChangeField('specification', e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Nhập thông số độ dày nhôm, hãng phụ kiện khuyến nghị, khe hở kỹ thuật..."
          />
        </div>
      </div>
    </div>
  );
};
