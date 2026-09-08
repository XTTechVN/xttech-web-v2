/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback } from 'react';
import { RotateCw, Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import { TableData, TableAction, Button, Heading } from '@/components';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion } from '@/types';

// Hàm bổ trợ phân loại chủ đề linh hoạt từ type hoặc content
const getSuggestionType = (p: Suggestion) => {
  const cat = (p.type || '').toLowerCase().trim();
  return cat || 'other';
};

const typeLabels: Record<string, { label: string; class: string }> = {
  process: { label: 'Cải tiến quy trình làm việc', class: 'bg-[#E7F9FC] text-[#045863] border-[#0CBFDF]/30' },
  product: { label: 'Cải tiến sản phẩm/dịch vụ', class: 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]/30' },
  technology: { label: 'Đề xuất kỹ thuật, CNTT', class: 'bg-[#FEFCE8] text-[#A16207] border-[#FACC15]/30' },
  cost: { label: 'Tiết kiệm chi phí', class: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]/30' },
  quality: { label: 'Nâng cao chất lượng', class: 'bg-[#F5F3FF] text-[#5B21B6] border-[#C4B5FD]/30' },
  safety: { label: 'An toàn lao động', class: 'bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]/30' },
  workplace: { label: 'Môi trường làm việc', class: 'bg-[#FFF7ED] text-[#9A3412] border-[#FDBA74]/30' },
  welfare: { label: 'Chế độ, phúc lợi', class: 'bg-[#FDF2F8] text-[#9D174D] border-[#FBCFE8]/30' },
  training: { label: 'Đào tạo, phát triển nhân sự', class: 'bg-[#EEF2F6] text-[#1E293B] border-[#CBD5E1]/30' },
  customer: { label: 'Chăm sóc khách hàng', class: 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]/30' },
  complaint: { label: 'Phản ánh, khiếu nại', class: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]/30' },
  other: { label: 'Khác', class: 'bg-slate-50 text-slate-600 border-slate-200' },
};

interface SuggestionTableProps {
  isManager: boolean;
  currentUserId?: string;
}

