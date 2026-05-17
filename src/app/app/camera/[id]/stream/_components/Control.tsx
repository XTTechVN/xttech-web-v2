import { Camera } from '@/types/shared/camera';
import Ptz from './Ptz';

interface Props {
  camera: Camera;
}

export default function Control({ camera }: Props) {
  return (
    <div className="bg-gray-100 rounded-lg h-full overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-4 bg-primary">
        <p className="text-white text-sm font-medium">{camera.name || camera.id}</p>
      </div>

      {/* Camera info */}
      {/* <div className="px-4 text-black space-y-2">
        <p className="text-sm font-semibold">Thông tin chung</p>
        <div className="px-2 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Tên camera:</p>
            <p className="text-sm font-medium">{camera.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">IP:</p>
            <p className="text-sm font-medium">{camera.worker?.ip}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Port:</p>
            <p className="text-sm font-medium">{camera.worker?.port}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Cho phép PTZ:</p>
            <p className="text-sm font-medium">{camera.onvif ? 'Có' : 'Không'}</p>
          </div>
        </div>
      </div> */}

      {/* Camera actions, onvif */}
      <Ptz camera={camera} />
    </div>
  );
}
