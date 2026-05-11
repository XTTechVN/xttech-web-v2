'use client';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import { X } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

import { Camera } from '@/types/shared/camera';

import useMonitorStore from '@/stores/useMonitorStore';

export default function InsertCameraModal() {
  const { monitor, gridKey, setIsAdding, updateMonitorGrid } = useMonitorStore();

  if (!monitor || !gridKey) return null;

  const {
    data: cameras,
    isLoading: isLoadingCameras,
    isError,
  } = useQuery<Camera[]>({
    queryKey: ['cameras-insert'],
    queryFn: () => api.get('/api/v1/cameras?limit=100&offset=0').then((res: any) => res.data.items),
  });

  // handle error
  if (isError) {
    return (
      <div className="flex items-center justify-center">
        <Heading>Đã có lỗi xảy ra khi tải danh sách worker</Heading>
        <SubHeading>Vui lòng thử lại sau</SubHeading>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-xl h-fit max-h-[90vh] transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <Heading>Thêm camera</Heading>
            <SubHeading>Chọn camera mà bạn muốn thêm vào ô trống trên màn hình</SubHeading>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="rounded-full hover:bg-transparent"
          >
            <X size={20} />
          </Button>
        </div>

        {/* List cameras */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 max-h-[calc(100vh-200px)] mt-4">
          {isLoadingCameras ? (
            <div>Đang tải danh sách camera...</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {cameras?.map((camera) => (
                <div key={camera.id} className="flex items-center gap-2">
                  <div className="flex flex-col w-full">
                    <p className="text-sm font-medium truncate max-w-xs">{camera.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{camera.rtspUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateMonitorGrid(monitor, gridKey, {
                        cameraId: camera.id,
                        workerIp: camera.worker?.ip || null,
                        workerPort: camera.worker?.port || null,
                      });
                    }}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm cursor-pointer"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