export default function SuggestionTable({ isManager, currentUserId }: SuggestionTableProps) {
  const queryClient = useQueryClient();

  const {
    setSelectedSuggestion,
    setDetailModalOpen,
    resetFilters,
    setCreateModalOpen,
    isExporting,
    setExporting,
    isRefreshing,
    setRefreshing,
    typeFilterVal,
    setTypeFilterVal,
    tab,
    setTab,
    search,
    setSearch,
    setIsEditing,
    setIsDeleteConfirmOpen,
  } = useSuggestionStore();

  // Debounced filter states (500ms delay)
  const debouncedSearch = useDebounce(search || '', 500);
  const debouncedType = useDebounce(typeFilterVal || '', 500);
  const debouncedTab = useDebounce(tab || 'all', 500);

  // React Query queryKey containing all debounced filters
  const queryKey = ['admin-suggestions', debouncedSearch, debouncedTab, isManager ? undefined : currentUserId, debouncedType];

  // 2. Fetcher tied to React Query
  const fetcher = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      let statusParam: 'pending' | 'approve' | 'reject' | undefined = undefined;
      if (debouncedTab === 'pending') {
        statusParam = 'pending';
      } else if (debouncedTab === 'approve') {
        statusParam = 'approve';
      } else if (debouncedTab === 'reject') {
        statusParam = 'reject';
      }

      let response;
      try {
        response = await getSuggestions({
          status: statusParam,
          userId: isManager ? undefined : currentUserId,
          search: debouncedSearch || undefined,
          type: debouncedType || undefined,
          limit: limit,
          offset: offset,
        });
      } catch (err: any) {
        toast.error('Không thể tải danh sách đề xuất.');
        throw err;
      }

      return response;
    },
    [debouncedTab, isManager, currentUserId, debouncedSearch, debouncedType],
  );

  const handleExportExcel = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success('Xuất file Excel thành công!');
    }, 1200);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    resetFilters();
    queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Danh sách đã được làm mới!');
    }, 500);
  };

  const getStatusDetails = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Chờ duyệt', class: 'bg-[#FEFCE8] text-[#A16207] border-[#FEF9C3]' },
      approve: { label: 'Đã xử lý', class: 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]' },
      reject: { label: 'Từ chối', class: 'bg-[#FDF4F5] text-[#991B1B] border-[#FEE2E2]' },
    };
    return map[status] || { label: 'Không rõ', class: 'bg-slate-100 text-slate-600' };
  };

  const handleViewDetails = (proposal: Suggestion) => {
    setSelectedSuggestion(proposal);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      key: 'title',
      label: 'Đề xuất',
      minWidth: '350px',
      maxWidth: '500px',
      cell: (row: Suggestion) => {
        const cat = getSuggestionType(row);
        const catInfo = typeLabels[cat] || typeLabels.other;
        const senderName = row.anonymous ? 'Ẩn danh' : `${row.user?.fullName} (${row.user?.email})` || 'Ẩn danh';
        return (
          <div className="flex flex-col gap-1 cursor-default w-full max-w-150">
            {/* Title & Tag */}
            <div className="flex items-center justify-start gap-2 w-full">
              <span className="font-bold text-[#101718] text-sm group-hover:text-[#045863] transition-colors leading-tight truncate">
                {row.title}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${catInfo.class}`}>{catInfo.label}</span>
            </div>

            {/* Content */}
            <span className="text-[12px] text-[#5E858D] font-normal truncate leading-normal block w-full">{row.content}</span>

            {/* Sender / Người dùng nằm dưới */}
            <div className="flex items-center min-w-0 text-[11px] select-none">
              <span className="font-semibold text-slate-700 truncate">{senderName}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'time',
      label: 'Thời gian',
      minWidth: '120px',
      cell: (row: Suggestion) => {
        if (!row.createdAt) {
          return <span className="text-slate-450 text-xs">N/A</span>;
        }

        const date = new Date(row.createdAt);
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

        const dateStr = isToday
          ? 'Hôm nay'
          : date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

        return (
          <div className="flex flex-col gap-0.5 select-none">
            <span className="text-[14px] font-normal text-[#5E858D] leading-tight">{timeStr}</span>
            <span className="text-[10px] font-normal text-[#5E858D] leading-tight">{dateStr}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row: Suggestion) => {
        const statusInfo = getStatusDetails(row.status);
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-bold select-none border ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Suggestion) => {
        const isProcessed = row.status !== 'pending';
        const canDelete = isManager || row.userId === currentUserId;

        return (
          <TableAction
            items={[
              {
                title: 'Xem chi tiết',
                icon: Eye,
                size: 18,
                onClick: () => handleViewDetails(row),
              },
              {
                title: isProcessed ? 'Đề xuất đã xử lý (Không thể sửa)' : 'Chỉnh sửa',
                icon: Pencil,
                size: 18,
                disabled: isProcessed,
                className: isProcessed
                  ? 'text-gray-400 dark:text-gray-600 hover:text-gray-400 hover:bg-transparent cursor-not-allowed opacity-35 disabled:opacity-35'
                  : undefined,
                onClick: () => {
                  if (isProcessed) return;
                  setSelectedSuggestion(row);
                  setIsEditing(true);
                  setDetailModalOpen(true);
                },
              },
              (canDelete || isProcessed) && {
                title: isProcessed ? 'Đề xuất đã xử lý (Không thể xóa)' : 'Xóa',
                icon: Trash2,
                size: 18,
                disabled: isProcessed,
                className: isProcessed
                  ? 'text-gray-400 dark:text-gray-600 hover:text-gray-400 hover:bg-transparent cursor-not-allowed opacity-35 disabled:opacity-35'
                  : 'hover:text-red-600 hover:bg-red-50',
                onClick: () => {
                  if (isProcessed) return;
                  setSelectedSuggestion(row);
                  setIsDeleteConfirmOpen(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const renderCard = (row: Suggestion, index: number) => {
    const statusInfo = getStatusDetails(row.status);
    const cat = getSuggestionType(row);
    const catInfo = typeLabels[cat] || typeLabels.other;

    const senderName = row.anonymous
      ? 'Ẩn danh'
      : `${row.user?.fullName || 'Người dùng'} ${row.user?.email ? `(${row.user.email})` : ''}`.trim() || 'Ẩn danh';

    const date = row.createdAt ? new Date(row.createdAt) : null;
    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    const today = new Date();
    const isToday = date
      ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
      : false;

    const dateStr = date ? (isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })) : 'N/A';

    return (
      <div
        key={row.id || index}
        onClick={() => handleViewDetails(row)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        {/* Header: Tiêu đề, Phân loại & Trạng thái */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#101718] text-sm leading-tight break-words">{row.title}</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${catInfo.class}`}>{catInfo.label}</span>
            </div>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Nội dung đề xuất */}
        {row.content && <p className="text-[12px] text-[#5E858D] font-normal line-clamp-2 leading-relaxed">{row.content}</p>}

        {/* Footer: Thông tin người gửi, Thời gian & Các nút thao tác */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100/50">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-slate-700 text-[11px] truncate">{senderName}</span>
              <span className="text-[10px] text-[#5E858D]">
                {timeStr} • {dateStr}
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {row.status !== 'pending' ? (
              <>
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 border border-gray-200 flex items-center gap-1 cursor-not-allowed opacity-40"
                  title="Đề xuất đã xử lý (Không thể sửa)"
                >
                  <Pencil size={12} />
                  Sửa
                </button>
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 border border-gray-200 flex items-center gap-1 cursor-not-allowed opacity-40"
                  title="Đề xuất đã xử lý (Không thể xóa)"
                >
                  <Trash2 size={12} />
                  Xóa
                </button>
              </>
            ) : (
              <>
                {row.userId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSuggestion(row);
                      setIsEditing(true);
                      setDetailModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={12} />
                    Sửa
                  </button>
                )}
                {(isManager || row.userId === currentUserId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSuggestion(row);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Xóa
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Panel */}
      <div className="flex md:flex-row justify-end items-start md:items-center w-full gap-4">
        {/* Right Header (Add, Export & Refresh) */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="px-2.5 lg:px-3 gap-0 lg:gap-2"
          >
            <span className="hidden lg:inline">Tạo đề xuất</span>
          </Button>

          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              loading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
              className="px-2.5 lg:px-3 gap-0 lg:gap-2 hover:bg-[#ececf27d]"
            >
              <span className="hidden lg:inline">{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleRefresh} className="p-2 h-9 w-9 shrink-0 flex items-center justify-center rounded-lg hover:bg-[#ececf27d]">
            <RotateCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. Responsive TableData */}
      <TableData<Suggestion>
        queryKey={queryKey}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm theo tên nhân viên hoặc phòng ban...',
          value: search || '',
          onChange: setSearch,
          className: 'min-w-[350px]',
        }}
        filters={[
          {
            label: 'Trạng thái',
            value: tab === 'all' ? undefined : tab,
            onChange: (val) => setTab(val || 'all'),
            options: [
              { value: undefined, label: 'Tất cả trạng thái' },
              { value: 'approve', label: 'Đã xử lý' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'reject', label: 'Từ chối' },
            ],
            className: 'w-44',
          },
          {
            label: 'Chủ đề',
            value: typeFilterVal,
            onChange: setTypeFilterVal,
            options: [
              { value: undefined, label: 'Tất cả chủ đề' },
              { value: 'process', label: 'Quy trình' },
              { value: 'product', label: 'Sản phẩm/Dịch vụ' },
              { value: 'technology', label: 'Công nghệ, kỹ thuật' },
              { value: 'cost', label: 'Tiết kiệm chi phí' },
              { value: 'quality', label: 'Nâng cao chất lượng' },
              { value: 'safety', label: 'An toàn lao động' },
              { value: 'workplace', label: 'Môi trường làm việc' },
              { value: 'welfare', label: 'Chế độ, phúc lợi' },
              { value: 'training', label: 'Đào tạo, phát triển' },
              { value: 'customer', label: 'Chăm sóc khách hàng' },
              { value: 'complaint', label: 'Phản ánh, khiếu nại' },
              { value: 'other', label: 'Khác' },
            ],
            className: 'w-44',
          },
        ]}
      />
    </div>
  );
}
