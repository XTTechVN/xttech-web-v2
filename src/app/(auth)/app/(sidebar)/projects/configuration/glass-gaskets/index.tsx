'use client';

import React, { useState } from 'react';
import { StatsCard, Button } from '@/components';
import { TableData } from '@/components/table';
import { ShieldCheck, Layers, Wrench, CheckCircle2, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star, } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getGlasses, getGlassCategories, getGaskets, deleteGlass, setDefaultGlass, deleteGlassCategory, updateGlassCategory, deleteGasket, } from '@/actions';
import type { Glass, GlassCategory, Gasket } from '@/types';
import { GASKET_UNIT_MAP } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast, formatCurrency } from '@/utils';
import { GlassModal, GasketModal, GlassCategoryModal } from './_components/modals';

type SubTab = 'glasses' | 'categories' | 'gaskets';

export default function GlassGasketsPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('glasses');

  // Modals state
  const [isGlassModalOpen, setIsGlassModalOpen] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<Glass | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GlassCategory | null>(null);

  const [isGasketModalOpen, setIsGasketModalOpen] = useState(false);
  const [selectedGasket, setSelectedGasket] = useState<Gasket | null>(null);

  const { data: glassesData } = useQuery({
    queryKey: ['glasses'],
    queryFn: async () => (await getGlasses({ limit: 999 })).items,
  });

  const { data: catData } = useQuery({
    queryKey: ['glass-categories'],
    queryFn: async () => (await getGlassCategories({ limit: 999 })).items,
  });

  const { data: gasketData } = useQuery({
    queryKey: ['gaskets'],
    queryFn: async () => (await getGaskets({ limit: 999 })).items,
  });

  const categoriesList = catData || [];

  const stats = [
    {
      title: 'Quy cách vật tư tấm',
      value: glassesData?.length || 0,
      icon: <ShieldCheck className="text-primary" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Nhóm chủng loại tấm',
      value: catData?.length || 0,
      icon: <Layers className="text-blue-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Gioăng ron & Keo phụ trợ',
      value: gasketData?.length || 0,
      icon: <Wrench className="text-amber-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Tiêu chuẩn xưởng tôi',
      value: 'TCVN 7455',
      icon: <CheckCircle2 className="text-emerald-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const { mutate: deleteGlassMutate } = useMutation({
    mutationFn: (id: number) => deleteGlass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success('Xóa kính thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa kính'),
  });

  const { mutate: setDefaultGlassMutate } = useMutation({
    mutationFn: (id: number) => setDefaultGlass(id),
    onSuccess: (updatedGlass) => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success(`Đã đặt "${updatedGlass.name}" làm kính mặc định`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi đặt kính mặc định'),
  });

  const { mutate: deleteGasketMutate } = useMutation({
    mutationFn: (id: number) => deleteGasket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaskets'] });
      toast.success('Xóa gioăng ron thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa gioăng ron'),
  });

  const { mutate: deleteCategoryMutate } = useMutation({
    mutationFn: (id: number) => deleteGlassCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success('Xóa nhóm chủng loại thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa nhóm chủng loại'),
  });

  const { mutate: swapOrderMutate, isPending: isSwapping } = useMutation({
    mutationFn: async ({ current, target }: { current: GlassCategory; target: GlassCategory }) => {
      let currentOrder = current.sortOrder;
      let targetOrder = target.sortOrder;
      if (currentOrder === targetOrder) {
        const currIdx = categoriesList.findIndex((c) => c.id === current.id);
        const targetIdx = categoriesList.findIndex((c) => c.id === target.id);
        currentOrder = currIdx + 1;
        targetOrder = targetIdx + 1;
      }
      await Promise.all([
        updateGlassCategory(current.id, { sortOrder: targetOrder }),
        updateGlassCategory(target.id, { sortOrder: currentOrder }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success('Đã cập nhật thứ tự hiển thị');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi đổi thứ tự'),
  });

  const categoryColumns = [
    {
      key: 'order',
      label: 'Thứ tự',
      minWidth: '110px',
      cell: (row: GlassCategory) => {
        const index = categoriesList.findIndex((c) => c.id === row.id);
        const isFirst = index === 0;
        const isLast = index === categoriesList.length - 1;

        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
              #{index + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={isFirst || isSwapping}
                onClick={() => {
                  if (!isFirst) {
                    swapOrderMutate({
                      current: row,
                      target: categoriesList[index - 1],
                    });
                  }
                }}
                className={`p-1 rounded transition cursor-pointer ${
                  isFirst || isSwapping
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
                title="Đưa lên trên"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={isLast || isSwapping}
                onClick={() => {
                  if (!isLast) {
                    swapOrderMutate({
                      current: row,
                      target: categoriesList[index + 1],
                    });
                  }
                }}
                className={`p-1 rounded transition cursor-pointer ${
                  isLast || isSwapping
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
                title="Đưa xuống dưới"
              >
                <ArrowDown size={13} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'code',
      label: 'Mã nhóm',
      minWidth: '130px',
      cell: (row: GlassCategory) => (
        <span className="font-bold text-primary">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên nhóm chủng loại & Ứng dụng',
      minWidth: '240px',
      cell: (row: GlassCategory) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          {row.description ? (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{row.description}</p>
          ) : (
            <span className="text-xs text-gray-400 italic">Chưa có mô tả ứng dụng</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '110px',
      cell: (row: GlassCategory) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.isActive ? 'Áp dụng' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: GlassCategory) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory(row);
              setIsCategoryModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa nhóm chủng loại "${row.name}"?`)) {
                deleteCategoryMutate(row.id);
              }
            }}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const glassColumns = [
    {
      key: 'code',
      label: 'Mã hiệu kính',
      minWidth: '120px',
      cell: (row: Glass) => (
        <span className="font-semibold text-primary">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên quy cách',
      minWidth: '220px',
      cell: (row: Glass) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          <span className="text-xs text-gray-500">
            Dày: {row.thicknessMm} mm | Nặng: {row.weightPerM2} kg/m²
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Chủng loại',
      minWidth: '140px',
      cell: (row: Glass) => {
        const typeLabels: Record<string, string> = {
          cuong_luc: 'Cường lực tôi',
          dan_an_toan: 'Dán an toàn PVB',
          kinh_hop: 'Hộp cách âm',
          trang: 'Kính sống/Phôi',
          panel_alu: 'Panel nhôm/Alu',
          luoi_muoi: 'Lưới inox muỗi',
          nan_chop: 'Nan chớp nhôm',
          tam_to_ong: 'Tấm tổ ong',
          kinh_hop_rem: 'Kính hộp rèm',
          polycarbonate: 'Polycarbonate',
        };
        return (
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {typeLabels[row.glassType] || row.glassType}
          </span>
        );
      },
    },
    {
      key: 'unitPrice',
      label: 'Đơn giá / m²',
      minWidth: '130px',
      cell: (row: Glass) => (
        <span className="font-bold text-gray-900">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Mặc định',
      minWidth: '90px',
      cell: (row: Glass) => (
        <button
          type="button"
          onClick={() => setDefaultGlassMutate(row.id)}
          className="p-1 rounded-md hover:bg-amber-50 transition cursor-pointer"
          title={row.isDefault ? 'Đang là kính mặc định hệ thống' : 'Bấm để đặt làm kính mặc định hệ thống'}
        >
          <Star
            size={18}
            className={row.isDefault ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'}
          />
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '100px',
      cell: (row: Glass) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {row.isActive !== false ? 'Đang bán' : 'Tạm ngưng'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: Glass) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedGlass(row);
              setIsGlassModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa quy cách"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa quy cách kính "${row.name}"?`)) {
                deleteGlassMutate(row.id);
              }
            }}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const gasketColumns = [
    {
      key: 'code',
      label: 'Mã vật tư',
      minWidth: '140px',
      cell: (row: Gasket) => (
        <span className="font-semibold text-gray-900">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên vật tư',
      minWidth: '240px',
      cell: (row: Gasket) => (
        <p className="font-semibold text-gray-900">{row.name}</p>
      ),
    },
    {
      key: 'unit',
      label: 'Đơn vị tính',
      minWidth: '100px',
      cell: (row: Gasket) => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          {GASKET_UNIT_MAP[row.unit?.toLowerCase()] || row.unit}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Đơn giá',
      minWidth: '120px',
      cell: (row: Gasket) => (
        <span className="font-bold text-gray-900">{formatCurrency(row.pricePerUnit)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: Gasket) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedGasket(row);
              setIsGasketModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa vật tư "${row.name}"?`)) {
                deleteGasketMutate(row.id);
              }
            }}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      {/* Sub-Tabs Selector & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('glasses')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'glasses'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={16} />
            Quy cách vật tư tấm (Kính / Panel / Lưới)
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers size={16} />
            Nhóm chủng loại vật tư tấm
          </button>
          <button
            onClick={() => setActiveSubTab('gaskets')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'gaskets'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench size={16} />
            Gioăng ron & Keo phụ trợ
          </button>
        </div>

        {/* Nút thêm mới */}
        <div>
          {activeSubTab === 'glasses' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedGlass(null);
                setIsGlassModalOpen(true);
              }}
            >
              Thêm quy cách mới
            </Button>
          )}
          {activeSubTab === 'categories' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
            >
              Thêm nhóm chủng loại
            </Button>
          )}
          {activeSubTab === 'gaskets' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedGasket(null);
                setIsGasketModalOpen(true);
              }}
            >
              Thêm gioăng ron / keo
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'glasses' && (
        <TableData
          fetcher={async ({ offset, limit }) => {
            return await getGlasses({ offset, limit });
          }}
          columns={glassColumns}
          queryKey={['glasses']}
        />
      )}

      {activeSubTab === 'categories' && (
        <TableData
          fetcher={async ({ offset, limit }) => {
            return await getGlassCategories({ offset, limit });
          }}
          columns={categoryColumns}
          queryKey={['glass-categories']}
        />
      )}

      {activeSubTab === 'gaskets' && (
        <TableData
          fetcher={async ({ offset, limit }) => {
            return await getGaskets({ offset, limit });
          }}
          columns={gasketColumns}
          queryKey={['gaskets']}
        />
      )}

      {/* Modals Zone */}
      <GlassModal
        isOpen={isGlassModalOpen}
        onClose={() => {
          setIsGlassModalOpen(false);
          setSelectedGlass(null);
        }}
        glass={selectedGlass}
        categories={categoriesList}
      />

      <GlassCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      <GasketModal
        isOpen={isGasketModalOpen}
        onClose={() => {
          setIsGasketModalOpen(false);
          setSelectedGasket(null);
        }}
        gasket={selectedGasket}
      />
    </div>
  );
}
