/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { RotateCw, User, Plus, EyeOff, Download } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import { TableData, Button } from '@/components';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion, User as UserEntity } from '@/types';
import TableAction from '@/components/table/table-action';
import { BASE_MINIO_URL } from '@/config';
import { getUsers } from '@/actions';

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
    senderVal,
    setSenderVal,
    tab,
    setTab,
    search,
    setSearch,
    setIsEditing,
    setIsDeleteConfirmOpen,
    userSearch,
    setUserSearch,
    usersList,
    setUsersList,
  } = useSuggestionStore();

  // Debounced filter states (500ms delay)
  const debouncedSearch = useDebounce(search || '', 500);
  const debouncedSender = useDebounce(senderVal || '', 500);
  const debouncedType = useDebounce(typeFilterVal || '', 500);
  const debouncedTab = useDebounce(tab || 'all', 500);
  const debouncedUserSearch = useDebounce(userSearch, 500);
  const [selectedSenderUser, setSelectedSenderUser] = useState<UserEntity | null>(null);

  // Đồng bộ local state khi senderVal bị xóa hoặc reset từ store
  if (!senderVal && selectedSenderUser !== null) {
    setSelectedSenderUser(null);
  }

  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);

  useEffect(() => {
    if (!isManager) return;
    if (!debouncedUserSearch || debouncedUserSearch.trim().length < 2) {
      setUsersList([]);
      setHasMoreUsers(false);
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await getUsers({ search: debouncedUserSearch.trim(), limit: 10, offset: 0 });
        setUsersList(res.items || []);
        setHasMoreUsers((res.items || []).length === 7);
      } catch (error) {
        console.error('Lỗi khi fetch users:', error);
      }
    };
    fetchUsers();
  }, [debouncedUserSearch, isManager, setUsersList]);

  const handleLoadMoreUsers = useCallback(async () => {
    if (!isManager || isLoadingMoreUsers || !hasMoreUsers || !debouncedUserSearch || debouncedUserSearch.trim().length < 2) return;
    setIsLoadingMoreUsers(true);
    try {
      const res = await getUsers({ search: debouncedUserSearch.trim(), limit: 10, offset: usersList.length });
      if (res.items && res.items.length > 0) {
        setUsersList((prev) => {
          const newItems = res.items.filter((item) => !prev.some((p) => p.id === item.id));
          return [...prev, ...newItems];
        });
        setHasMoreUsers(res.items.length === 7);
      } else {
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error('Lỗi khi load thêm users:', error);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  }, [debouncedUserSearch, isManager, hasMoreUsers, isLoadingMoreUsers, usersList.length, setUsersList]);

  const selectedUserObj = useMemo(() => {
    if (senderVal) {
      const found = usersList.find((u) => u.id === senderVal) || (selectedSenderUser?.id === senderVal ? selectedSenderUser : null);
      if (found) {
        return {
          value: found.id,
          label: `${found.fullName} (${found.email})`,
        };
      }
    }
    return null;
  }, [senderVal, usersList, selectedSenderUser]);

  const senderOptions = [
    { value: undefined, label: 'Tất cả người gửi' },
    ...usersList.map((u) => ({
      value: u.id,
      label: `${u.fullName} (${u.email})`,
    })),
  ];

  if (selectedUserObj && !senderOptions.some((opt) => opt.value === selectedUserObj.value)) {
    senderOptions.push(selectedUserObj);
  }

  // React Query queryKey containing all debounced filters
  const queryKey = ['admin-suggestions', debouncedSearch, debouncedTab, isManager ? debouncedSender : currentUserId, debouncedType];

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
          userId: isManager ? debouncedSender || undefined : currentUserId,
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
    [debouncedTab, isManager, debouncedSender, currentUserId, debouncedSearch, debouncedType],
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
        const senderAvatar = row.anonymous ? null : row.user?.avatar;

        return (
          <div className="flex flex-col gap-1 cursor-default w-full max-w-150">
            {/* Title & Tag */}
            <div className="flex items-center justify-between gap-4 w-full">
              <span className="font-bold text-[#101718] text-sm group-hover:text-[#045863] transition-colors leading-tight truncate flex-1">
                {row.title}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${catInfo.class}`}>{catInfo.label}</span>
            </div>

            {/* Content */}
            <span className="text-[12px] text-[#5E858D] font-normal truncate leading-normal block w-full">{row.content}</span>

            {/* Sender / Người dùng nằm dưới */}
            <div className="flex items-center gap-2 select-none">
              {row.anonymous ? (
                <div className="w-6 h-6 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-slate-500 border border-slate-200/60">
                  <EyeOff className="w-3 h-3" />
                </div>
              ) : senderAvatar ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={senderAvatar.startsWith('http') ? senderAvatar : `${BASE_MINIO_URL}${senderAvatar}`}
                    alt={senderName}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-50 shrink-0 flex items-center justify-center text-cyan-700 border border-cyan-100/50">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex items-center gap-1.5 min-w-0 text-[11px]">
                <span className="font-semibold text-slate-700 truncate">{senderName}</span>
              </div>
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
      cell: (row: Suggestion) => (
        <TableAction
          onView={() => handleViewDetails(row)}
          onEdit={
            row.status === 'pending' && row.userId === currentUserId
              ? () => {
                  setSelectedSuggestion(row);
                  setIsEditing(true);
                  setDetailModalOpen(true);
                }
              : undefined
          }
          onDelete={
            row.status === 'pending' && (isManager || row.userId === currentUserId)
              ? () => {
                  setSelectedSuggestion(row);
                  setIsDeleteConfirmOpen(true);
                }
              : undefined
          }
        />
      ),
    },
  ];

  const renderCard = (row: Suggestion, index: number) => {
    const statusInfo = getStatusDetails(row.status);
    const cat = getSuggestionType(row);
    const catInfo = typeLabels[cat] || typeLabels.other;

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

            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${catInfo.class}`}>{catInfo.label}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{row.content}</p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            {senderAvatar ? (
              <img
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
      <div className="flex flex-col md:flex-row md:items-center justify-end pb-4 border-b border-slate-100 mb-4">
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

          {isManager && (
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
          )}

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
          placeholder: 'Tìm kiếm đề xuất...',
          value: search || '',
          onChange: setSearch,
          className: 'w-80',
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
          ...(isManager
            ? [
                {
                  label: 'Người gửi',
                  value: senderVal,
                  onChange: (val: string | undefined) => {
                    setSenderVal(val);
                    if (val) {
                      const found = usersList.find((u) => u.id === val);
                      if (found) {
                        setSelectedSenderUser(found);
                      }
                    } else {
                      setSelectedSenderUser(null);
                    }
                  },
                  onSearchChange: setUserSearch,
                  onLoadMore: handleLoadMoreUsers,
                  placeholder: 'Nhập tên để tìm kiếm ...',
                  options: senderOptions,
                  className: 'w-44',
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
