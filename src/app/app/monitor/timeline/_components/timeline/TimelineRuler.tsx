'use client';

// Hooks
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
// Utils
import api from '@/utils/api';
import dayjs from 'dayjs';
// Types
import { Alert } from '@/types/shared/alert';
import { Camera } from '@/types/shared/camera';



interface TimelineRulerProps {
  camera: Camera | null;
  date: Date;
  onSelectEvent: (filename: string) => void;
}

export default function TimelineRuler({ camera, date, onSelectEvent }: TimelineRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hourWidth, setHourWidth] = useState(80);
  const totalWidth = 24 * hourWidth;
  const [now, setNow] = useState(dayjs());

  // Cập nhật lại thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lắng nghe sự kiện ctrl + wheel để zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.5;
        const delta = -e.deltaY * zoomFactor;
        setHourWidth((prev) => Math.min(Math.max(prev + delta, 40), 1000));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Call API get events
  const { data: events } = useQuery({
    queryKey: ['events', camera?.id, date],
    queryFn: () =>
      api
        .get(`/api/v1/cameras/${camera?.id}/events?date=${dayjs(date).format('YYYY-MM-DD')}`)
        .then((res) => res.data),
    enabled: !!camera?.id,
  });

  // Tạo mốc giờ
  const hours = Array.from({ length: 25 }, (_, i) => {
    const h = i < 10 ? `0${i}:00` : `${i}:00`;
    return h;
  });

  // Tính toán vị trí của con trỏ thời gian hiện tại
  const currentTimeInSeconds = now.hour() * 3600 + now.minute() * 60 + now.second();
  const pointerPosition = (currentTimeInSeconds / 86400) * totalWidth;

  return (
    <div className="bg-white border-t border-gray-200 h-32 relative overflow-hidden flex flex-col pt-2 shadow-sm">
      {/* Date Header */}
      <div className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex justify-between shrink-0">
        <span>{now.format('dddd D MMMM YYYY')}</span>
        <span>{now.add(1, 'day').format('dddd D MMMM YYYY')}</span>
      </div>

      {/* Timeline Container */}
      <div ref={containerRef} className="flex-1 relative overflow-x-auto no-scrollbar px-10 pt-8">
        <div className="relative h-full" style={{ width: `${totalWidth}px` }}>
          {/* Hour Grid Lines (Ticks) */}
          <div className="absolute inset-x-0 bottom-6 h-6 border-b border-gray-100">
            {hours.map((hour, i) => {
              const x = i * hourWidth;
              return (
                <div
                  key={i}
                  className="absolute bottom-0 flex flex-col items-center group"
                  style={{ left: `${x}px` }}
                >
                  {/* Tick Mark */}
                  <div className="h-6 w-px bg-gray-300 group-hover:bg-primary transition-colors" />

                  {/* Minute Markers (only between hours) */}
                  {i < 24 && (
                    <>
                      <div
                        className="absolute bottom-0 h-1 w-px bg-gray-100"
                        style={{ left: `${hourWidth * 0.25}px` }}
                      />
                      <div
                        className="absolute bottom-0 h-2 w-px bg-gray-200"
                        style={{ left: `${hourWidth * 0.5}px` }}
                      />
                      <div
                        className="absolute bottom-0 h-1 w-px bg-gray-100"
                        style={{ left: `${hourWidth * 0.75}px` }}
                      />
                    </>
                  )}

                  {/* Hour Label */}
                  <span className="absolute top-7 -translate-x-1/2 text-[10px] text-gray-500 font-medium select-none whitespace-nowrap">
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Events Layer */}
          <div className="absolute inset-0">
            {events?.items?.map((event: Alert) => {
              const eventTime = dayjs(event.createdAt);
              const eventSeconds =
                eventTime.hour() * 3600 + eventTime.minute() * 60 + eventTime.second();
              const position = (eventSeconds / 86400) * totalWidth;

              return (
                <div
                  key={event.id}
                  className="absolute top-[-20px] flex flex-col items-center group cursor-pointer z-20"
                  style={{ left: `${position}px` }}
                  onClick={() => {
                    onSelectEvent(event.id);
                  }}
                >
                  {/* Event Tooltip/Name */}
                  {/* <div className="absolute z-50 -top-6 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    {event.name} • {eventTime.format('HH:mm:ss')}
                  </div> */}

                  {/* Event Marker */}
                  {/* <div className="w-1.5 h-1.5 bg-blue-500 rounded-full border border-white ring-2 ring-blue-100 ring-offset-0 group-hover:scale-125 transition-transform" /> */}

                  {/* Vertical Line */}
                  <img
                    src={`http://157.66.100.182:9000/ai-data/thumbnail/${event.id}.jpg`}
                    className="aspect-video w-16"
                    alt=""
                  />
                  <div className="w-px h-14 bg-blue-400 opacity-20 group-hover:opacity-40 transition-opacity mt-0.5" />
                </div>
              );
            })}
          </div>

          {/* Current Time Pointer */}
          <div
            className="absolute top-0 bottom-6 w-px bg-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.5)] flex flex-col items-center transition-all duration-1000 ease-linear pointer-events-none"
            style={{ left: `${pointerPosition}px` }}
          >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -mt-1 shadow-md" />
            <div className="mt-auto mb-[-24px] bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
              {now.format('HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
