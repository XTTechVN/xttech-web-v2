'use client';

import React, { useState, useMemo } from 'react';
import type { ProjectDetail, ProjectUpdate } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBrands, getDoorSeriesList, getBrandColors, updateProject } from '@/actions';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { CompactSelect, type CompactSelectOption } from './compact-select';
import { Loader2, Pencil, Check, X } from 'lucide-react';

interface TabOverviewProps {
  projectId: number;
  project?: ProjectDetail;
}

export function TabOverview({ projectId, project }: TabOverviewProps) {
  const queryClient = useQueryClient();
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  // Quản lý chỉnh sửa inline Ghi chú
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  if (!project) return null;

  const brand = project.defaultBrand;
  const series = project.defaultSeries;
  const color = project.defaultColor;
  const customer = project.customer;
  const user = project.user;

  const currentBrandId = project.defaultBrandId || brand?.id;

  // Lấy danh sách thương hiệu nhôm (type = aluminum)
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => {
      const res = await getBrands({ limit: 100, brandType: 'aluminum' } as any);
      const items = Array.isArray(res?.items) ? res.items : [];
      return items.filter((b) => !b.brandType || b.brandType === 'aluminum');
    },
  });

  // Lấy danh sách hệ nhôm theo brand đang chọn
  const { data: seriesData, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['project-overview-door-series', currentBrandId],
    queryFn: async () => {
      if (!currentBrandId) return [];
      const res = await getDoorSeriesList({
        limit: 100,
        brandId: Number(currentBrandId),
      });
      return Array.isArray(res) ? res : (res?.items || []);
    },
    enabled: !!currentBrandId,
  });

  // Lấy danh sách màu sắc theo brand đang chọn
  const { data: colorsData, isLoading: isLoadingColors } = useQuery({
    queryKey: ['project-overview-brand-colors', currentBrandId],
    queryFn: async () => {
      if (!currentBrandId) return [];
      const res = await getBrandColors({
        limit: 100,
        brandId: Number(currentBrandId),
      });
      return Array.isArray(res) ? res : (res?.items || []);
    },
    enabled: !!currentBrandId,
  });

  // Xử lý cập nhật thông tin dự án
  const handleUpdate = async (field: string, payload: Partial<ProjectUpdate>) => {
    try {
      setUpdatingField(field);
      await updateProject(projectId, payload as ProjectUpdate);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã cập nhật thông tin');
    } catch (error) {
      showErrorToast(error, 'Không thể cập nhật');
    } finally {
      setUpdatingField(null);
    }
  };

  const handleSaveNote = () => {
    setIsEditingNote(false);
    const trimmed = noteInput.trim();
    if (trimmed !== (project.note || '')) {
      handleUpdate('note', { note: trimmed });
    }
  };

  // Convert options cho CompactSelect (Sắp xếp A-Z theo Tiếng Việt)
  const brandOptions: CompactSelectOption[] = useMemo(() => {
    const list = Array.isArray(brandsData) ? brandsData : ((brandsData as any)?.items || []);
    return list
      .map((b: any) => ({
        value: b.id,
        label: `${b.name}${b.originCountry ? ` (${b.originCountry})` : ''}`,
        sublabel: b.barLengthMm ? `${(b.barLengthMm / 1000).toFixed(2)}m` : undefined,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);

  const seriesOptions: CompactSelectOption[] = useMemo(() => {
    const list = Array.isArray(seriesData) ? seriesData : ((seriesData as any)?.items || []);
    return list
      .map((s: any) => ({
        value: s.id,
        label: `${s.name}${s.aluminumThickness ? ` - Dày ${s.aluminumThickness} mm` : ''}`,
        sublabel: s.aluminumThickness ? `${s.aluminumThickness} mm` : undefined,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }));
  }, [seriesData]);

  const colorOptions: CompactSelectOption[] = useMemo(() => {
    const list = Array.isArray(colorsData) ? colorsData : ((colorsData as any)?.items || []);
    return list
      .map((c: any) => ({
        value: c.id,
        label: `${c.name}${c.surfaceType ? ` (${c.surfaceType})` : ''}`,
        colorHex: c.colorHex,
        sublabel: c.pricePerKg ? `${c.pricePerKg.toLocaleString('vi-VN')} đ/kg` : undefined,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }));
  }, [colorsData]);

  const brandText = brand?.name
    ? `${brand.name}${brand.originCountry ? ` (${brand.originCountry})` : ''}`
    : 'Chưa thiết lập';

  const seriesText = series?.name
    ? `${series.name}${series.aluminumThickness ? ` - Dày ${series.aluminumThickness} mm` : ''}`
    : 'Chưa chọn hệ';

  const colorText = color?.name
    ? `${color.name}${color.surfaceType ? ` (${color.surfaceType})` : ''}`
    : 'Tiêu chuẩn';

  const colorHex = color?.colorHex || '#B79B69';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
      {/* Cột trái (Khung thông tin dự án) */}
      <div className="lg:col-span-4 xl:col-span-3.5 flex flex-col gap-5">
        {/* Block 1: Tiêu chuẩn vật tư & Cấu hình */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-slate-700 font-lexend block">
            Tiêu chuẩn vật tư
          </h3>

          <div className="bg-white rounded-md border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5 text-xs">
            {/* Hãng nhôm mặc định */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hãng nhôm mặc định</span>
              <CompactSelect
                value={project.defaultBrandId || brand?.id}
                displayLabel={brandText}
                options={brandOptions}
                isLoading={updatingField === 'brand' || isLoadingBrands}
                placeholder="Chọn hãng nhôm"
                onChange={(val) => {
                  handleUpdate('brand', {
                    defaultBrandId: Number(val),
                    defaultSeriesId: null as any,
                    defaultColorId: null as any,
                  });
                }}
              />
            </div>

            {/* Chiều dài thanh */}
            {brand?.barLengthMm && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Quy cách thanh</span>
                <span className="text-slate-700 font-medium">{(brand.barLengthMm / 1000).toFixed(2)} m/thanh</span>
              </div>
            )}

            {/* Hệ nhôm mặc định */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Hệ nhôm mặc định</span>
              <CompactSelect
                value={project.defaultSeriesId || series?.id}
                displayLabel={<span className="truncate max-w-[170px]" title={seriesText}>{seriesText}</span>}
                options={seriesOptions}
                isLoading={updatingField === 'series' || isLoadingSeries}
                placeholder={currentBrandId ? 'Chọn hệ nhôm' : 'Cần chọn hãng trước'}
                disabled={!currentBrandId}
                emptyText={currentBrandId ? 'Hãng này chưa có hệ nhôm' : 'Vui lòng chọn hãng nhôm'}
                onChange={(val) => {
                  handleUpdate('series', {
                    defaultSeriesId: Number(val),
                  });
                }}
              />
            </div>

            {/* Màu sơn mặc định */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Màu sơn mặc định</span>
              <CompactSelect
                value={project.defaultColorId || color?.id}
                displayLabel={
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="truncate max-w-[150px]">{colorText}</span>
                  </div>
                }
                options={colorOptions}
                isLoading={updatingField === 'color' || isLoadingColors}
                placeholder={currentBrandId ? 'Chọn màu sơn' : 'Cần chọn hãng trước'}
                disabled={!currentBrandId}
                emptyText={currentBrandId ? 'Hãng này chưa có màu sơn' : 'Vui lòng chọn hãng nhôm'}
                onChange={(val) => {
                  handleUpdate('color', {
                    defaultColorId: Number(val),
                  });
                }}
              />
            </div>

            {/* Đơn giá phôi/sơn */}
            {color?.pricePerKg && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Đơn giá nhôm màu</span>
                <span className="font-medium text-slate-700">
                  {color.pricePerKg.toLocaleString('vi-VN')} đ/kg
                </span>
              </div>
            )}

            {/* Số lượng cửa */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Số lượng cửa</span>
              <span className="font-semibold text-slate-800">
                {project.totalPositions ?? 0} bộ
                {project.floors?.length ? ` (${project.floors.length} tầng)` : ''}
              </span>
            </div>

            {/* Khối lượng nhôm */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Khối lượng nhôm</span>
              <span className="font-semibold text-slate-800">
                {(project.totalAluminumKg ?? 0).toLocaleString('vi-VN')} kg
              </span>
            </div>

            {/* Diện tích kính */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Diện tích kính</span>
              <span className="font-semibold text-slate-800">
                {(project.totalAreaM2 ?? 0).toFixed(1)} m²
              </span>
            </div>
          </div>
        </div>

        {/* Block 2: Tiến độ & Hồ sơ thi công */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-slate-700 font-lexend block">
            Tiến độ & Phụ trách
          </h3>

          <div className="bg-white rounded-md border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5 text-xs">
            {/* Mã dự án */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã công trình</span>
              <span className="font-mono font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70 text-[11px]">
                {project.code || `DA-${project.id}`}
              </span>
            </div>

            {/* Thời gian thi công */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Thời gian thi công</span>
              <span className="font-semibold text-slate-800">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'}
                {' → '}
                {project.targetDate ? new Date(project.targetDate).toLocaleDateString('vi-VN') : '31/10/2026'}
              </span>
            </div>

            {/* Địa chỉ công trình */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500">Địa chỉ công trình</span>
              <span className="text-slate-800 font-semibold truncate max-w-[180px]" title={project.address || ''}>
                {project.address || 'Chưa cập nhật'}
              </span>
            </div>

            {/* Kỹ thuật phụ trách */}
            {user && (
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <span className="text-slate-500">Khởi tạo dự án</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 block">{user.fullName}</span>
                  {user.phoneNumber && (
                    <a href={`tel:${user.phoneNumber}`} className="text-[11px] text-slate-500 hover:text-primary block">
                      {user.phoneNumber}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Kinh doanh phụ trách */}
            {(customer as any)?.staff && (
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <span className="text-slate-500">Kinh doanh</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 block">{(customer as any).staff.fullName}</span>
                  {(customer as any).staff.phoneNumber && (
                    <a href={`tel:${(customer as any).staff.phoneNumber}`} className="text-[11px] text-slate-500 hover:text-primary block">
                      {(customer as any).staff.phoneNumber}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Nhà cung cấp liên kết */}
            {(customer as any)?.provider?.name && (
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <span className="text-slate-500">Đơn vị cung ứng</span>
                <span className="font-medium text-slate-700">{(customer as any).provider.name}</span>
              </div>
            )}

            {/* Ghi chú lưu ý (cho phép sửa inline) */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500 shrink-0">Ghi chú</span>
              {isEditingNote ? (
                <div className="flex items-center gap-1 max-w-[210px]">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNote();
                      if (e.key === 'Escape') setIsEditingNote(false);
                    }}
                    autoFocus
                    placeholder="Nhập ghi chú..."
                    className="w-full text-xs font-semibold text-primary px-1.5 py-0.5 border border-primary/40 rounded focus:outline-none focus:ring-1 focus:ring-primary/30 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={updatingField === 'note'}
                    className="p-1 text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer"
                    title="Lưu"
                  >
                    {updatingField === 'note' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                    title="Hủy"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNoteInput(project.note || '');
                    setIsEditingNote(true);
                  }}
                  className="group flex items-center gap-1.5 text-right hover:bg-slate-100/80 px-1.5 py-0.5 -mr-1.5 rounded transition-colors max-w-[200px] cursor-pointer"
                  title="Bấm để sửa ghi chú"
                >
                  <span className="font-semibold text-primary truncate text-xs" title={project.note || 'Thêm ghi chú'}>
                    {project.note || <span className="text-slate-400 italic font-normal">Thêm ghi chú...</span>}
                  </span>
                  <Pencil size={10} className="text-slate-400 group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Trống */}
      <div className="lg:col-span-8 xl:col-span-8.5" />
    </div>
  );
}
