import { Alert } from '@/types/shared/alert';
import { DetectedObject as DetectedObjectProps } from './DetectedObject';
import dayjs from 'dayjs';
import { Camera, Tag, Clock, Hash, MapPin, Cpu } from 'lucide-react';

interface DetectedObjectModalProps {
  event: Alert | null;
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

export default function DetectedObjectModal({ event, detectedObject }: DetectedObjectModalProps) {
  if (!event || !detectedObject) return null;

  const confidenceColor =
    detectedObject.confidenceScore >= 90
      ? 'text-green-600 bg-green-50 border-green-100'
      : detectedObject.confidenceScore >= 70
        ? 'text-yellow-600 bg-yellow-50 border-yellow-100'
        : 'text-red-600 bg-red-50 border-red-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết đối tượng</h2>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Middle: 2-column layout */}
          <div className="grid grid-cols-2 gap-5">
            {/* Left: Thông tin nhãn + Sự kiện */}
            <div className="space-y-3">
              {/* Nhãn */}
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary/70 font-medium mb-0.5">Nhãn phát hiện</p>
                    <p className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                      {detectedObject.label}
                    </p>
                  </div>
                  <div className={`ml-auto px-3 py-1 rounded-lg text-sm font-bold border ${confidenceColor}`}>
                    {detectedObject.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Thông tin sự kiện */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Thông tin sự kiện
                </h3>
                <InfoRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Mã sự kiện"
                  value={event.id.slice(0, 16) + '...'}
                />
                <InfoRow icon={<Tag className="w-4 h-4" />} label="Tên sự kiện" value={event.name} />
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Bắt đầu"
                  value={dayjs(event.createdAt).format('HH:mm:ss DD/MM')}
                />
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Cập nhật"
                  value={dayjs(event.updatedAt).format('HH:mm:ss DD/MM')}
                />
                <InfoRow
                  icon={<Camera className="w-4 h-4" />}
                  label="Camera ID"
                  value={event.cameraId}
                />
                <InfoRow
                  icon={<Cpu className="w-4 h-4" />}
                  label="AI Level"
                  value={`Level ${event.aiProcessedLevel}`}
                />
              </div>
            </div>

            {/* Right: Thông tin đối tượng + Hình ảnh */}
            <div className="space-y-3">
              {/* Thông tin đối tượng */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Kết quả phát hiện
                </h3>
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
              <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 h-[180px]">
                <img
                  src={`http://157.66.100.182:9000/ai-data/detection_results/${event.id}/license_plates/${detectedObject.id}.jpg`}
                  alt={`Biển số ${detectedObject.label}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs text-white/80">
                    {dayjs(detectedObject.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
