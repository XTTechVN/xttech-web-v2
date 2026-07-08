'use client';

import {
  MonitorDisplay,
  ControlBar,
  TimelineRuler,
  DetectedObject,
  DetectedObjectModal,
} from './_components';
import ModalWrapper from '@/components/modal/ModalWrapper';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';

import api from '@/utils/api';
import { Event, Record } from '@/types/shared/event';
import { Camera } from '@/types/shared/camera';
import { ResponsePagination } from '@/types/shared/reponse';
import { DetectedObject as DetectedObjectProps } from './_components/display/DetectedObject';

export default function Page() {
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCam, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [seekSeconds, setSeekSeconds] = useState<number>(0);
  const [openDetail, setOpenDetail] = useState<boolean>(true);
  const [openDetectedObject, setOpenDetectedObject] = useState<DetectedObjectProps | null>(null);

  // Query Call API
  const {
    data: cameras,
    isLoading,
    error,
  } = useQuery<ResponsePagination<Camera>>({
    queryKey: ['cameras'],
    queryFn: () => api.get('/api/v1/cameras?limit=1000').then((res) => res.data),
  });

  useEffect(() => {
    if (cameras) {
      setSelectedCamera(cameras?.items?.[0]);
    }
  }, [cameras]);

  // Khi chọn event, tự động set videoId và seekSeconds
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    const videoId = event.record?.videoId ?? null;
    setSelectedVideoId(videoId);

    // Nếu là continuous record, tính offset để seek
    if (event.record?.type === 'continuous' && event.record.startTime) {
      const eventTime = new Date(event.createdAt).getTime();
      const startTime = new Date(event.record.startTime).getTime();
      const offset = Math.max(0, Math.floor((eventTime - startTime) / 1000));
      setSeekSeconds(offset);
    } else {
      setSeekSeconds(0);
    }
  };

  // Khi click trực tiếp lên khối record continuous trên timeline
  const handleSelectRecord = (record: Record, seek = 0) => {
    setSelectedVideoId(record.videoId ?? null);
    setSeekSeconds(seek);
    setSelectedEvent(null); // Clear event selection
  };

  // Handle Loading and Error
  if (isLoading) return null;
  if (error) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Top: Video Monitor & Detail Sidebar */}
      <div className="flex-1 p-4 flex flex-row min-h-0 gap-4 overflow-hidden">
        <MonitorDisplay
          videoId={selectedVideoId}
          seekSeconds={seekSeconds}
          onDetail={() => setOpenDetail((prev) => !prev)}
        />
        <AnimatePresence>
          {openDetail && (
            <DetectedObject
              event={selectedEvent}
              isOpen={openDetail}
              onClose={() => setOpenDetail(false)}
              onClick={(item: DetectedObjectProps) => setOpenDetectedObject(item)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Middle: Timeline Ruler */}
      <TimelineRuler
        camera={selectedCam}
        date={date}
        onSelectEvent={handleSelectEvent}
        onSelectRecord={handleSelectRecord}
      />

      {/* Bottom: Control Bar */}
      <ControlBar
        cameras={cameras?.items || []}
        selectedCamera={selectedCam}
        onSelectDate={(date: Date) => setDate(date)}
        onSelectCam={(cam: Camera) => setSelectedCamera(cam)}
      />

      <AnimatePresence>
        <ModalWrapper
          isOpen={openDetectedObject !== null}
          onClose={() => {
            setOpenDetectedObject(null);
          }}
        >
          <DetectedObjectModal
            event={selectedEvent || null}
            detectedObject={openDetectedObject || null}
          />
        </ModalWrapper>
      </AnimatePresence>
    </div>
  );
}
