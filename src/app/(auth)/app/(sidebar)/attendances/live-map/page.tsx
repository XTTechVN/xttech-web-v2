'use client';

import { useEffect, useRef, useState } from 'react';
import { getLiveLocations } from '@/actions';
import { StaffLiveLocation } from '@/types';
import { BASE_WS_URL } from '@/config';
import { LiveMap } from './_components/live-map';
import { StaffList } from './_components/staff-list';
import { RoutePlaybackModal } from './_components/route-playback-modal';
import { Radio, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceLiveMapPage() {
  const [staffLocations, setStaffLocations] = useState<StaffLiveLocation[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffLiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Modal xem lộ trình
  const [routeModalState, setRouteModalState] = useState<{ isOpen: boolean; userId: string; userName: string; }>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  const wsRef = useRef<WebSocket | null>(null);

  const fetchInitialLocations = async () => {
    setIsLoading(true);
    try {
      const data = await getLiveLocations();
      setStaffLocations(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách vị trí:', err);
      toast.error('Không thể tải dữ liệu định vị nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialLocations();

    // Kết nối WebSocket Realtime
    const wsUrl = `${BASE_WS_URL}/api/v1/ws/live-tracking`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsWsConnected(true);
    };

    ws.onmessage = (event) => {
      // Bỏ qua gói tin phản hồi nhịp tim pong
      if (event.data === 'pong') return;

      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'STAFF_LOCATION_UPDATE' && payload.data) {
          const updatedStaff: StaffLiveLocation = payload.data;

          setStaffLocations((prev) => {
            const index = prev.findIndex((s) => s.userId === updatedStaff.userId);
            if (index >= 0) {
              const clone = [...prev];
              clone[index] = updatedStaff;
              return clone;
            } else {
              return [updatedStaff, ...prev];
            }
          });

          // Cập nhật selectedStaff nếu đang xem nhân viên này
          setSelectedStaff((current) =>
            current?.userId === updatedStaff.userId ? updatedStaff : current
          );
        }
      } catch (e) {
        console.warn('Lỗi parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      setIsWsConnected(false);
    };

    ws.onerror = () => {
      setIsWsConnected(false);
    };

    // Heartbeat ping 30s
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, []);

  const handleOpenRoute = (staff: StaffLiveLocation) => {
    setRouteModalState({
      isOpen: true,
      userId: staff.userId,
      userName: staff.userName,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Giám sát Vị trí Nhân sự Trực tiếp
          </h2>
          <span
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              isWsConnected
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            <Radio size={12} className={isWsConnected ? 'animate-pulse' : ''} />
            <span>{isWsConnected ? 'Realtime Live' : 'Đang kết nối lại'}</span>
          </span>
        </div>

        <button
          onClick={fetchInitialLocations}
          disabled={isLoading}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Main Content: Sidebar List + Map View */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
        {/* Danh sách nhân viên */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 h-64 md:h-full">
          <StaffList
            staffLocations={staffLocations}
            selectedStaff={selectedStaff}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
            onViewRoute={handleOpenRoute}
            isLoading={isLoading}
          />
        </div>

        {/* Bản đồ trực tiếp */}
        <div className="flex-1 h-full min-h-[350px]">
          <LiveMap
            staffLocations={staffLocations}
            selectedStaff={selectedStaff}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
            onViewRoute={handleOpenRoute}
          />
        </div>
      </div>

      {/* Modal phát lại lộ trình */}
      {routeModalState.isOpen && (
        <RoutePlaybackModal
          isOpen={routeModalState.isOpen}
          onClose={() =>
            setRouteModalState((prev) => ({ ...prev, isOpen: false }))
          }
          userId={routeModalState.userId}
          userName={routeModalState.userName}
        />
      )}
    </div>
  );
}
