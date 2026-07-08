'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { Event } from '@/types/shared/event';
import { motion } from 'motion/react';
import { X, Info, Tag } from 'lucide-react';
import dayjs from 'dayjs';
import Search from '@/components/ui/Search';

export interface DetectedObject {
  id: string;
  videoId: string;
  label: string;
  confidenceScore: number;
  detectionResult: string;
  rawPlate: string | null;
  extraData: Record<string, any>;
  createdAt: string;
}

interface DetectedObjectProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onClick: (event: DetectedObject) => void;
}

export default function DetectedObject({ event, isOpen, onClose, onClick }: DetectedObjectProps) {
  // Fetch detected objects
  const { data: detections, isLoading } = useQuery({
    queryKey: ['detected-objects', event?.record?.videoId],
    queryFn: () =>
      api
        .get(`/api/v1/detected-objects?offset=0&limit=100&videoId=${event?.record?.videoId}`)
        .then((res) => res.data),
    enabled: !!event?.record?.videoId && isOpen,
  });

  console.log(event)

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 h-full bg-gray-100 border border-gray-200 flex flex-col z-10 rounded-xl shadow-md"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] text-gray-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : detections?.items?.length > 0 ? (
          detections.items.map((item: DetectedObject) => (
            <div
              key={item.id}
              onClick={() => onClick(item)}
              className="group cursor-pointer relative p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative space-y-2.5">
                {/* Label & Confidence */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Label */}
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    {/* Confidence */}
                    <div className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100">
                      {item.confidenceScore}%
                    </div>
                  </div>
                  {/* License Plate Image */}
                  <div
                    style={{
                      backgroundImage: `url(http://157.66.100.182:9000/ai-data/detection_results/${event?.id}/license_plates/${item.id}.jpg)`
                    }}
                    className="w-10 h-10 rounded-md bg-cover bg-center justify-end items-end">
                  </div>
                </div>

                {/* Result */}
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-gray-300 mt-0.5" />
                  <p className="text-xs text-gray-600 ">
                    {item.detectionResult || 'Không có mô tả chi tiết'}
                  </p>
                </div>

                {/* Meta */}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[9px] text-gray-400">
                  <span>{dayjs(item.createdAt).format('HH:mm:ss')}</span>
                  <span className="font-medium text-gray-300">#{item.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Search size="sm" className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Không tìm thấy đối tượng nào</p>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      {event && (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Thời gian sự kiện:</span>
              <span className="text-gray-700 font-bold">
                {dayjs(event.createdAt).format('HH:mm:ss DD/MM')}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
