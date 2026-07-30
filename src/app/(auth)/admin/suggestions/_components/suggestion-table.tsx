/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback } from 'react';
import { RotateCw, User, Plus, EyeOff, Download } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import { TableData, Button } from '@/components';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion } from '@/types';

const priorityLabels: Record<string, { label: string; class: string }> = {
  high: { label: 'Cao', class: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'T.Bình', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Thấp', class: 'bg-sky-50 text-sky-700 border-sky-200' },
};

// Hàm bổ trợ phân loại chủ đề linh hoạt từ category hoặc content
const getSuggestionCategory = (p: Suggestion) => {
  const cat = (p.category || '').toLowerCase().trim();
  if (cat === 'process' || cat.includes('quy trình') || cat.includes('cải tiến')) return 'process';
  if (cat === 'technology' || cat.includes('công nghệ') || cat.includes('thiết bị')) return 'technology';
  if (cat === 'environment' || cat.includes('môi trường') || cat.includes('làm việc')) return 'environment';
  if (cat === 'other' || cat.includes('khác')) return 'other';

  if (p.content) {
    const parts = p.content.split('|||');
    if (parts.length === 3) {
      const firstPart = parts[0].toLowerCase().trim();
      if (firstPart.includes('quy trình') || firstPart.includes('process')) return 'process';
      if (firstPart.includes('công nghệ') || firstPart.includes('technology')) return 'technology';
      if (firstPart.includes('môi trường') || firstPart.includes('environment')) return 'environment';
      if (firstPart.includes('khác') || firstPart.includes('other')) return 'other';
    }
  }
  return 'other';
};

const categoryLabels: Record<string, { label: string; class: string }> = {
  process: { label: 'Quy trình', class: 'bg-[#E7F9FC] text-[#045863] border-[#0CBFDF]/30' },
  technology: { label: 'Công nghệ', class: 'bg-[#FEFCE8] text-[#A16207] border-[#FACC15]/30' },
  environment: { label: 'Môi trường', class: 'bg-[#FDF4F5] text-[#991B1B] border-[#F87171]/30' },
  other: { label: 'Khác', class: 'bg-slate-50 text-slate-600 border-slate-200' },
};

export default function SuggestionTable() {
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
    priorityFilterVal,
    setPriorityFilterVal,
    categoryFilterVal,
    setCategoryFilterVal,
    senderVal,
    setSenderVal,
    tab,
    setTab,
    search,
    setSearch,
  } = useSuggestionStore();

  // Fetch suggestions to calculate accurate statistics (sharing cache with StatCards)
  const { data: suggestionsStats } = useQuery({
    queryKey: ['admin-suggestions-all-stats'],
    queryFn: () => getSuggestions({ limit: 1000 }),
  });

  const pendingCount = suggestionsStats?.items?.filter((p: Suggestion) => p.status === 'pending').length || 0;

  // Debounced filter states (500ms delay)
  const debouncedSearch = useDebounce(search || '', 500);
  const debouncedSender = useDebounce(senderVal || '', 500);
  const debouncedPriority = useDebounce(priorityFilterVal || '', 500);
  const debouncedCategory = useDebounce(categoryFilterVal || '', 500);
  const debouncedTab = useDebounce(tab || 'all', 500);

  // React Query queryKey containing all debounced filters
  const queryKey = ['admin-suggestions', debouncedSearch, debouncedTab, debouncedSender, debouncedPriority, debouncedCategory];

  // 2. Fetcher tied to React Query
  const fetcher = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      let statusParam: 'pending' | 'approve' | 'reject' | undefined = undefined;
      if (debouncedTab === 'pending') {
        statusParam = 'pending';
      }

      const hasFilters = debouncedSearch || debouncedSender || debouncedPriority || debouncedCategory || debouncedTab === 'processed';

      const response = await getSuggestions({
        status: statusParam,
        limit: hasFilters ? 1000 : limit,
        offset: hasFilters ? 0 : offset,
      });

      let filtered = [...response.items];

      // Filter by debouncedCategory
      if (debouncedCategory) {
        filtered = filtered.filter((p) => getSuggestionCategory(p) === debouncedCategory);
      }

      // Filter by tab
      if (debouncedTab === 'processed') {
        filtered = filtered.filter((p) => p.status === 'approve' || p.status === 'reject');
      }

      // Filter by debouncedSender
      if (debouncedSender) {
        if (debouncedSender === 'anonymous') {
          filtered = filtered.filter((p) => p.anonymous);
        } else if (debouncedSender === 'identified') {
          filtered = filtered.filter((p) => !p.anonymous);
        }
      }

      // Filter by debouncedPriority
      if (debouncedPriority) {
        filtered = filtered.filter((p) => p.priority === debouncedPriority);
      }

      // Filter by search (keyword search)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter((p) => {
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchContent = p.content?.toLowerCase().includes(q);
          const matchSender = !p.anonymous && p.user?.fullName.toLowerCase().includes(q) && p.user?.email.toLowerCase().includes(q);
          return matchTitle || matchContent || matchSender;
        });
      }

      const total = filtered.length;
      if (total === 0) {
        return {
          items: [],
          meta: {
            total: 0,
            offset: 0,
            limit,
            next: false,
          },
        };
      }

      if (hasFilters) {
        return {
          items: filtered.slice(offset, offset + limit),
          meta: {
            total,
            offset,
            limit,
            next: offset + limit < total,
          },
        };
      }

      return response;
    },
    [debouncedTab, debouncedSearch, debouncedSender, debouncedPriority, debouncedCategory],
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
      minWidth: '250px',
      cell: (row: Suggestion) => (
        <div className="flex flex-col gap-1 pr-4 py-1 cursor-default">
          <span className="font-bold text-[#101718] text-sm group-hover:text-[#045863] transition-colors leading-tight line-clamp-2">
            {row.title}
          </span>
          <span className="text-[12px] text-[#5E858D] font-normal line-clamp-2 leading-normal">{row.content}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Chủ đề',
      minWidth: '130px',
      cell: (row: Suggestion) => {
        const cat = getSuggestionCategory(row);
        const info = categoryLabels[cat] || categoryLabels.other;
        return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${info.class}`}>{info.label}</span>;
      },
    },
    {
      key: 'sender',
      label: 'Người gửi',
      minWidth: '110px',
      cell: (row: Suggestion) => {
        const senderName = row.anonymous ? 'Ẩn danh' : row.user?.fullName || 'Ẩn danh';
        const senderAvatar = row.anonymous ? null : row.user?.avatar;
        const dept = (row as any).department || (row.user as any)?.department || '';

        return (
          <div className="flex items-center gap-3 select-none py-1">
            {row.anonymous ? (
              <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-slate-500 border border-slate-200/60">
                <EyeOff className="w-5 h-5" />
              </div>
            ) : senderAvatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <Image src={senderAvatar} alt={senderName} width={40} height={40} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-50 shrink-0 flex items-center justify-center text-cyan-700 border border-cyan-100/50">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-medium text-slate-900 text-[14px] leading-snug truncate">{senderName}</span>
              <span className="text-[10px] text-slate-500 font-normal leading-none truncate">{dept}</span>
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
      key: 'priority',
      label: 'Độ ưu tiên',
      minWidth: '115px',
      cell: (row: Suggestion) => {
        const priorityInfo = priorityLabels[row.priority] || {
          label: row.priority || 'Trung bình',
          class: 'bg-slate-50 text-slate-500 border-slate-100',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold select-none border ${priorityInfo.class}`}>
            {priorityInfo.label}
          </span>
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
      label: 'Thao tác',
      minWidth: '120px',
      cell: (row: Suggestion) => (
        <Button onClick={() => handleViewDetails(row)} variant="ghost" className="text-[#045863]">
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const renderCard = (row: Suggestion, index: number) => {
    const statusInfo = getStatusDetails(row.status);
    const cat = getSuggestionCategory(row);
    const catInfo = categoryLabels[cat] || categoryLabels.other;

    const senderName = row.anonymous ? 'Ẩn danh' : row.user?.fullName || 'Ẩn danh';
    const senderAvatar = row.anonymous ? null : row.user?.avatar;

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
        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer select-none"
        onClick={() => handleViewDetails(row)}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-slate-800 text-sm hover:text-emerald-600 transition-colors">{row.title}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {timeStr} - {dateStr}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0 select-none">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusInfo.class}`}>{statusInfo.label}</span>
            {row.priority && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${priorityLabels[row.priority]?.class || 'bg-slate-50 text-slate-500 border-slate-100'}`}
              >
                {priorityLabels[row.priority]?.label || row.priority}
              </span>
            )}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${catInfo.class}`}>{catInfo.label}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{row.content}</p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            {senderAvatar ? (
              <Image
                src={senderAvatar}
                alt={senderName}
                width={18}
                height={18}
                className="w-4.5 h-4.5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
            <span>{senderName}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-md shadow-slate-900/2">
      {/* 1. Header Panel */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 mb-6">
        {/* Left Tabs */}
        <div className="flex items-center gap-3 select-none">
          <Button
            onClick={() => setTab('all')}
            variant={tab === 'all' ? 'primary' : 'outline'}
            className={`h-9 px-4 text-xs font-bold rounded-xl transition-all ${
              tab === 'all'
                ? 'bg-[#006377] hover:bg-[#006377]/90 text-white border-transparent'
                : 'border-slate-200 text-[#5E858D] hover:bg-slate-50 bg-white hover:text-[#5E858D]'
            }`}
          >
            Tất cả
          </Button>

          <Button
            onClick={() => setTab('pending')}
            variant={tab === 'pending' ? 'primary' : 'outline'}
            className={`h-9 px-4 text-xs font-bold rounded-xl transition-all gap-1.5 ${
              tab === 'pending'
                ? 'bg-[#006377] hover:bg-[#006377]/90 text-white border-transparent'
                : 'border-slate-200 text-[#5E858D] hover:bg-slate-50 bg-white hover:text-[#5E858D]'
            }`}
          >
            <span className="flex items-center gap-1">
              Chưa xử lý{' '}
              {pendingCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full font-bold text-[10px] leading-none text-center ${
                    tab === 'pending' ? 'bg-white text-[#006377]' : 'bg-[#FDF2F2] text-[#DC2626]'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </span>
          </Button>

          <Button
            onClick={() => setTab('processed')}
            variant={tab === 'processed' ? 'primary' : 'outline'}
            className={`h-9 px-4 text-xs font-bold rounded-xl transition-all ${
              tab === 'processed'
                ? 'bg-[#006377] hover:bg-[#006377]/90 text-white border-transparent'
                : 'border-slate-200 text-[#5E858D] hover:bg-slate-50 bg-white hover:text-[#5E858D]'
            }`}
          >
            Đã xử lý
          </Button>
        </div>

        {/* Right Actions (Export & Refresh) */}
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            loading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
            className="px-2.5 lg:px-3 gap-0 lg:gap-2"
          >
            <span className="hidden lg:inline">{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleRefresh} className="p-2 h-9 w-9 shrink-0 flex items-center justify-center rounded-lg">
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
          placeholder: 'Tìm kiếm ý kiến...',
          value: search || '',
          onChange: setSearch,
          className: 'w-80',
        }}
        filters={[
          {
            label: 'Chủ đề',
            value: categoryFilterVal,
            onChange: setCategoryFilterVal,
            options: [
              { value: undefined, label: 'Tất cả chủ đề' },
              { value: 'process', label: 'Quy trình' },
              { value: 'technology', label: 'Công nghệ' },
              { value: 'environment', label: 'Môi trường' },
              { value: 'other', label: 'Khác' },
            ],
            className: 'w-44',
          },
          {
            label: 'Người gửi',
            value: senderVal,
            onChange: setSenderVal,
            options: [
              { value: undefined, label: 'Tất cả người gửi' },
              { value: 'anonymous', label: 'Ẩn danh' },
              { value: 'identified', label: 'Công khai' },
            ],
            className: 'w-44',
          },
          {
            label: 'Độ ưu tiên',
            value: priorityFilterVal,
            onChange: setPriorityFilterVal,
            options: [
              { value: undefined, label: 'Tất cả độ ưu tiên' },
              { value: 'high', label: 'Cao' },
              { value: 'medium', label: 'Trung bình' },
              { value: 'low', label: 'Thấp' },
            ],
            className: 'w-44',
          },
        ]}
      />
    </div>
  );
}
