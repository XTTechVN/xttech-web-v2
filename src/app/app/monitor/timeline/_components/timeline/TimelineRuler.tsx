'use client';

// Hooks
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
// Utils
import api from '@/utils/api';
import dayjs from 'dayjs';
import { MEDIA_BASE_URL } from '@/config/app';
// Types
import { Record } from '@/types/shared/event';
import { Camera } from '@/types/shared/camera';

interface TimelineRulerProps {
  camera: Camera | null;
  date: Date;
  onSelectRecord: (record: Record, seekSeconds?: number) => void;
}

export default function TimelineRuler({ camera, date, onSelectRecord }: TimelineRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hourWidth, setHourWidth] = useState(80);
  const totalWidth = 24 * hourWidth;
  const [now, setNow] = useState(dayjs());

  // Fetch all records for the day (both continuous and event)
  const { data: records } = useQuery({
    queryKey: ['timeline-records', camera?.id, date],
    queryFn: () => {
      const start_date = dayjs(date).startOf('day').toISOString();
      const end_date = dayjs(date).endOf('day').toISOString();
      return api
        .get(
          `/api/v1/cameras/${camera?.id}/records?limit=9999&startDate=${start_date}&endDate=${end_date}`,
        )
        .then((res) => res.data);
    },
    enabled: !!camera?.id,
  });

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

  // Chọn record event mới nhất theo sort hoặc record đầu tiên
  useEffect(() => {
    if (records?.items?.[0]) {
      onSelectRecord(records.items[0], 0);
    }
  }, [records]);

  // Tự động scroll đến vị trí thời gian hiện tại khi load trang
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const timer = setTimeout(() => {
        const containerWidth = container.clientWidth;
        const scrollAmount = pointerPosition + 40 - containerWidth / 2;
        container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tạo mốc giờ
  const hours = Array.from({ length: 25 }, (_, i) => {
    const h = i < 10 ? `0${i}:00` : `${i}:00`;
    return h;
  });

  // Tính toán vị trí của con trỏ thời gian hiện tại
  const currentTimeInSeconds = now.hour() * 3600 + now.minute() * 60 + now.second();
  const pointerPosition = (currentTimeInSeconds / 86400) * totalWidth;

  // Helper tính vị trí pixel từ datetime
  const getPosition = (isoTime: string) => {
    const t = dayjs(isoTime);
    const seconds = t.hour() * 3600 + t.minute() * 60 + t.second();
    return (seconds / 86400) * totalWidth;
  };

  // Helper tính chiều rộng của một record segment
  const getRecordWidth = (record: Record) => {
    const startSeconds =
      dayjs(record.startTime).hour() * 3600 +
      dayjs(record.startTime).minute() * 60 +
      dayjs(record.startTime).second();
    const endSeconds =
      dayjs(record.endTime).hour() * 3600 +
      dayjs(record.endTime).minute() * 60 +
      dayjs(record.endTime).second();
    return Math.max(2, ((endSeconds - startSeconds) / 86400) * totalWidth);
  };

  const continuousRecords = records?.items?.filter((r: Record) => r.type === 'continuous') || [];
  const eventRecords = records?.items?.filter((r: Record) => r.type === 'event') || [];

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
                  <div className="h-6 w-px bg-gray-300 group-hover:bg-primary transition-colors" />
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
                  <span className="absolute top-7 -translate-x-1/2 text-[10px] text-gray-500 font-medium select-none whitespace-nowrap">
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Layer 1: Record Segments (Continuous) — Thanh nền xanh */}
          <div className="absolute bottom-6 left-0 right-0 h-2">
            {continuousRecords.map((record: Record) => {
              const left = getPosition(record.startTime);
              const width = getRecordWidth(record);
              return (
                <div
                  key={record.id}
                  title={`${record.name} | ${dayjs(record.startTime).format('HH:mm')} — ${dayjs(record.endTime).format('HH:mm')}`}
                  className="absolute top-0 h-full bg-blue-200 hover:bg-blue-400 rounded-sm cursor-pointer transition-colors opacity-70"
                  style={{ left: `${left}px`, width: `${width}px` }}
                  onClick={() => {
                    onSelectRecord(record, 0);
                  }}
                />
              );
            })}
          </div>

          {/* Layer 2: Event Records — Thumbnail + đường kẻ dọc */}
          <div className="absolute inset-0">
            {eventRecords.map((record: Record) => {
              const position = getPosition(record.startTime);
              const thumbnailSrc = record.thumbnailId
                ? `${MEDIA_BASE_URL}/ai-data/${record.thumbnailId}`
                : null;

              return (
                <div
                  key={record.id}
                  className="absolute top-[-20px] flex flex-col items-start group cursor-pointer z-20"
                  style={{ left: `${position}px` }}
                  onClick={() => {
                    // Tìm xem sự kiện này có rơi vào file continuous nào đang lưu không
                    const parentContinuous = continuousRecords.find((c: Record) => {
                      const eventTime = dayjs(record.startTime);
                      const cStart = dayjs(c.startTime);
                      const cEnd = dayjs(c.endTime);
                      return (
                        (eventTime.isAfter(cStart) || eventTime.isSame(cStart)) &&
                        eventTime.isBefore(cEnd)
                      );
                    });

                    if (parentContinuous) {
                      const seekSeconds = dayjs(record.startTime).diff(
                        dayjs(parentContinuous.startTime),
                        'second',
                      );
                      onSelectRecord(parentContinuous, seekSeconds);
                    } else {
                      onSelectRecord(record, 0);
                    }
                  }}
                >
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      className="aspect-video w-16 rounded-sm border border-blue-200 shadow-sm"
                      alt=""
                    />
                  ) : (
                    <div className="aspect-video w-16 bg-gray-100 rounded-sm flex items-center justify-center">
                      <span className="text-[8px] text-gray-400">No img</span>
                    </div>
                  )}
                  <div className="w-px h-14 bg-blue-400 opacity-20 group-hover:opacity-60 transition-opacity" />
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
