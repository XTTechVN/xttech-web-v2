'use client';

import { useEffect, useRef, useState } from 'react';
import { getLiveLocations } from '@/actions';
import { StaffLiveLocation } from '@/types';
import { BASE_WS_URL, BASE_MINIO_URL } from '@/config';
import { LiveMap } from './_components/live-map';
import { StaffList } from './_components/staff-list';
import { RoutePlaybackModal } from './_components/route-playback-modal';
import toast from 'react-hot-toast';
import { Users, X, Route } from 'lucide-react';

export default function AttendanceLiveMapPage() {
  const [staffLocations, setStaffLocations] = useState<StaffLiveLocation[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffLiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isMobileStaffListOpen, setIsMobileStaffListOpen] = useState(false);

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
      {/* Main Content: Sidebar List (Desktop) + Map View (Full screen on mobile) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 relative">
        {/* 1. Danh sách nhân viên trên Desktop (ẩn trên mobile) */}
        <div className="hidden md:block w-80 lg:w-96 shrink-0 h-full">
          <StaffList
            staffLocations={staffLocations}
            selectedStaff={selectedStaff}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
            onViewRoute={handleOpenRoute}
            isLoading={isLoading}
          />
        </div>

        {/* 2. Bản đồ trực tiếp (Toàn màn hình trên Mobile) */}
        <div className="flex-1 h-full min-h-[350px] relative z-0 isolate rounded-2xl overflow-hidden">
          <LiveMap
            staffLocations={staffLocations}
            selectedStaff={selectedStaff}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
            onViewRoute={handleOpenRoute}
          />

          {/* Nút nổi mở danh sách trên Mobile (Floating Pill) */}
          <div className="md:hidden absolute top-3 left-3 z-[900]">
            <button
              type="button"
              onClick={() => setIsMobileStaffListOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md text-slate-800 font-bold text-xs rounded-full shadow-lg border border-slate-200/90 hover:bg-white active:scale-95 transition-all cursor-pointer select-none"
            >
              <div className="ml-5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users size={12} />
              </div>
              <span>Nhân sự trực tuyến ({staffLocations.length})</span>
            </button>
          </div>

          {/* Floating Selected Staff Card mini ở đáy trên Mobile khi chọn nhân viên */}
          {selectedStaff && (
            <div className="md:hidden absolute bottom-3 inset-x-3 z-[900] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200 flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-200">
              <div
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                onClick={() => handleOpenRoute(selectedStaff)}
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
                  {selectedStaff.avatar ? (
                    <img
                      src={BASE_MINIO_URL + selectedStaff.avatar}
                      alt={selectedStaff.userName || 'Nhân viên'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedStaff.userName || 'N').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {selectedStaff.userName || 'Nhân viên'}
                    </h4>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                        selectedStaff.status === 'offline'
                          ? 'bg-slate-100 text-slate-500'
                          : selectedStaff.status === 'moving'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {selectedStaff.status === 'offline'
                        ? 'Ngoại tuyến'
                        : selectedStaff.status === 'moving'
                        ? 'Di chuyển'
                        : 'Đứng yên'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {selectedStaff.positionName || selectedStaff.departmentName || 'Nhân viên'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenRoute(selectedStaff)}
                  className="px-2.5 py-1.5 bg-primary text-white text-[11px] font-semibold rounded-xl hover:bg-primary/90 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Route size={12} />
                  <span>Lộ trình</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Sheet danh sách nhân sự trên Mobile */}
      {isMobileStaffListOpen && (
        <div className="fixed inset-0 z-[1100] md:hidden flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setIsMobileStaffListOpen(false)}
          />
          <div className="w-full max-h-[82vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Handle bar & Close */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-100 shrink-0">
              <div className="flex-1" />
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
              <div className="flex-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMobileStaffListOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <StaffList
                staffLocations={staffLocations}
                selectedStaff={selectedStaff}
                onSelectStaff={(staff) => {
                  setSelectedStaff(staff);
                  setIsMobileStaffListOpen(false);
                }}
                onViewRoute={(staff) => {
                  setIsMobileStaffListOpen(false);
                  handleOpenRoute(staff);
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

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
