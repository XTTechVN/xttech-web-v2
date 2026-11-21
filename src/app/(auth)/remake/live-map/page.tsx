'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getStaffRoute } from '@/actions';
import { useCan } from '@/hooks';
import { isStaffSignalLost, type StaffLiveLocation } from '@/types';
import { cn } from '@/utils/cn';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { MapControls } from './_components/map-controls';
import { RoutePanel, type RouteView } from './_components/route-panel';
import { StaffSheet } from './_components/staff-sheet';
import { StaffStrip } from './_components/staff-strip';
import { useLiveStaff } from './_components/use-live-staff';

const StaffMap = dynamic(() => import('./_components/staff-map'), { ssr: false, loading: () => <div className="size-full bg-rm-bg" /> });

const FILTERS = [
  { v: 'all', label: 'Tất cả', test: () => true },
  { v: 'moving', label: 'Di chuyển', test: (p: StaffLiveLocation) => p.status === 'moving' },
  { v: 'still', label: 'Đứng yên', test: (p: StaffLiveLocation) => p.status === 'stationary' },
  { v: 'lost', label: 'Mất tín hiệu', test: (p: StaffLiveLocation) => isStaffSignalLost(p.status) },
];

// Bản đồ là chính: nhân sự là dải thẻ nổi ở đáy (điện thoại) hoặc cột phải (1280px). Realtime qua WebSocket.
function LiveMap() {
  const [selId, setSelId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [follow, setFollow] = useState(true);
  const [satellite, setSatellite] = useState(false);
  const [full, setFull] = useState(false);
  const [filter, setFilter] = useState('all');
  const [routeView, setRouteView] = useState<RouteView | null>(null);
  const { data, isLoading, isError, isFetching, refetch, live } = useLiveStaff();
  const all = data ?? [];
  const test = FILTERS.find((f) => f.v === filter)!.test;
  const items = all.filter(test);
  const open = all.find((p) => p.userId === selId) ?? null;

  const route = useQuery({
    queryKey: ['staff-route', routeView?.staff.userId, routeView?.date, routeView?.shiftOnly],
    queryFn: () => getStaffRoute(routeView!.staff.userId, routeView!.date, routeView!.shiftOnly ? routeView!.staff.attendanceId : undefined),
    enabled: !!routeView,
  });
  // bỏ điểm sai số lớn (>50 m) cho đường đỡ nhiễu
  const line = (route.data?.points ?? [])
    .filter((p) => p.accuracy == null || p.accuracy <= 50)
    .map((p) => [p.latitude, p.longitude] as [number, number]);
  const status = route.isLoading ? 'loading' : route.isError ? 'error' : line.length < 2 ? 'empty' : 'ready';

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [full]);

  const pick = (p: StaffLiveLocation) => {
    setSelId(p.userId);
    setSheet(true);
  };
  const openRoute = (p: StaffLiveLocation) => {
    setRouteView({ staff: p, date: new Date().toLocaleDateString('sv-SE'), shiftOnly: !!p.attendanceId });
    setSheet(false);
  };

  return (
    <>
      <PageHeader title="Bản đồ trực tiếp" description="Nhân viên đang chấm công ngoài công trình." />

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được vị trí" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Lọc theo trạng thái"
              className="-mx-rm-gutter flex min-w-0 flex-1 gap-2 overflow-x-auto px-rm-gutter md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {FILTERS.map((f) => {
                const n = all.filter(f.test).length;
                if (f.v !== 'all' && f.v !== filter && n === 0) return null;
                return (
                  <button
                    key={f.v}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.v}
                    onClick={() => setFilter(f.v)}
                    className={cn(
                      'h-10 flex-none rounded-rm border px-3 text-sm font-medium active:scale-95',
                      filter === f.v ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line bg-rm-surface text-rm-muted',
                    )}
                  >
                    {f.label} · {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              'isolate',
              full
                ? 'fixed inset-0 z-45 bg-rm-bg xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:gap-4 xl:p-4'
                : 'relative h-[calc(100dvh-17rem)] min-h-[22rem] xl:grid xl:h-[calc(100dvh-11rem)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:gap-4',
            )}
          >
            <div
              className={cn(
                'relative h-full overflow-hidden border border-rm-line [&_.leaflet-control-zoom]:hidden xl:[&_.leaflet-control-zoom]:block',
                full ? 'xl:rounded-rm-xl' : 'rounded-rm-xl',
              )}
            >
              <StaffMap items={items} selected={open} route={line} follow={follow} satellite={satellite} onSelect={pick} />
              <span className="absolute left-2 top-2 z-1000 flex items-center gap-1.5 rounded-rm border border-rm-line bg-rm-surface px-2 py-1 text-xs text-rm-muted shadow-sm xl:left-14">
                <span className={cn('size-2 rounded-full', live ? 'bg-rm-success' : 'bg-rm-warning')} aria-hidden="true" />
                {live ? 'Trực tiếp' : 'Cập nhật 15 giây'}
              </span>
              <MapControls
                full={full}
                satellite={satellite}
                follow={follow}
                canFollow={!!open}
                fetching={isFetching}
                onFull={() => setFull((v) => !v)}
                onSatellite={() => setSatellite((v) => !v)}
                onFollow={() => setFollow((v) => !v)}
                onRefresh={() => refetch()}
              />
            </div>
            <div className="absolute inset-x-2 bottom-2 z-1000 xl:static xl:min-h-0 xl:overflow-y-auto">
              {routeView ? (
                <RoutePanel
                  view={routeView}
                  onChange={setRouteView}
                  onClose={() => setRouteView(null)}
                  status={status}
                  points={line.length}
                  km={route.data?.totalDistanceKm ?? route.data?.total_distance_km}
                />
              ) : all.length === 0 ? (
                <EmptyState title="Chưa có ai đang chấm công" description="Ai check-in sẽ hiện trên bản đồ ngay." />
              ) : (
                <StaffStrip items={items} selId={selId} onPick={pick} />
              )}
            </div>
          </div>
        </>
      )}

      <StaffSheet staff={open} open={sheet} onClose={() => setSheet(false)} onRoute={openRoute} />
    </>
  );
}

// Không có quyền thì không mở WebSocket, không gọi API.
export default function RemakeLiveMapPage() {
  const { can, isReady } = useCan();
  if (!isReady) return <ListSkeleton />;
  if (!can('live_map:read')) {
    return (
      <>
        <PageHeader title="Bản đồ trực tiếp" description="Nhân viên đang chấm công ngoài công trình." />
        <EmptyState title="Bạn chưa có quyền xem bản đồ" description="Liên hệ quản trị viên để được cấp quyền." />
      </>
    );
  }
  return <LiveMap />;
}
