'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  Camera,
  Maximize,
  EyeOff,
  RefreshCcw,
  Calendar,
  Video,
  Search,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ControlGroupProps {
  children: React.ReactNode;
  className?: string;
}

const ControlGroup = ({ children, className }: ControlGroupProps) => (
  <div className={cn('flex items-center bg-gray-100 rounded p-1', className)}>{children}</div>
);

const IconButton = ({
  icon: Icon,
  active = false,
  danger = false,
  className,
}: {
  icon: any;
  active?: boolean;
  danger?: boolean;
  className?: string;
}) => (
  <button
    className={cn(
      'p-1.5 rounded transition-all flex items-center justify-center',
      active
        ? 'bg-white text-primary shadow-sm'
        : 'text-gray-500 hover:bg-white/50 hover:text-gray-700',
      danger && 'hover:text-red-500',
      className,
    )}
  >
    <Icon size={14} />
  </button>
);

export default function ControllBtn() {
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

      {/* Search Display */}
      <div className="flex-1 flex items-center bg-gray-100 rounded px-3 py-1.5 gap-2 max-w-xs">
        <Search size={14} className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm Object Tag"
          className="bg-transparent border-none text-[11px] placeholder:text-gray-400 focus:outline-none w-full"
        />
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded border border-blue-100 whitespace-nowrap">
          Local (Cục bộ)
        </span>
      </div>

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

      {/* Screen Select */}
      <ControlGroup className="pr-2">
        <select
          className="bg-transparent border-none text-[10px] font-bold text-gray-600 focus:outline-none cursor-pointer pl-2 pr-1 h-6"
          defaultValue="screen1"
        >
          <option value="screen1">Màn hình 1</option>
          <option value="screen2">Màn hình 2</option>
          <option value="screen3">Màn hình 3</option>
          <option value="screen4">Màn hình 4</option>
        </select>
      </ControlGroup>
    </div>
  );
}
