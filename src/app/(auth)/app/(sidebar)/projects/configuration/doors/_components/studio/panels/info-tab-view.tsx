import React, { useMemo } from 'react';
import { ColorSwatch, ALUMINUM_PALETTE, HARDWARE_PALETTE } from '../studio-types';
import { DoorSeries, Brand } from '@/types';
import { Select } from '@/components';
import { FileText, Layers, Palette, Ruler, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface InfoTabViewProps {
  name: string;
  code: string;
  type: string;
  brandId?: number;
  brandsList?: Brand[];
  seriesId?: number;
  specification: string;
  w: number;
  h: number;
  glassPrice: number;
  aluminumColor: string;
  hardwareColor: string;
  doorSeriesList: DoorSeries[];
  onChangeField: (field: string, val: any) => void;
  aluminumColors?: ColorSwatch[];
}

export const InfoTabView: React.FC<InfoTabViewProps> = ({
  name,
  code,
  type,
  brandId,
  brandsList = [],
  seriesId,
  specification,
  w,
  h,
  glassPrice,
  aluminumColor,
  hardwareColor,
  doorSeriesList,
  onChangeField,
  aluminumColors,
}) => {
  const activeColorPalette = aluminumColors && aluminumColors.length > 0 ? aluminumColors : ALUMINUM_PALETTE;
  const activeAluminum = activeColorPalette.find(
    (c) => c.colorHex.toLowerCase() === aluminumColor.toLowerCase()
  );
  const activeHardware = HARDWARE_PALETTE.find(
    (c) => c.colorHex.toLowerCase() === hardwareColor.toLowerCase()
  );

  // Lọc hệ nhôm kỹ thuật theo hãng nhôm đã chọn
  const filteredSeriesList = useMemo(() => {
    if (!brandId) return doorSeriesList;
    return doorSeriesList.filter((s) => s.brandId === brandId);
  }, [doorSeriesList, brandId]);

  const selectedSeries = doorSeriesList.find((s) => s.id === seriesId);
  const selectedBrand = brandsList.find((b) => b.id === brandId);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Banner tiêu đề định hướng */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Thông số kỹ thuật mẫu cửa</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Khai báo danh mục định danh, hệ nhôm cơ sở, kích thước phủ bì tiêu chuẩn và màu sơn bề mặt.
            </p>
          </div>
          {(Boolean(selectedBrand) || Boolean(selectedSeries)) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold shrink-0">
              <Layers size={14} />
              <span>
                {selectedBrand?.name ? `${selectedBrand.name} — ` : ''}
                {selectedSeries?.name || 'Chưa chọn hệ nhôm'}
                {selectedSeries?.code ? ` (${selectedSeries.code})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Bố cục 2 cột chính: Trái = Thông số kỹ thuật & Kích thước, Phải = Bảng màu & Tóm tắt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* CỘT TRÁI (7 CỘT): Thông tin định danh & Kích thước */}
          <div className="lg:col-span-7 space-y-4">
            {/* Box 1: Định danh */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText size={16} className="text-primary" />
                <h3 className="text-xs font-semibold text-slate-800">
                  Định danh & phân loại
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Tên mẫu cửa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => onChangeField('name', e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition bg-white"
                    placeholder="VD: Cửa đi mở quay AR66 2 cánh"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Mã mẫu cửa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => onChangeField('code', e.target.value)}
                    className="w-full h-9 px-3 text-xs font-semibold uppercase rounded-md border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition bg-white"
                    placeholder="VD: CD_AR66_2C"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <Select
                    label="Hãng nhôm *"
                    value={brandId ? String(brandId) : ''}
                    onChange={(e) => onChangeField('brandId', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Chọn hãng nhôm..."
                    options={brandsList.map((b) => ({
                      value: String(b.id),
                      label: b.name,
                    }))}
                    className="h-9 text-xs font-normal"
                    fullWidth
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <Select
                    label="Hệ nhôm *"
                    value={seriesId ? String(seriesId) : ''}
                    onChange={(e) => onChangeField('seriesId', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Chọn hệ nhôm..."
                    options={filteredSeriesList.map((s) => ({
                      value: String(s.id),
                      label: s.name,
                    }))}
                    className="h-9 text-xs font-normal"
                    fullWidth
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <Select
                    label="Loại cửa"
                    value={type}
                    onChange={(e) => onChangeField('type', e.target.value)}
                    options={[
                      { value: 'casement_door', label: 'Cửa đi mở quay' },
                      { value: 'sliding_door', label: 'Cửa đi lùa' },
                      { value: 'casement_window', label: 'Cửa sổ mở quay' },
                      { value: 'sliding_window', label: 'Cửa sổ lùa' },
                      { value: 'folding_door', label: 'Cửa gấp xếp' },
                      { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
                      { value: 'glass_wall', label: 'Vách kính' },
                      { value: 'curtain_wall', label: 'Mặt dựng' },
                      { value: 'composite', label: 'Tổng hợp' },
                    ]}
                    className="h-9 text-xs font-normal"
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Kích thước tiêu chuẩn & Đơn vị tính */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Ruler size={16} className="text-primary" />
                <h3 className="text-xs font-semibold text-slate-800">
                  Kích thước tiêu chuẩn & chi phí kính
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Chiều rộng (W)</span>
                    <span className="text-[10px] text-slate-400 font-mono">mm</span>
                  </div>
                  <input
                    type="number"
                    value={w}
                    onChange={(e) => onChangeField('w', Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Chiều cao (H)</span>
                    <span className="text-[10px] text-slate-400 font-mono">mm</span>
                  </div>
                  <input
                    type="number"
                    value={h}
                    onChange={(e) => onChangeField('h', Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Đơn giá kính</span>
                    <span className="text-[10px] text-slate-400 font-mono">đ/m²</span>
                  </div>
                  <input
                    type="number"
                    value={glassPrice}
                    onChange={(e) => onChangeField('glassPrice', Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Ghi chú kỹ thuật */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-slate-700">Quy cách kỹ thuật / Ghi chú</label>
                <textarea
                  rows={3}
                  value={specification}
                  onChange={(e) => onChangeField('specification', e.target.value)}
                  className="w-full p-3 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition bg-white"
                  placeholder="Nhập ghi chú kỹ thuật, độ dày nhôm khuyến nghị, thông số khe hở..."
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 CỘT): Màu sắc & Thẻ tóm tắt thông số */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box 3: Bảng màu tiêu chuẩn */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Palette size={16} className="text-primary" />
                <h3 className="text-xs font-semibold text-slate-800">
                  Màu sắc hoàn thiện bề mặt
                </h3>
              </div>

              {/* Màu nhôm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Màu nhôm</label>
                  {activeAluminum && (
                    <span className="text-xs text-primary font-semibold">
                      {activeAluminum.name}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {activeColorPalette.map((col) => {
                    const isSelected = aluminumColor.toLowerCase() === col.colorHex.toLowerCase();
                    return (
                      <button
                        key={col.code}
                        type="button"
                        onClick={() => onChangeField('aluminumColor', col.colorHex)}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-md border transition cursor-pointer ${isSelected
                          ? 'border-primary bg-primary/5 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        title={col.name}
                      >
                        <span
                          className={`w-6 h-6 rounded-full border shadow-2xs ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-slate-300'
                            }`}
                          style={{ backgroundColor: col.colorHex }}
                        />
                        <span className="text-[10px] text-center text-slate-600 truncate w-full group-hover:text-slate-900 leading-tight">
                          {col.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Màu phụ kiện */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Màu phụ kiện</label>
                  {activeHardware && (
                    <span className="text-xs text-primary font-semibold">
                      {activeHardware.name}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {HARDWARE_PALETTE.map((col) => {
                    const isSelected = hardwareColor.toLowerCase() === col.colorHex.toLowerCase();
                    return (
                      <button
                        key={col.code}
                        type="button"
                        onClick={() => onChangeField('hardwareColor', col.colorHex)}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-md border transition cursor-pointer ${isSelected
                          ? 'border-primary bg-primary/5 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        title={col.name}
                      >
                        <span
                          className={`w-6 h-6 rounded-full border shadow-2xs ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-slate-300'
                            }`}
                          style={{ backgroundColor: col.colorHex }}
                        />
                        <span className="text-[10px] text-center text-slate-600 truncate w-full group-hover:text-slate-900 leading-tight">
                          {col.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Box 4: Thẻ tóm tắt thông số cấu hình cửa */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h3 className="text-xs font-semibold text-slate-800">
                  Tổng quan thông số
                </h3>
              </div>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Diện tích phủ bì:</span>
                  <span className="font-bold text-slate-800">
                    {((w * h) / 1000000).toFixed(2)} m²
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Kích thước chuẩn:</span>
                  <span className="font-semibold text-slate-800">
                    {w} × {h} mm
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Đơn giá kính mẫu:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(glassPrice)}/m²
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Phối màu nhôm:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: aluminumColor }}
                    />
                    <span className="font-medium text-slate-700">{activeAluminum?.name || aluminumColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

