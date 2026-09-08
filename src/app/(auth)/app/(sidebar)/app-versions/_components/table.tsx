'use client';

import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Smartphone, AlertTriangle, Plus } from 'lucide-react';
import { TableData, ITableColumn, ITableFilterProps, Badge, Button } from '@/components';
import { getAppVersions } from '@/actions';
import { useQueryParam } from '@/hooks';
import type { AppVersionItem } from '@/types';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface TableProps {
  latestVersionCode?: number;
  onAddClick?: () => void;
}

export function AppVersionTable({ latestVersionCode, onAddClick }: TableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [search, setSearch] = useQueryParam('search');
  const [platformFilter, setPlatformFilter] = useState<string | undefined>(undefined);

  const tableFilters = useMemo<ITableFilterProps[]>(() => [
    {
      label: 'Nền tảng',
      value: platformFilter,
      options: [
        { label: 'Tất cả nền tảng', value: undefined },
        { label: 'Android', value: 'android' },
        { label: 'iOS', value: 'ios' },
      ],
      onChange: (val) => setPlatformFilter(val),
    },
  ], [platformFilter]);

  const fetcher = async (params: { offset: number; limit: number }) => {
    try {
      return await getAppVersions({
        ...params,
        search: search || undefined,
        platform: platformFilter || undefined,
      });
    } catch {
      toast.error('Lỗi khi tải danh sách phiên bản ứng dụng');
      throw new Error('Lỗi khi tải danh sách phiên bản ứng dụng');
    }
  };

  const handleCopyUrl = (id: number, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Đã sao chép liên kết tải APK');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: ITableColumn<AppVersionItem>[] = [
    {
      key: 'version',
      label: 'Phiên bản',
      minWidth: '180px',
      cell: (row: AppVersionItem) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">v{row.versionName}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-mono font-semibold">
              Build {row.versionCode}
            </span>
          </div>
          {latestVersionCode && row.versionCode === latestVersionCode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              ● Bản mới nhất
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Nền tảng',
      minWidth: '120px',
      cell: (row: AppVersionItem) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium capitalize">
          <Smartphone className="w-4 h-4 text-primary" />
          <span>{row.platform}</span>
        </div>
      ),
    },
    {
      key: 'forceUpdate',
      label: 'Yêu cầu cập nhật',
      minWidth: '140px',
      cell: (row: AppVersionItem) =>
        row.forceUpdate ? (
          <Badge variant="danger" size="sm">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Bắt buộc
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Tùy chọn
          </Badge>
        ),
    },
    {
      key: 'changelog',
      label: 'Nội dung cập nhật (Changelog)',
      cell: (row: AppVersionItem) => (
        <div className="max-w-md py-1">
          {row.changelog && row.changelog.length > 0 ? (
            <ul className="space-y-1 text-xs text-gray-600">
              {row.changelog.slice(0, 3).map((change: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span className="line-clamp-1">{change}</span>
                </li>
              ))}
              {row.changelog.length > 3 && (
                <li className="text-[11px] text-gray-400 italic">
                  +{row.changelog.length - 3} nội dung khác...
                </li>
              )}
            </ul>
          ) : (
            <span className="text-xs text-gray-400 italic">Không có ghi chú</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày phát hành',
      minWidth: '150px',
      cell: (row: AppVersionItem) => (
        <span className="text-xs text-gray-600">
          {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') : '--'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: AppVersionItem) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleCopyUrl(row.id, row.apkUrl)}
            title="Sao chép liên kết tải APK"
            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {copiedId === row.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          {row.apkUrl && (
            <a
              href={row.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Tải trực tiếp file APK"
              className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  const renderCard = (row: AppVersionItem) => (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">v{row.versionName}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-mono font-semibold">
            Build {row.versionCode}
          </span>
        </div>
        {row.forceUpdate ? (
          <Badge variant="danger" size="sm">Bắt buộc</Badge>
        ) : (
          <Badge variant="default" size="sm">Tùy chọn</Badge>
        )}
      </div>

      {row.changelog && row.changelog.length > 0 && (
        <p className="text-xs text-gray-600 line-clamp-2">
          {row.changelog.join(', ')}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span>{row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY') : '--'}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyUrl(row.id, row.apkUrl)}
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <Copy className="w-3.5 h-3.5" /> Link
          </button>
          {row.apkUrl && (
            <a
              href={row.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Tải APK
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {onAddClick && (
        <div className="flex justify-end items-center gap-2 w-full">
          <Button
            variant="primary"
            size="sm"
            className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
            leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            onClick={onAddClick}
          >
            Phát hành bản mới
          </Button>
        </div>
      )}

      <TableData<AppVersionItem>
        columns={columns}
        fetcher={fetcher}
        queryKey={['app-versions', search, platformFilter]}
        renderCard={renderCard}
        select={false}
        filters={tableFilters}
        search={{
          placeholder: 'Tìm kiếm theo tên phiên bản...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
}
