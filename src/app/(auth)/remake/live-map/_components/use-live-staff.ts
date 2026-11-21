'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLiveLocations } from '@/actions';
import { BASE_WS_URL } from '@/config';
import { useAuthStore } from '@/stores';
import type { StaffLiveLocation } from '@/types';

const KEY = ['live-locations'];

// Bản realtime thiếu pin/chẩn đoán thì giữ giá trị đã biết.
const merge = (old: StaffLiveLocation | undefined, next: StaffLiveLocation): StaffLiveLocation => ({
  ...old,
  ...next,
  batteryLevel: next.batteryLevel ?? old?.batteryLevel,
  diagnostics: next.diagnostics ?? old?.diagnostics,
});

// Danh sách đang chấm công: tải 1 lần, WebSocket đẩy vị trí / check-out vào cache; mất kết nối thì quay về hỏi lại 15 giây.
export function useLiveStaff() {
  const qc = useQueryClient();
  const [live, setLive] = useState(false);
  const token = useAuthStore((s) => s.accessToken);
  const query = useQuery({ queryKey: KEY, queryFn: getLiveLocations, refetchInterval: live ? 60_000 : 15_000 });

  useEffect(() => {
    if (!token) return;
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let ping: ReturnType<typeof setInterval> | undefined;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`${BASE_WS_URL}/api/v1/ws/live-tracking?token=${encodeURIComponent(token)}`);
      ws.onopen = () => {
        setLive(true);
        ping = setInterval(() => ws?.readyState === WebSocket.OPEN && ws.send('ping'), 25_000);
      };
      ws.onmessage = (e) => {
        if (e.data === 'pong') return;
        try {
          const msg = JSON.parse(e.data) as { type: string; data?: StaffLiveLocation };
          const d = msg.data;
          if (!d?.userId) return;
          if (msg.type === 'STAFF_LOCATION_UPDATE') {
            qc.setQueryData<StaffLiveLocation[]>(KEY, (list = []) => {
              const i = list.findIndex((p) => p.userId === d.userId);
              if (i < 0) return [merge(undefined, { ...d, userName: d.userName || 'Nhân viên' }), ...list];
              return list.map((p, j) => (j === i ? merge(p, d) : p));
            });
          } else if (msg.type === 'STAFF_CHECKOUT') {
            qc.setQueryData<StaffLiveLocation[]>(KEY, (list = []) => list.filter((p) => p.userId !== d.userId));
          }
        } catch {
          // tin nhắn lạ: bỏ qua
        }
      };
      ws.onclose = () => {
        setLive(false);
        clearInterval(ping);
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      clearInterval(ping);
      ws?.close();
    };
  }, [qc, token]);

  return { ...query, live };
}
