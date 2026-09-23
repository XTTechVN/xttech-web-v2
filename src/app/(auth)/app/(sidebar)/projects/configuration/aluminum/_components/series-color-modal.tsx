'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components';
import { Palette, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBrandColors, deleteBrandColor } from '@/actions';
import type { DoorSeries, Brand, BrandColor } from '@/types';
import { formatCurrency, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { BrandColorModal } from './modals';

interface SeriesColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: DoorSeries | null;
  brands: Brand[];
}

export function SeriesColorModal({ isOpen, onClose, series, brands }: SeriesColorModalProps) {
  const [isColorFormOpen, setIsColorFormOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);

  const brandId = series?.brandId;
  const brand = brands.find((b) => b.id === brandId) || series?.brand;

  const { data: colorsData, isLoading } = useQuery({
    queryKey: ['brand-colors', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const res = await getBrandColors({ brandId, limit: 100 });
      return res.items;
    },
    enabled: Boolean(isOpen && brandId),
  });

  const { mutate: deleteColorMutate } = useMutation({
    mutationFn: (id: number) => deleteBrandColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors'] });
      toast.success('Xóa màu sơn thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa màu sơn'),
  });

  if (!series) return null;

  const colors = colorsData || [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Bảng màu sắc hệ nhôm: ${series.name}`}
        size="xl"
        className="md:max-w-5xl"
      >
        <div className="flex flex-col gap-4">
          {/* Header thông tin tóm tắt */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-teal-50/80 via-slate-50 to-white border border-teal-100 rounded-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Palette size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900">{series.name}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-800 text-xs font-semibold">
                    {series.code}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thương hiệu: <span className="font-semibold text-gray-800">{brand?.name || `Hãng ID ${brandId}`}</span>
                  {series.aluminumThickness && (
                    <>
                      {' • '}Độ dày tiêu chuẩn: <span className="font-semibold text-gray-800">{series.aluminumThickness} mm</span>
                    </>
                  )}
                  {' • '}Số lượng màu cấu hình: <span className="font-semibold text-teal-700">{colors.length} màu</span>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedColor(null);
                setIsColorFormOpen(true);
              }}
            >
              Thêm màu sơn mới
            </Button>
          </div>

          {/* Bảng danh sách màu */}
          <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white shadow-xs">
            <table className="w-full text-left text-sm divide-y divide-gray-200">
              <thead className="bg-slate-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Màu sắc</th>
                  <th className="px-4 py-3 whitespace-nowrap">Mã màu</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">Tên màu sơn</th>
                  <th className="px-4 py-3 whitespace-nowrap">Xử lý bề mặt</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Đơn giá nhôm / kg</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Mặc định</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Đang tải danh sách màu sắc...
                    </td>
                  </tr>
                ) : colors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Chưa có màu sơn nào cho hệ nhôm này. Nhấn nút &quot;Thêm màu sơn mới&quot; để bổ sung.
                    </td>
                  </tr>
                ) : (
                  colors.map((c) => {
                    const surfaceLabels: Record<string, string> = {
                      powder_coat: 'Sơn tĩnh điện',
                      anodize: 'Anodize / Xi mạ',
                      wood_grain: 'Vân gỗ',
                      pvdf: 'Sơn PVDF',
                    };

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs shrink-0"
                              style={{ backgroundColor: c.colorHex || '#4B4F54' }}
                            />
                            <span className="font-mono text-xs text-gray-500 uppercase font-semibold">
                              {c.colorHex}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
                          {c.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {surfaceLabels[c.surfaceType] || c.surfaceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(c.pricePerKg)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {c.isDefault ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={13} />
                              Mặc định
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedColor(c);
                                setIsColorFormOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Sửa màu sơn"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Xác nhận xóa màu sơn "${c.name}"?`)) {
                                  deleteColorMutate(c.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa màu sơn"
                            >
                              <Trash2 size={15} />
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

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Thêm / Sửa Màu Sơn */}
      {isColorFormOpen && (
        <BrandColorModal
          isOpen={isColorFormOpen}
          onClose={() => {
            setIsColorFormOpen(false);
            setSelectedColor(null);
          }}
          color={selectedColor}
          brands={brands}
          defaultBrandId={brandId}
        />
      )}
    </>
  );
}
