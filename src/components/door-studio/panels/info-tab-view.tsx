import React, { useMemo } from 'react';
import { FileText, Ruler } from 'lucide-react';
import { Select } from '@/components';
import type { Brand, DoorSeries } from '@/types';
import type { ColorSwatch } from '../studio-types';
import { InfoColorSummary } from './info-color-summary';

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
  onChangeField: (field: string, val: string | number | undefined) => void;
  aluminumColors?: ColorSwatch[];
  sketchMode?: boolean;
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
  sketchMode = false,
}) => {
  const filteredSeriesList = useMemo(() => {
    if (!brandId) return doorSeriesList;
    return doorSeriesList.filter((s) => s.brandId === brandId);
  }, [doorSeriesList, brandId]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FileText size={16} className="text-primary" />
                <h3 className="text-xs font-semibold text-slate-800">Định danh &amp; phân loại</h3>
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

                {!sketchMode && (
                  <>
                    <div className="sm:col-span-4 space-y-1">
                      <Select
                        label="Hãng nhôm *"
                        value={brandId ? String(brandId) : ''}
                        onChange={(e) => onChangeField('brandId', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Chọn hãng nhôm..."
                        options={brandsList.map((b) => ({ value: String(b.id), label: b.name }))}
                        className="h-9 text-xs font-normal bg-slate-50 cursor-not-allowed text-slate-600"
                        disabled
                        fullWidth
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <Select
                        label="Hệ nhôm *"
                        value={seriesId ? String(seriesId) : ''}
                        onChange={(e) => onChangeField('seriesId', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Chọn hệ nhôm..."
                        options={filteredSeriesList.map((s) => ({ value: String(s.id), label: s.name }))}
                        className="h-9 text-xs font-normal"
                        fullWidth
                      />
                    </div>
                  </>
                )}

                <div className={sketchMode ? 'sm:col-span-12 space-y-1' : 'sm:col-span-4 space-y-1'}>
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

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Ruler size={16} className="text-primary" />
                <h3 className="text-xs font-semibold text-slate-800">
                  {sketchMode ? 'Kích thước phủ bì phác thảo' : 'Kích thước tiêu chuẩn & chi phí kính'}
                </h3>
              </div>

              <div className={`grid grid-cols-1 ${sketchMode ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Chiều rộng (W)</span>
                    <span className="text-[10px] text-slate-400 font-mono">mm</span>
                  </div>
                  <input
                    type="number"
                    value={w}
                    onChange={(e) => onChangeField('w', Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm font-mono font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary tabular-nums"
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
                    className="w-full h-9 px-3 text-sm font-mono font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary tabular-nums"
                  />
                </div>

                {!sketchMode && (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>Đơn giá kính</span>
                      <span className="text-[10px] text-slate-400 font-mono">đ/m²</span>
                    </div>
                    <input
                      type="number"
                      value={glassPrice}
                      onChange={(e) => onChangeField('glassPrice', Number(e.target.value))}
                      className="w-full h-9 px-3 text-sm font-mono font-bold text-slate-900 text-center rounded border border-slate-200 bg-white focus:outline-none focus:border-primary tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-slate-700">Quy cách kỹ thuật / Ghi chú</label>
                <textarea
                  rows={3}
                  value={specification}
                  onChange={(e) => onChangeField('specification', e.target.value)}
                  className="w-full p-3 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition bg-white"
                  placeholder="Nhập ghi chú kỹ thuật, quy cách chia ô hoặc yêu cầu từ nhà cung cấp..."
                />
              </div>
            </div>
          </div>

          <InfoColorSummary
            w={w}
            h={h}
            glassPrice={glassPrice}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            aluminumColors={aluminumColors}
            sketchMode={sketchMode}
            onChangeField={(field, val) => onChangeField(field, val)}
          />
        </div>
      </div>
    </div>
  );
};
