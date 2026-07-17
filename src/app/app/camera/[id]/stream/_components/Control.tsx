import { Camera } from '@/types/shared/camera';
import Ptz from './Ptz';

interface Props {
  camera: Camera;
}

// 'stopped' | 'streaming' | 'recording_continuous' | 'recording_event' | 'recording_continuous_event'
const MappingRecordingStatus = {
  recording_continuous: 'Đang ghi hình liên tục',
  recording_event: 'Đang ghi hình sự kiện',
  recording_continuous_event: 'Đang ghi liên tục + sự kiện',
  stopped: 'Dừng',
  streaming: 'Đang stream',
}

export default function Control({ camera }: Props) {
  return (
    <div className="bg-gray-100 rounded-lg h-full overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-4 bg-primary">
        <p className="text-white text-sm font-medium">{camera.name || camera.id}</p>
      </div>

      {/* Hiển thị thông tin chi tiết nếu ptz = false (không hỗ trợ ptz) */}
      {!camera.ptz && (
        <div className="px-4 text-black space-y-2">
        <p className="text-sm font-semibold">Thông tin chung</p>
        <div className="px-2 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Tên camera:</p>
            <p className="text-sm">{camera.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Socket:</p>
            <p className="text-sm">{camera.worker?.socket}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Port:</p>
            <p className="text-sm">{camera.worker?.port}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Cho phép PTZ:</p>
            <p className="text-sm">{camera.ptz ? 'Có' : 'Không'}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Trạng thái ghi hình:</p>
            <p className="text-sm">{MappingRecordingStatus[camera.status]}</p>
          </div>
          {/* Hiển thị worker */}
          {camera.worker && (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Worker:</p>
              <p className="text-sm">{camera.worker.name}</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Hiện nếu ptz = true (hỗ trợ ptz) */}
      {camera.ptz && (
        <Ptz camera={camera} />
      )}
    </div>
  );
}
