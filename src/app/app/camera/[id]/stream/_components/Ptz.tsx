'use client';

import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Home, Plus, Trash2, MapPin, Loader2, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Camera } from '@/types/shared/camera';
import { usePtzStore } from '@/stores/usePtzStore';

interface Props {
  camera: Camera;
}

export default function Ptz({ camera }: Props) {
  const { 
    isMoving, 
    newPresetName, 
    setNewPresetName,
    presets,
    isLoadingPresets,
    fetchPresets,
    movePtz,
    createPreset,
    gotoPreset,
    deletePreset,
    gotoHome,
    setHome
  } = usePtzStore();

  const hasPtz = camera.ptz ?? camera.onvif;

  useEffect(() => {
    fetchPresets(camera.id, !!hasPtz);
  }, [camera.id, hasPtz, fetchPresets]);

  const handlePTZ = async (action: string) => {
    if (!hasPtz) {
      toast.error('Camera này không hỗ trợ PTZ');
      return;
    }
    await movePtz(camera.id, action);
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) {
      toast.error('Vui lòng nhập tên preset');
      return;
    }
    await createPreset(camera.id, newPresetName);
  };

  return (
    <div className="px-4 pb-4 text-black space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Điều khiển PTZ (Onvif)</p>
        {!hasPtz && <span className="text-xs text-red-600 rounded bg-red-100 px-2 py-1">Không hỗ trợ</span>}
      </div>

      <div className={`space-y-4 ${!hasPtz ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {/* Navigation Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('up_left')}
              disabled={isMoving}
              title="Lên trái"
            >
              <ChevronUp size={24} className="text-primary -rotate-45" />
            </button>
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('up')}
              disabled={isMoving}
              title="Lên"
            >
              <ChevronUp size={28} className="text-primary" />
            </button>
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('up_right')}
              disabled={isMoving}
              title="Lên phải"
            >
              <ChevronUp size={24} className="text-primary rotate-45" />
            </button>

            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('left')}
              disabled={isMoving}
              title="Trái"
            >
              <ChevronLeft size={28} className="text-primary" />
            </button>
            <button
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center shadow-inner border border-primary/20 transition-all"
              onClick={() => handlePTZ('stop')}
              disabled={isMoving}
              title="Dừng"
            >
              <Target size={20} className="text-primary" />
            </button>
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('right')}
              disabled={isMoving}
              title="Phải"
            >
              <ChevronRight size={28} className="text-primary" />
            </button>

            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('down_left')}
              disabled={isMoving}
              title="Xuống trái"
            >
              <ChevronDown size={24} className="text-primary rotate-45" />
            </button>
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('down')}
              disabled={isMoving}
              title="Xuống"
            >
              <ChevronDown size={28} className="text-primary" />
            </button>
            <button
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('down_right')}
              disabled={isMoving}
              title="Xuống phải"
            >
              <ChevronDown size={24} className="text-primary -rotate-45" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              onClick={() => gotoHome(camera.id)}
              disabled={isMoving}
            >
              <Home size={16} className="text-primary" />
              <span className="text-sm font-medium">Về Home</span>
            </button>
            <button
              className="py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm"
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn đặt vị trí hiện tại làm Home?')) {
                  setHome(camera.id);
                }
              }}
              disabled={isMoving}
              title="Đặt vị trí hiện tại làm Home"
            >
              <MapPin size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('zoom_out')}
              disabled={isMoving}
            >
              <ZoomOut size={18} className="text-primary" />
              <span className="text-sm font-medium">Thu nhỏ</span>
            </button>
            <button
              className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              onClick={() => handlePTZ('zoom_in')}
              disabled={isMoving}
            >
              <ZoomIn size={18} className="text-primary" />
              <span className="text-sm font-medium">Phóng to</span>
            </button>
          </div>
        </div>

        {/* Presets Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">Điểm nhớ (Presets)</p>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tên preset mới..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePreset()}
              disabled={isMoving}
            />
            <button
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              onClick={handleCreatePreset}
              disabled={isMoving || !newPresetName.trim()}
            >
              {isMoving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {isLoadingPresets ? (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="text-primary animate-spin" />
              </div>
            ) : presets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">Chưa có điểm nhớ nào</p>
            ) : (
              presets.map((preset: any) => (
                <div key={preset.token} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all group">
                  <button
                    className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => gotoPreset(camera.id, preset.token)}
                    disabled={isMoving}
                  >
                    <Target size={14} className="text-gray-400 group-hover:text-primary" />
                    <span className="truncate">{preset.name || `Preset ${preset.token}`}</span>
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa preset này?')) {
                        deletePreset(camera.id, preset.token);
                      }
                    }}
                    disabled={isMoving}
                    title="Xóa preset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
