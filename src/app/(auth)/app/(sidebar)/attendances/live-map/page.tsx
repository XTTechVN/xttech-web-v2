'use client';

import { useEffect, useRef, useState } from 'react';
import { getLiveLocations } from '@/actions';
import { StaffLiveLocation } from '@/types';
import { BASE_WS_URL } from '@/config';
import { LiveMap } from './_components/live-map';
import { StaffList } from './_components/staff-list';
import { RoutePlaybackModal } from './_components/route-playback-modal';
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
      console.log("data: ", data)
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
          const rawData = payload.data;
          const targetUserId: string = rawData.userId || rawData.user_id;
          if (!targetUserId) return;

          const updatedStaff: StaffLiveLocation = {
            ...rawData,
            userId: targetUserId,
            userName: rawData.userName || rawData.user_name || 'Nhân viên',
            avatar: rawData.avatar,
            departmentName: rawData.departmentName || rawData.department_name,
            positionName: rawData.positionName || rawData.position_name,
            attendanceId: rawData.attendanceId ?? rawData.attendance_id,
            batteryLevel: rawData.batteryLevel ?? rawData.battery_level,
            checkInTime: rawData.checkInTime || rawData.check_in_time,
            updatedAt: rawData.updatedAt || rawData.updated_at,
          };

          setStaffLocations((prev) => {
            const index = prev.findIndex(
              (s) => (s.userId || (s as any).user_id) === targetUserId
            );
            if (index >= 0) {
              const clone = [...prev];
              clone[index] = { ...clone[index], ...updatedStaff };
              return clone;
            } else {
              return [updatedStaff, ...prev];
            }
          });

          // Cập nhật selectedStaff nếu đang xem nhân viên này
          setSelectedStaff((current) => {
            const currentId = current?.userId || (current as any)?.user_id;
            return currentId === targetUserId
              ? { ...current, ...updatedStaff }
              : current;
          });
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
