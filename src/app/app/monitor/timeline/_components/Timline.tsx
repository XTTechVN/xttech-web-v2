'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export default function Timline() {
  const hours = Array.from({ length: 25 }, (_, i) => {
    const h = (8 + i) % 24;
    return h < 10 ? `0${h}:00` : `${h}:00`;
  });

  return (
    <div className="bg-white border-t border-gray-200 h-24 relative overflow-hidden flex flex-col pt-2 shadow-sm">
      {/* Date Header */}
      <div className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex justify-between">
        <span>Tue 31 March 2026</span>
        <span>Wed 1 April 2026</span>
      </div>

      {/* Timeline Ruler */}
      <div className="flex-1 relative overflow-x-auto no-scrollbar px-10">
        <div className="flex items-end h-full min-w-max pb-4">
          {hours.map((hour, i) => (
            <div
              key={i}
              className="flex flex-col items-center group relative"
              style={{ width: '80px' }}
            >
              {/* Hour Marker */}
              <div className="h-6 w-px bg-gray-300 group-hover:bg-primary transition-colors" />

              {/* Minute Markers (Mockup) */}
              <div className="absolute top-0 left-1/4 h-2 w-px bg-gray-200" />
              <div className="absolute top-0 left-1/2 h-4 w-px bg-gray-200" />
              <div className="absolute top-0 left-3/4 h-2 w-px bg-gray-200" />

              {/* Hour Label */}
              <span className="text-[10px] text-gray-500 font-medium mt-1 select-none">{hour}</span>

              {/* Event Indicators (Mockup) */}
              {i % 4 === 0 && (
                <div className="absolute -top-1 w-12 h-1 bg-blue-400 rounded-full opacity-60" />
              )}
            </div>
          ))}
        </div>

        {/* Current Time Pointer (Mockup) */}
        <div className="absolute left-1/2 top-0 bottom-6 w-px bg-red-500 z-10 shadow-[0_0_8px_rgba(239,68,68,0.5)] flex flex-col items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 shadow-sm" />
          <div className="mt-auto mb-[-20px] bg-red-500 text-white text-[9px] px-1 rounded font-bold">
            23:25:14
          </div>
        </div>
      </div>
    </div>
  );
}
