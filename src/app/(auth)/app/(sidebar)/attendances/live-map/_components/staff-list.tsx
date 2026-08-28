'use client';

import { useState } from 'react';
import { StaffLiveLocation } from '@/types';
import { Search, Navigation, Battery, Gauge, Clock, Users } from 'lucide-react';
import { Input } from '@/components';
import dayjs from 'dayjs';

interface StaffListProps {
  staffLocations: StaffLiveLocation[];
  selectedStaff: StaffLiveLocation | null;
  onSelectStaff: (staff: StaffLiveLocation) => void;
  onViewRoute: (staff: StaffLiveLocation) => void;
  isLoading?: boolean;
}

export function StaffList({
  staffLocations,
  selectedStaff,
  onSelectStaff,
  onViewRoute,
  isLoading = false,
}: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'stationary' | 'offline'>('all');

  const filteredStaff = staffLocations.filter((staff) => {
    const name = staff.user_name || '';
    const dept = staff.department_name || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(query) ||
      dept.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const movingCount = staffLocations.filter((s) => s.status === 'moving').length;
  const stationaryCount = staffLocations.filter((s) => s.status === 'stationary').length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Danh sách */}
      <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nhân sự trực tuyến</h3>
              <p className="text-[11px] text-slate-500">{staffLocations.length} nhân viên trong ca</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {movingCount} di chuyển
            </span>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc phòng ban..."
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({staffLocations.length})
          </button>
          <button
            onClick={() => setStatusFilter('moving')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'moving' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Di chuyển ({movingCount})
          </button>
          <button
            onClick={() => setStatusFilter('stationary')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'stationary' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đứng yên ({stationaryCount})
          </button>
        </div>
      </div>

      {/* Danh sách nhân viên */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Đang tải dữ liệu định vị...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy nhân sự phù hợp.</div>
        ) : (
          filteredStaff.map((staff, index) => {
            const isSelected = selectedStaff?.user_id === staff.user_id;
            const isMoving = staff.status === 'moving';
            const isOffline = staff.status === 'offline';
            const uniqueKey = staff.user_id ? `${staff.user_id}-${index}` : `staff-${index}`;

            return (
              <div
                key={uniqueKey}
                onClick={() => onSelectStaff(staff)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden shrink-0">
                    {staff.avatar ? (
                      <img src={staff.avatar} alt={staff.user_name || 'Nhân viên'} className="w-full h-full object-cover" />
                    ) : (
                      (staff.user_name || 'N').charAt(0).toUpperCase()
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                        isOffline ? 'bg-slate-400' : isMoving ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{staff.user_name || 'Nhân viên'}</h4>
                      {staff.battery_level !== undefined && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Battery size={11} className={staff.battery_level < 20 ? 'text-rose-500' : 'text-slate-400'} />
                          {staff.battery_level}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {staff.position_name || staff.department_name || 'Nhân viên'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Gauge size={11} className={isMoving ? 'text-emerald-500' : 'text-slate-400'} />
                      {staff.speed ? `${Math.round(staff.speed * 3.6)} km/h` : '0 km/h'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      {dayjs(staff.updated_at).format('HH:mm:ss')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRoute(staff);
                    }}
                    className="p-1 px-2 rounded-md bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title="Xem lộ trình trong ngày"
                  >
                    <Navigation size={10} />
                    <span>Lộ trình</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
