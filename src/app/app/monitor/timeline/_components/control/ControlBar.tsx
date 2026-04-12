'use client';

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  Maximize,
  EyeOff,
  RefreshCcw,
  Calendar,
  Video,
} from 'lucide-react';

// Components
import { IconButton } from './IconButton';
import { ControlGroup } from './ControlGroup';
import { DatePicker } from 'antd';

// Utils
import { cn } from '@/utils/cn';

// Types
import { Camera as CameraType } from '@/types/shared/camera';
import dayjs from 'dayjs';

interface ControlBarProps {
  cameras: CameraType[];
  selectedCamera: CameraType | null;

  onSelectDate: (date: Date) => void;
  onSelectCam: (cam: CameraType) => void;
}

export default function ControlBar({
  cameras,
  onSelectCam,
  selectedCamera,
  onSelectDate,
}: ControlBarProps) {
  return (
    <div className="bg-white border-y border-gray-200 py-2 px-4 flex items-center gap-3 overflow-x-auto no-scrollbar shadow-sm">
      {/* Playback Controls */}
      <ControlGroup>
        <IconButton icon={ChevronLeft} />
        <IconButton icon={RotateCcw} />
        <IconButton icon={Play} active />
        <IconButton icon={Pause} />
        <IconButton icon={FastForward} />
        <IconButton icon={ChevronRight} />
      </ControlGroup>

      {/* Speed Controls */}
      <ControlGroup>
        {['x1', 'x2', 'x5'].map((speed) => (
          <button
            key={speed}
            className={cn(
              'px-2 py-1 text-[10px] font-bold rounded transition-all',
              speed === 'x1'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {speed}
          </button>
        ))}
      </ControlGroup>

      {/* Scale Controls */}
      <ControlGroup>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded transition-all',
              num === 1 ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {num}
          </button>
        ))}
      </ControlGroup>

      {/* Action Icons */}
      <ControlGroup>
        <IconButton icon={Maximize} />
        <IconButton icon={RefreshCcw} />
        <IconButton icon={Video} active />
        <IconButton icon={Download} />
        <IconButton icon={EyeOff} />
        <IconButton icon={RefreshCcw} />
        <IconButton icon={Calendar} className="text-blue-500" />
        <IconButton icon={Video} className="text-blue-500" />
      </ControlGroup>

      {/* Date */}
      <ControlGroup className="pr-2">
        <DatePicker
          placeholder="Chọn ngày"
          size="small"
          defaultValue={dayjs(new Date())}
          disabledDate={(current) => current.isAfter(dayjs())}
          onChange={(date) => {
            console.log(date?.toDate());
            onSelectDate(date?.toDate() || new Date());
          }}
        />
      </ControlGroup>

      {/* Screen Select */}
      <ControlGroup className="pr-2">
        <select
          value={selectedCamera?.id || ''}
          onChange={(e) => {
            const cam = cameras.find((c) => c.id === e.target.value);
            if (cam) onSelectCam(cam);
          }}
          className="bg-transparent border-none text-[10px] font-bold text-gray-600 focus:outline-none cursor-pointer pl-2 pr-1 h-6"
        >
          <option value="" disabled>
            Chọn Camera
          </option>
          {cameras?.map((camera: CameraType) => (
            <option key={camera.id} value={camera.id}>
              {camera.name}
            </option>
          ))}
        </select>
      </ControlGroup>
    </div>
  );
}
