'use client';

import { MonitorDisplay, ControlBar, TimelineRuler } from './_components';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/utils/api';

import { ResponsePagination } from '@/types/shared/reponse';
import { Camera } from '@/types/shared/camera';

export default function Page() {
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCam, setSelectedCamera] = useState<Camera | null>(null);
  const [filename, setFilename] = useState<string>('');

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
      {/* Top: Video Monitor */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <MonitorDisplay filename={filename} />
      </div>

      {/* Middle: Timeline Ruler */}
      <TimelineRuler camera={selectedCam} date={date} onSelectEvent={setFilename} />

      {/* Bottom: Control Bar */}
      <ControlBar
        cameras={cameras?.items || []}
        selectedCamera={selectedCam}
        onSelectDate={(date: Date) => setDate(date)}
        onSelectCam={(cam: Camera) => setSelectedCamera(cam)}
      />
    </div>
  );
}
