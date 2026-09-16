'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getLiveLocations } from '@/actions';
import { getFileUrl } from '@/utils';
import { MapPin, Navigation, ArrowUpRight, Signal } from 'lucide-react';
import Image from 'next/image';

export const LiveStaffWidget: React.FC = () => {
  const { data: liveStaff = [], isLoading } = useQuery({
    queryKey: ['dashboard-live-locations'],
    queryFn: () => getLiveLocations(),
    refetchInterval: 30000, // Làm mới mỗi 30s
  });

  const staffList = Array.isArray(liveStaff) ? liveStaff : [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Navigation size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-900">Nhân sự thực địa (Live GPS)</h3>
            <span className="text-[11px] text-gray-500 font-medium">
              Kỹ thuật viên đang bật định vị
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{staffList.length} online</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-xs text-gray-400">
          Đang tải dữ liệu thực địa...
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 gap-1.5 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Signal size={22} className="text-gray-300" />
          <span className="text-xs font-medium text-gray-500">Chưa có nhân sự nào bật GPS hôm nay</span>
          <span className="text-[10px] text-gray-400">Tọa độ sẽ tự động cập nhật khi nhân viên vào ca</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {staffList.slice(0, 5).map((staff, idx) => {
            const avatarUrl = staff.avatar ? getFileUrl(staff.avatar) : null;
            const displayName = staff.userName || 'Nhân sự';
            return (
              <div
                key={staff.userId || idx}
                className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {displayName.charAt(0)}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                      <MapPin size={10} className="text-emerald-500 shrink-0" />
                      {`${staff.latitude?.toFixed(4)}, ${staff.longitude?.toFixed(4)}`}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 font-mono shrink-0 pl-2">
                  {staff.updatedAt
                    ? new Date(staff.updatedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/app/live-map"
        className="pt-2 border-t border-gray-100 text-xs font-semibold text-primary hover:text-primary/80 flex items-center justify-between group transition"
      >
        <span>Mở bản đồ giám sát toàn màn hình</span>
        <ArrowUpRight
          size={15}
          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
        />
      </Link>
    </div>
  );
};

export default LiveStaffWidget;
