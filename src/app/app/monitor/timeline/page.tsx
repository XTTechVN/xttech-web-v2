'use client';

import {
  MonitorDisplay,
  ControlBar,
  TimelineRuler,
  DetectedObject,
  DetectedObjectModal,
} from './_components';
import ModalWrapper from '@/components/modal/ModalWrapper';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';

import api from '@/utils/api';
import { Alert } from '@/types/shared/alert';
import { Camera } from '@/types/shared/camera';
import { ResponsePagination } from '@/types/shared/reponse';
import { DetectedObject as DetectedObjectProps } from './_components/display/DetectedObject';

export default function Page() {
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCam, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Alert | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(true);
  const [openDetectedObject, setOpenDetectedObject] = useState<DetectedObjectProps | null>(null);

  // Query Call API
  const {
    data: cameras,
    isLoading,
    error,
  } = useQuery<ResponsePagination<Camera>>({
    queryKey: ['cameras'],
    queryFn: () => api.get('/api/v1/cameras').then((res) => res.data),
  });

  // Handle Loading and Error
  if (isLoading) return null;
  if (error) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Top: Video Monitor & Detail Sidebar */}
      <div className="flex-1 p-4 flex flex-row min-h-0 gap-4 overflow-hidden">
        <MonitorDisplay
          filename={selectedEvent?.id || ''}
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
      <TimelineRuler camera={selectedCam} date={date} onSelectEvent={setSelectedEvent} />

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
