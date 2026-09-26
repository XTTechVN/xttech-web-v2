'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Palette, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast, formatCurrency } from '@/utils';
import { getBrandColors, deleteBrandColor } from '@/actions';
import type { Brand, BrandColor } from '@/types';
import { BrandColorModal } from './brand-color-modal';

interface BrandColorsTabProps {
  brand: Brand;
}

const SURFACE_MAP: Record<string, string> = {
  powder_coat: 'Sơn tĩnh điện',
  anodize: 'Anodize / Xi mạ',
  wood_grain: 'Sơn vân gỗ',
  pvdf: 'Sơn PVDF',
  other: 'Khác',
};

export function BrandColorsTab({ brand }: BrandColorsTabProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);
  const [priceSortOrder, setPriceSortOrder] = useState<'asc' | 'desc'>('asc');

  const isAccessory = brand.brandType === 'accessory';

  // Lấy danh sách hệ màu của hãng (chỉ fetch nếu không phải hãng phụ kiện)
  const { data: response, isLoading } = useQuery({
    queryKey: ['brand-colors', brand.id],
    queryFn: async () => {
      return await getBrandColors({
        brandId: brand.id,
        limit: 1000,
        offset: 0,
      });
    },
    enabled: !isAccessory,
  });

  const colors = response?.items || [];

  // Lọc và sắp xếp màu theo giá
  const filteredColors = useMemo(() => {
    let result = [...colors];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          (c.surfaceType && c.surfaceType.toLowerCase().includes(query)),
      );
    }

    result.sort((a, b) => {
      const priceA = Number(a.pricePerKg) || 0;
      const priceB = Number(b.pricePerKg) || 0;
      return priceSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    return result;
  }, [colors, search, priceSortOrder]);

  // Mutation xóa màu
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: number) => deleteBrandColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors', brand.id] });
      toast.success('Xóa màu thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa màu'),
  });

  const handleOpenCreateModal = () => {
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (color: BrandColor) => {
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  const handleDeleteColor = (color: BrandColor) => {
    if (confirm(`Xác nhận xóa màu "${color.name}" (${color.code})?`)) {
      deleteMutate(color.id);
    }
  };

  if (isAccessory) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-50/70 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5 shadow-2xs">
          <Palette size={28} className="text-slate-400" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1.5">
          Hãng phụ kiện chưa hỗ trợ hệ màu
        </h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Danh sách hệ màu và bảng giá sơn theo kg chỉ áp dụng cấu hình cho các thương hiệu thanh profile nhôm.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar: Tìm kiếm và nút Thêm mới */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm mã màu, tên màu hoặc loại sơn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus size={16} />}
          className="font-semibold text-xs sm:text-sm h-9 px-4 shrink-0"
        >
          Thêm màu mới
        </Button>
      </div>

      {/* Table Danh sách màu */}
      <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-16 text-center">Mẫu</th>
                <th className="py-3 px-4 w-36">Mã màu</th>
                <th className="py-3 px-4 min-w-[180px]">Tên màu sắc</th>
                <th className="py-3 px-4 w-40">Bề mặt xử lý</th>
                <th className="py-3 px-4 text-right w-36 select-none outline-none">
                  <button
                    type="button"
                    onClick={() => setPriceSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="w-full flex items-center justify-end gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors cursor-pointer outline-none focus:outline-none select-none"
                    title={`Đang sắp xếp theo giá: ${priceSortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'} (Nhấn để đảo chiều)`}
                  >
                    <span>Đơn giá / kg</span>
                    {priceSortOrder === 'asc' ? (
                      <ArrowUp size={13} className="text-primary font-bold" />
                    ) : (
                      <ArrowDown size={13} className="text-primary font-bold" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-center w-28">Hệ số giá</th>
                <th className="py-3 px-4 text-center w-28">Mặc định</th>
                <th className="py-3 px-4 text-center w-28">Trạng thái</th>
                <th className="py-3 px-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-100 last:border-b-0">
                    <td className="py-4 px-4 text-center"><div className="w-7 h-7 bg-slate-100 rounded-full mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-5 bg-slate-100 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredColors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Palette size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {search ? 'Không tìm thấy màu phù hợp' : 'Hãng này chưa có hệ màu nào'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Nhấn nút &quot;Thêm màu mới&quot; ở trên để bắt đầu thêm các tùy chọn màu sắc.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredColors.map((color) => {
                  const surfaceLabel = SURFACE_MAP[color.surfaceType] || color.surfaceType || '—';

                  return (
                    <tr
                      key={color.id}
                      className="hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-b-0"
                    >
                      {/* Cột 1: Mẫu màu HEX */}
                      <td className="py-3 px-4 text-center">
                        <div
                          className="w-7 h-7 rounded-lg border border-slate-300 shadow-2xs mx-auto transition-transform group-hover:scale-110"
                          style={{ backgroundColor: color.colorHex || '#cccccc' }}
                          title={`Mã HEX: ${color.colorHex}`}
                        />
                      </td>

                      {/* Cột 2: Mã màu */}
                      <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-800">
                        {color.code}
                      </td>

                      {/* Cột 3: Tên màu */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                            {color.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {color.colorHex}
                          </span>
                        </div>
                      </td>

                      {/* Cột 4: Bề mặt xử lý */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {surfaceLabel}
                        </span>
                      </td>

                      {/* Cột 5: Đơn giá / kg */}
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 text-xs">
                        {color.pricePerKg ? formatCurrency(color.pricePerKg) : '0 ₫'}
                      </td>

                      {/* Cột 6: Hệ số giá */}
                      <td className="py-3 px-4 text-center text-xs font-semibold text-slate-700">
                        {color.priceMultiplier ?? 1.0}x
                      </td>

                      {/* Cột 7: Mặc định */}
                      <td className="py-3 px-4 text-center">
                        {color.isDefault ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                            Mặc định
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Cột 8: Trạng thái */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                            color.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {color.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>

                      {/* Cột 9: Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(color)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa màu"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(color)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa màu"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa màu */}
      <BrandColorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedColor(null);
        }}
        brandId={brand.id}
        brandColor={selectedColor}
      />
    </div>
  );
}
