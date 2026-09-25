'use client';

import React, { useState } from 'react';
import { StatsCard, Button } from '@/components';
import { TableData } from '@/components/table';
import {
  Layers,
  Package,
  Plus,
  Building2,
  CheckCircle2,
  Pencil,
  Trash2,
  Palette,
  ArrowLeft,
  FolderKanban,
  ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getBrands,
  getDoorSeriesList,
  getProfileBars,
  getBrandColors,
  deleteBrand,
  deleteDoorSeries,
  deleteProfileBar,
  deleteBrandColor,
} from '@/actions';
import type { Brand, DoorSeries, ProfileBar, BrandColor } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast, formatCurrency } from '@/utils';
import {
  BrandModal,
  DoorSeriesModal,
  ProfileBarModal,
  BrandColorModal,
} from './_components/modals';
import { SeriesColorModal } from './_components/series-color-modal';

type BrandDetailTab = 'series' | 'colors' | 'bars';

export default function AluminumConfigurationPage() {
  // Master - Detail Navigation State
  const [selectedBrandForDetail, setSelectedBrandForDetail] = useState<Brand | null>(null);
  const [brandDetailTab, setBrandDetailTab] = useState<BrandDetailTab>('series');

  // Modals state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<DoorSeries | null>(null);

  const [isBarModalOpen, setIsBarModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<ProfileBar | null>(null);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);

  // Modal quản lý bảng màu của từng Hệ nhôm
  const [isSeriesColorModalOpen, setIsSeriesColorModalOpen] = useState(false);
  const [selectedSeriesForColor, setSelectedSeriesForColor] = useState<DoorSeries | null>(null);

  // Queries
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await getBrands({ limit: 999 })).items,
  });

  const { data: seriesData } = useQuery({
    queryKey: ['door-series'],
    queryFn: async () => (await getDoorSeriesList({ limit: 1000 })).items,
  });

  const { data: barsData } = useQuery({
    queryKey: ['profile-bars'],
    queryFn: async () => (await getProfileBars({ limit: 5000 })).items,
  });

  const { data: allColorsData } = useQuery({
    queryKey: ['brand-colors'],
    queryFn: async () => (await getBrandColors({ limit: 1000 })).items,
  });

  const brandsList = brandsData || [];
  const seriesList = seriesData || [];

  const stats = [
    {
      title: 'Hãng nhôm sản xuất',
      value: brandsData?.length || 0,
      icon: <Building2 className="text-primary" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Hệ nhôm kỹ thuật',
      value: seriesData?.length || 0,
      icon: <Layers className="text-blue-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Thanh nhôm Profile',
      value: barsData?.length || 0,
      icon: <Package className="text-amber-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Tổng số màu sơn',
      value: allColorsData?.length || 0,
      icon: <Palette className="text-emerald-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  // Mutations
  const { mutate: deleteBrandMutate } = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Xóa thương hiệu thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa thương hiệu'),
  });

  const { mutate: deleteSeriesMutate } = useMutation({
    mutationFn: (id: number) => deleteDoorSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['door-series'] });
      toast.success('Xóa hệ nhôm thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa hệ nhôm'),
  });

  const { mutate: deleteBarMutate } = useMutation({
    mutationFn: (id: number) => deleteProfileBar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Xóa thanh profile thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa thanh profile'),
  });

  const { mutate: deleteColorMutate } = useMutation({
    mutationFn: (id: number) => deleteBrandColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors'] });
      toast.success('Xóa màu sơn thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa màu sơn'),
  });

  // Brands columns
  const brandColumns = [
    {
      key: 'code',
      label: 'Mã hãng',
      minWidth: '110px',
      cell: (row: Brand) => (
        <span className="font-semibold text-gray-900">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên thương hiệu',
      minWidth: '200px',
      cell: (row: Brand) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Xuất xứ: {row.originCountry || 'Chưa rõ'}</span>
            {Boolean(row.barLengthMm) && (
              <>
                <span>•</span>
                <span className="text-primary font-medium">Chuẩn: {row.barLengthMm}mm</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'brand_type',
      label: 'Phân loại',
      minWidth: '120px',
      cell: (row: Brand) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          aluminum: { label: 'Hãng nhôm', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          accessory: { label: 'Phụ kiện', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          both: { label: 'Cả hai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        };
        const conf = typeMap[row.brandType] || { label: row.brandType, color: 'bg-gray-100 text-gray-700' };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${conf.color}`}>
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'ecosystem',
      label: 'Hệ sinh thái kỹ thuật',
      minWidth: '270px',
      cell: (row: Brand) => {
        const seriesCount = seriesData?.filter((s) => s.brandId === row.id).length || 0;
        const barCount = barsData?.filter((b) => b.brandId === row.id).length || 0;
        const colorCount = allColorsData?.filter((c) => c.brandId === row.id).length || 0;

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Layers size={12} />
              {seriesCount} hệ nhôm
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <Package size={12} />
              {barCount} cây profile
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Palette size={12} />
              {colorCount} màu
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row: Brand) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {row.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '170px',
      cell: (row: Brand) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedBrandForDetail(row);
              setBrandDetailTab('series');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition cursor-pointer"
            title="Quản lý chi tiết hệ nhôm, bảng màu và thanh profile của hãng này"
          >
            <FolderKanban size={13} />
            Chi tiết
          </button>
          <button
            onClick={() => {
              setSelectedBrand(row);
              setIsBrandModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa thương hiệu "${row.name}"?`)) {
                deleteBrandMutate(row.id);
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

  // Series columns
  const seriesColumns = [
    {
      key: 'code',
      label: 'Mã hệ',
      minWidth: '110px',
      cell: (row: DoorSeries) => (
        <span className="font-semibold text-gray-900">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên hệ nhôm',
      minWidth: '220px',
      cell: (row: DoorSeries) => {
        const brandName = row.brand?.name || (row.brandId ? `ID ${row.brandId}` : '—');
        return (
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            <span className="text-xs text-gray-500">
              Hãng: {brandName}
            </span>
          </div>
        );
      },
    },
    {
      key: 'thickness',
      label: 'Độ dày (mm)',
      minWidth: '130px',
      cell: (row: DoorSeries) => (
        <span className="text-sm font-medium text-gray-800">
          {row.aluminumThickness ? `${row.aluminumThickness} mm` : '—'}
        </span>
      ),
    },
    {
      key: 'corner',
      label: 'Kiểu liên kết',
      minWidth: '130px',
      cell: (row: DoorSeries) => {
        const jointType = row.cornerJointType || '';
        const jointMap: Record<string, string> = {
          ke_ep_goc: 'Ke ép góc',
          ke_vinh_cuu: 'Ke vĩnh cửu',
          ke_nhay: 'Ke nhảy',
        };
        return (
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium border border-slate-200">
            {jointMap[jointType] || jointType || '—'}
          </span>
        );
      },
    },
    {
      key: 'colors',
      label: 'Bảng màu khả dụng',
      minWidth: '160px',
      cell: (row: DoorSeries) => {
        const seriesColors = (allColorsData || []).filter((c) => c.brandId === row.brandId);
        return (
          <button
            type="button"
            onClick={() => {
              setSelectedSeriesForColor(row);
              setIsSeriesColorModalOpen(true);
            }}
            className="group flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition cursor-pointer"
            title="Bấm để xem và quản lý bảng màu của hệ nhôm này"
          >
            <div className="flex -space-x-1.5 overflow-hidden">
              {seriesColors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="inline-block w-4 h-4 rounded-full ring-1.5 ring-white shadow-2xs"
                  style={{ backgroundColor: c.colorHex || '#4B4F54' }}
                  title={`${c.name} (${c.code})`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-primary">
              {seriesColors.length} màu
            </span>
          </button>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '130px',
      cell: (row: DoorSeries) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedSeriesForColor(row);
              setIsSeriesColorModalOpen(true);
            }}
            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
            title="Quản lý bảng màu của hệ"
          >
            <Palette size={15} />
          </button>
          <button
            onClick={() => {
              setSelectedSeries(row);
              setIsSeriesModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa hệ nhôm "${row.name}"?`)) {
                deleteSeriesMutate(row.id);
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

  // Profile Bars columns
  const barColumns = [
    {
      key: 'code',
      label: 'Mã thanh dập',
      minWidth: '130px',
      cell: (row: ProfileBar) => (
        <div className="flex items-center gap-2">
          {row.sectionLibrary && (
            <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-1 shrink-0">
              <svg viewBox={row.sectionLibrary.viewBox || '0 0 100 100'} className="w-full h-full text-primary">
                <path d={row.sectionLibrary.svgPathData} fill="currentColor" />
              </svg>
            </div>
          )}
          <span className="font-bold text-primary">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên thanh profile',
      minWidth: '220px',
      cell: (row: ProfileBar) => {
        const length = row.barLengthMm ?? 6000;
        const height = row.sectionHeightMm ?? 0;
        const seriesName = row.doorSeries?.name;
        return (
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            <span className="text-xs text-gray-500">
              {seriesName ? `${seriesName} • ` : ''}Dài: {length} mm | Cao: {height} mm
            </span>
          </div>
        );
      },
    },
    {
      key: 'barType',
      label: 'Vai trò',
      minWidth: '130px',
      cell: (row: ProfileBar) => {
        const role = row.barType || 'FRAME';
        const roleMap: Record<string, { label: string; color: string }> = {
          FRAME: { label: 'Khung bao', color: 'bg-sky-50 text-sky-700 border-sky-200' },
          SASH: { label: 'Khung cánh', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          MULLION: { label: 'Đố chia', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          BEAD: { label: 'Nẹp kính', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          TRACK: { label: 'Ray trượt', color: 'bg-slate-100 text-slate-700 border-slate-300' },
          ADAPTER: { label: 'Đảo / Nối', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          LOUVER: { label: 'Nan chớp', color: 'bg-orange-50 text-orange-700 border-orange-200' },
          PANEL: { label: 'Pano nhôm', color: 'bg-teal-50 text-teal-700 border-teal-200' },
        };
        const item = roleMap[role] || { label: role, color: 'bg-gray-50 text-gray-700 border-gray-200' };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${item.color}`}>
            {item.label}
          </span>
        );
      },
    },
    {
      key: 'weight',
      label: 'Tỷ trọng',
      minWidth: '100px',
      cell: (row: ProfileBar) => (
        <span className="font-semibold text-gray-800">{row.weightPerM ?? 0} kg/m</span>
      ),
    },
    {
      key: 'deductions',
      label: 'Trừ ngàm (Cánh/Kính)',
      minWidth: '160px',
      cell: (row: ProfileBar) => (
        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 block">
          Cánh: -{row.deductSashMm ?? 0}mm | Kính: -{row.deductGlassMm ?? 0}mm
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: ProfileBar) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedBar(row);
              setIsBarModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa thanh nhôm "${row.name}" (${row.code})?`)) {
                deleteBarMutate(row.id);
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

  // Color columns
  const colorColumns = [
    {
      key: 'color',
      label: 'Màu sắc',
      minWidth: '110px',
      cell: (row: BrandColor) => {
        const hex = row.colorHex || '#4B4F54';
        return (
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full border border-gray-300 shadow-xs shrink-0"
              style={{ backgroundColor: hex }}
              title={hex}
            />
            <span className="font-mono text-xs text-gray-500 uppercase">{hex}</span>
          </div>
        );
      },
    },
    {
      key: 'code',
      label: 'Mã màu',
      minWidth: '120px',
      cell: (row: BrandColor) => (
        <span className="font-semibold text-gray-900">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên màu sơn',
      minWidth: '200px',
      cell: (row: BrandColor) => {
        const brandName = row.brand?.name || (row.brandId ? `Hãng ID ${row.brandId}` : '');
        return (
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            {brandName && <span className="text-xs text-gray-500">{brandName}</span>}
          </div>
        );
      },
    },
    {
      key: 'surface_type',
      label: 'Kiểu xử lý bề mặt',
      minWidth: '160px',
      cell: (row: BrandColor) => {
        const surfType = row.surfaceType || '';
        const surfMap: Record<string, string> = {
          powder_coat: 'Sơn tĩnh điện',
          anodize: 'Anodize / Xi mạ',
          wood_grain: 'Vân gỗ',
          pvdf: 'Sơn PVDF',
        };
        return (
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium border border-slate-200">
            {surfMap[surfType] || surfType}
          </span>
        );
      },
    },
    {
      key: 'price_per_kg',
      label: 'Đơn giá nhôm/kg',
      minWidth: '140px',
      cell: (row: BrandColor) => (
        <span className="font-bold text-emerald-700">{formatCurrency(row.pricePerKg ?? 0)}</span>
      ),
    },
    {
      key: 'is_default',
      label: 'Mặc định',
      minWidth: '100px',
      cell: (row: BrandColor) => (
        row.isDefault ? (
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
            Mặc định
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: BrandColor) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedColor(row);
              setIsColorModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa màu sơn "${row.name}" (${row.code})?`)) {
                deleteColorMutate(row.id);
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

  const currentSelectedBrand = selectedBrandForDetail
    ? brandsList.find((b) => b.id === selectedBrandForDetail.id) || selectedBrandForDetail
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Master View: Overview Stats when at root */}
      {!currentSelectedBrand && (
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
      )}

      {/* Conditional Rendering: Brand Detail Workspace vs Master Brands List */}
      {currentSelectedBrand ? (
        <div className="flex flex-col gap-4">
          {/* Top Bar: Back button & Breadcrumbs */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedBrandForDetail(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary transition cursor-pointer bg-white px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-2xs hover:border-primary/40"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách hãng nhôm
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Hãng nhôm sản xuất</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-800">{currentSelectedBrand.name}</span>
            </div>
          </div>

          {/* Brand Workspace Summary Banner */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{currentSelectedBrand.name}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {currentSelectedBrand.code}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      currentSelectedBrand.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {currentSelectedBrand.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span>Xuất xứ: <strong className="text-slate-700">{currentSelectedBrand.originCountry || 'Việt Nam'}</strong></span>
                  {currentSelectedBrand.website && (
                    <span>Website: <a href={currentSelectedBrand.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{currentSelectedBrand.website}</a></span>
                  )}
                  {currentSelectedBrand.description && (
                    <span className="text-slate-400">| {currentSelectedBrand.description}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil size={14} />}
                onClick={() => {
                  setSelectedBrand(currentSelectedBrand);
                  setIsBrandModalOpen(true);
                }}
              >
                Sửa hãng
              </Button>
            </div>
          </div>

          {/* Subtabs for this Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setBrandDetailTab('series')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                  brandDetailTab === 'series'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers size={16} />
                Hệ nhôm kỹ thuật
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    brandDetailTab === 'series'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {(seriesData || []).filter((s) => s.brandId === currentSelectedBrand.id).length}
                </span>
              </button>

              <button
                onClick={() => setBrandDetailTab('colors')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                  brandDetailTab === 'colors'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Palette size={16} />
                Bảng màu sắc & Đơn giá/kg
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    brandDetailTab === 'colors'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {(allColorsData || []).filter((c) => c.brandId === currentSelectedBrand.id).length}
                </span>
              </button>

              <button
                onClick={() => setBrandDetailTab('bars')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                  brandDetailTab === 'bars'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package size={16} />
                Thanh Profile (Cây 6m)
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    brandDetailTab === 'bars'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {(barsData || []).filter((b) => b.brandId === currentSelectedBrand.id).length}
                </span>
              </button>
            </div>

            {/* Quick action button based on active subtab */}
            <div>
              {brandDetailTab === 'series' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={15} />}
                  onClick={() => {
                    setSelectedSeries(null);
                    setIsSeriesModalOpen(true);
                  }}
                >
                  Thêm hệ nhôm ({currentSelectedBrand.code})
                </Button>
              )}
              {brandDetailTab === 'colors' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={15} />}
                  onClick={() => {
                    setSelectedColor(null);
                    setIsColorModalOpen(true);
                  }}
                >
                  Thêm màu sơn ({currentSelectedBrand.code})
                </Button>
              )}
              {brandDetailTab === 'bars' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={15} />}
                  onClick={() => {
                    setSelectedBar(null);
                    setIsBarModalOpen(true);
                  }}
                >
                  Thêm thanh profile ({currentSelectedBrand.code})
                </Button>
              )}
            </div>
          </div>

          {/* Subtab Table Content */}
          {brandDetailTab === 'series' && (
            <TableData
              fetcher={async ({ offset, limit }) => {
                return await getDoorSeriesList({ brandId: currentSelectedBrand.id, offset, limit });
              }}
              columns={seriesColumns}
              queryKey={['door-series', currentSelectedBrand.id]}
            />
          )}

          {brandDetailTab === 'colors' && (
            <TableData
              fetcher={async ({ offset, limit }) => {
                return await getBrandColors({ brandId: currentSelectedBrand.id, offset, limit });
              }}
              columns={colorColumns}
              queryKey={['brand-colors', currentSelectedBrand.id]}
            />
          )}

          {brandDetailTab === 'bars' && (
            <TableData
              fetcher={async ({ offset, limit }) => {
                return await getProfileBars({ brandId: currentSelectedBrand.id, offset, limit });
              }}
              columns={barColumns}
              queryKey={['profile-bars', currentSelectedBrand.id]}
            />
          )}
        </div>
      ) : (
        /* Master View: Danh sách Hãng nhôm */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh mục Hãng nhôm & Hệ sinh thái kỹ thuật</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bấm vào <strong>&quot;Chi tiết&quot;</strong> tại từng hãng để quản lý các hệ nhôm, bảng màu và cây profile thuộc riêng hãng đó.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedBrand(null);
                setIsBrandModalOpen(true);
              }}
            >
              Thêm thương hiệu mới
            </Button>
          </div>

          <TableData
            fetcher={async ({ offset, limit }) => {
              return await getBrands({ offset, limit });
            }}
            columns={brandColumns}
            queryKey={['brands']}
          />
        </div>
      )}

      {/* Modals Zone */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => {
          setIsBrandModalOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand}
      />

      <DoorSeriesModal
        isOpen={isSeriesModalOpen}
        onClose={() => {
          setIsSeriesModalOpen(false);
          setSelectedSeries(null);
        }}
        series={selectedSeries}
        brands={brandsList}
        defaultBrandId={currentSelectedBrand?.id}
      />

      <ProfileBarModal
        isOpen={isBarModalOpen}
        onClose={() => {
          setIsBarModalOpen(false);
          setSelectedBar(null);
        }}
        bar={selectedBar}
        brands={brandsList}
        seriesList={seriesList}
        defaultBrandId={currentSelectedBrand?.id}
      />

      <BrandColorModal
        isOpen={isColorModalOpen}
        onClose={() => {
          setIsColorModalOpen(false);
          setSelectedColor(null);
        }}
        color={selectedColor}
        brands={brandsList}
        defaultBrandId={currentSelectedBrand?.id}
      />

      {/* Modal Quản lý Bảng màu theo Hệ nhôm */}
      <SeriesColorModal
        isOpen={isSeriesColorModalOpen}
        onClose={() => {
          setIsSeriesColorModalOpen(false);
          setSelectedSeriesForColor(null);
        }}
        series={selectedSeriesForColor}
        brands={brandsList}
      />
    </div>
  );
}
