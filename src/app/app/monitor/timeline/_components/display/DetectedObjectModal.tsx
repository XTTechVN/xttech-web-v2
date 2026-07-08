import { Record } from '@/types/shared/event';
import { DetectedObject as DetectedObjectProps } from './DetectedObject';
import dayjs from 'dayjs';
import { Camera, Tag, Clock, Hash, MapPin, Cpu } from 'lucide-react';

interface DetectedObjectModalProps {
  record: Record | null;
  detectedObject: DetectedObjectProps | null;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

function InfoRow({ icon, label, value, className = '' }: InfoRowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 min-w-[120px] text-gray-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default function DetectedObjectModal({ record, detectedObject }: DetectedObjectModalProps) {
  if (!record || !detectedObject) return null;

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết đối tượng</h2>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Middle: 2-column layout */}
          <div className="flex items-start gap-5">
            {/* Thông tin đối tượng */}
            <div className="bg-white space-y-3 ">
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="Mã đối tượng"
                value={detectedObject.id.slice(0, 16) + '...'}
              />
              <InfoRow
                icon={<Tag className="w-4 h-4" />}
                label="Video ID"
                value={detectedObject.videoId}
              />
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label="Thời gian"
                value={dayjs(detectedObject.createdAt).format('HH:mm:ss DD/MM')}
              />
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 min-w-[90px] text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Mô tả</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 leading-relaxed">
                  {detectedObject.detectionResult || 'Không có mô tả chi tiết'}
                </span>
              </div>
              {detectedObject.rawPlate && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center gap-3">
                  <Hash className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-yellow-600 font-medium">Biển số</p>
                    <p className="text-base font-bold text-yellow-800">{detectedObject.rawPlate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hình ảnh */}
            {detectedObject.rawPlate && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 h-[180px]">
                <img
                  src={`http://157.66.100.182:9000/ai-data/thumbnail/${record.id}/license_plates/${detectedObject.id}.jpg`}
                  alt={`Biển số ${detectedObject.label}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs text-white/80">
                    {dayjs(detectedObject.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            )}
            {!detectedObject.rawPlate && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 h-[180px]">
                <img
                  src={`http://157.66.100.182:9000/ai-data/thumbnail/${record.thumbnailId}`}
                  alt={`Xe ${detectedObject.label}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs text-white/80">
                    {dayjs(detectedObject.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
