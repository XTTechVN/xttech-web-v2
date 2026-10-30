'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Columns, Layers, Sparkles, Filter, X } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Button, DoorCadRenderer } from '@/components';
import { useQueryParam } from '@/hooks';
import { Door, getDoorTypeConfig } from '@/types';
import { getDoors, getBrands, getDoorSeriesList } from '@/actions';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils';

interface TableProps {
  onEditClick: (door: Door) => void;
  onDeleteClick: (door: Door) => void;
  onAddClick?: () => void;
  onViewBOMClick: (door: Door) => void;
  onStudioClick: (door: Door) => void;
  onAddStudioClick: () => void;
  selectedBrandId?: number;
  selectedSeriesId?: number;
  onChangeBrandId?: (id?: number) => void;
  onChangeSeriesId?: (id?: number) => void;
}

function DoorPreviewBox({ door, size = 'sm' }: { door: Door; size?: 'sm' | 'md' }) {
  const primaryImgPath = door.images?.find((img) => img.isPrimary)?.imagePath || door.imagePath;
  const imgSrc = door.imageB64 || (primaryImgPath ? getFileUrl(primaryImgPath) : null);
  const hasStudioDesign = Boolean(door.systemConfig?.rootCell);
  const boxCls = size === 'md' ? 'w-14 h-14 shrink-0' : 'w-12 h-12';

  return (
    <div className={`${boxCls} rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-2xs`}>
      {imgSrc ? (
        <img src={imgSrc} alt={door.name} className="w-full h-full object-contain" />
      ) : hasStudioDesign ? (
        <div className="w-full h-full flex items-center justify-center p-0.5 pointer-events-none">
          <DoorCadRenderer
            hideDimensions={true}
            w={door.systemConfig?.w || 1600}
            h={door.systemConfig?.h || 2300}
            aluminumColor={door.systemConfig?.aluminumColor || '#334155'}
            hardwareColor={door.systemConfig?.hardwareColor || '#0f172a'}
            frameShape={door.systemConfig?.frameShape || 'rectangular'}
            rootCell={door.systemConfig!.rootCell}
            frameConfig={door.systemConfig?.frameConfig}
            sashConfig={door.systemConfig?.sashConfig}
            selectedCellId={null}
            onSelectCell={() => {}}
          />
        </div>
      ) : (
        <Columns className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}

const Table: React.FC<TableProps> = ({
  onEditClick,
  onDeleteClick,
  onViewBOMClick,
  onStudioClick,
  onAddStudioClick,
  selectedBrandId: propBrandId,
  selectedSeriesId: propSeriesId,
  onChangeBrandId,
  onChangeSeriesId,
}) => {
  const [search, setSearch] = useQueryParam('search');
  const [internalBrandId, setInternalBrandId] = useState<number | undefined>(undefined);
  const [internalSeriesId, setInternalSeriesId] = useState<number | undefined>(undefined);

  const brandId = propBrandId !== undefined ? propBrandId : internalBrandId;
  const seriesId = propSeriesId !== undefined ? propSeriesId : internalSeriesId;

  const setBrandId = (id?: number) => (onChangeBrandId ? onChangeBrandId(id) : setInternalBrandId(id));
  const setSeriesId = (id?: number) => (onChangeSeriesId ? onChangeSeriesId(id) : setInternalSeriesId(id));

  const { data: brandsData } = useQuery({ queryKey: ['brands-filter-list'], queryFn: () => getBrands({ limit: 100 }) });
  const brands = brandsData?.items || [];

  const { data: seriesData } = useQuery({
    queryKey: ['series-filter-list', brandId],
    queryFn: () => getDoorSeriesList({ brandId: brandId || undefined, limit: 300 }),
  });
  const seriesList = seriesData?.items || [];

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getDoors({
      offset,
      limit,
      search: search || undefined,
      brandId: brandId || undefined,
      doorSeriesId: seriesId || undefined,
    });
    if (!res) {
      toast.error('Lỗi khi tải danh sách cửa');
      throw new Error('Lỗi khi tải danh sách cửa');
    }
    return res;
  };

  const columns = useMemo(
    () => [
      { key: 'image', label: 'Bản vẽ / Ảnh', minWidth: '90px', cell: (row: Door) => <DoorPreviewBox door={row} size="sm" /> },
      { key: 'code', label: 'Mã cửa', minWidth: '130px', cell: (row: Door) => <span className="font-mono text-gray-700 text-xs font-semibold">{row.code || '—'}</span> },
      {
        key: 'doorSeries',
        label: 'Hệ nhôm',
        minWidth: '170px',
        cell: (row: Door) =>
          row.doorSeries ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70 truncate max-w-[160px]">
              {row.doorSeries.name}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">Chưa gán</span>
          ),
      },
      {
        key: 'type',
        label: 'Phân loại',
        minWidth: '80px',
        cell: (row: Door) => {
          if (!row.type) return <span className="text-gray-400 text-sm">—</span>;
          const config = getDoorTypeConfig(row.type);
          return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${config.className}`}>{config.label}</span>;
        },
      },
      { key: 'name', label: 'Tên cửa', minWidth: '220px', cell: (row: Door) => <span className="font-semibold text-gray-900 text-xs">{row.name}</span> },
      { key: 'specification', label: 'Thông số kỹ thuật', minWidth: '200px', cell: (row: Door) => <span className="text-gray-500 text-xs truncate max-w-50 block">{row.specification || '—'}</span> },
      {
        key: 'actions',
        label: 'Hành động',
        minWidth: '200px',
        cell: (row: Door) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              title="Mở Studio thiết kế cửa"
              onClick={() => onStudioClick(row)}
              className="px-2 py-1 rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100/80 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer border border-amber-200/60"
            >
              <Sparkles size={13} />
              Studio
            </button>
            <button
              type="button"
              title="Xem bóc tách kỹ thuật & bản vẽ 2D"
              onClick={() => onViewBOMClick(row)}
              className="px-2 py-1 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100/80 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer border border-blue-200/60"
            >
              <Layers size={13} />
              BOM
            </button>
            <TableAction onView={() => onEditClick(row)} onEdit={() => onEditClick(row)} onDelete={() => onDeleteClick(row)} />
          </div>
        ),
      },
    ],
    [onEditClick, onDeleteClick, onStudioClick, onViewBOMClick],
  );

  const renderCard = useCallback(
    (row: Door) => {
      const config = getDoorTypeConfig(row.type);
      return (
        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow space-y-3">
          <div className="flex items-start gap-3">
            <DoorPreviewBox door={row} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.className}`}>{config.label}</span>
                <span className="font-mono text-gray-500 text-xs">{row.code || '—'}</span>
              </div>
              <div className="font-semibold text-gray-900 text-sm truncate mt-1">{row.name}</div>
              {row.doorSeries && <div className="text-[11px] text-sky-600 font-medium mt-0.5">{row.doorSeries.name}</div>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onStudioClick(row)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              Studio
            </button>
            <button
              type="button"
              onClick={() => onViewBOMClick(row)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers size={12} />
              BOM
            </button>
          </div>
        </div>
      );
    },
    [onStudioClick, onViewBOMClick],
  );

  const hasActiveFilters = Boolean(brandId || seriesId || search);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Filter size={14} className="text-gray-400" />
            <span>Bộ lọc:</span>
          </div>

          <select
            value={brandId || ''}
            onChange={(e) => {
              setBrandId(e.target.value ? Number(e.target.value) : undefined);
              setSeriesId(undefined);
            }}
            className="h-8 px-2.5 text-xs font-medium bg-slate-50 hover:bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
          >
            <option value="">Tất cả Thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={seriesId || ''}
            onChange={(e) => setSeriesId(e.target.value ? Number(e.target.value) : undefined)}
            className="h-8 px-2.5 text-xs font-medium bg-slate-50 hover:bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[240px] truncate transition-all"
          >
            <option value="">Tất cả Hệ nhôm</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setBrandId(undefined);
                setSeriesId(undefined);
                setSearch('');
              }}
              className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <X size={13} />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-8 px-3 text-xs shrink-0 cursor-pointer shadow-xs"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={onAddStudioClick}
        >
          Studio Thiết kế Cửa
        </Button>
      </div>

      <TableData<Door>
        queryKey={['doors', search, brandId, seriesId]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm theo tên cửa, mã cửa...',
          value: search,
          onChange: setSearch,
          className: 'w-72',
        }}
      />
    </div>
  );
};

export default Table;
