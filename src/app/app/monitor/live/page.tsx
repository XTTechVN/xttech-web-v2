'use client';

// components
import HeaderToolbar from './_components/HeaderToolbar';
import MonitorList from './_components/MonitorList';
import MonitorSetting from './_components/MonitorSetting';
import MonitorGrid from './_components/MonitorGrid';
import ModalWrapper from '@/components/modal/ModalWrapper';
import ModalConfirm from '@/components/modal/ModalConfirm';
import InsertCameraModal from './_components/InsertCameraModal';

// hooks
import { useQuery } from '@tanstack/react-query';
import useUserStore from '@/stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '@/utils/api';

// types
import { GridCell, Monitor } from '@/types/shared/monitor';

export default function LivePage() {
  const { user } = useUserStore();
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [isShowConfirmRemoveCamera, setIsShowConfirmRemoveCamera] = useState(false);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isShowList, setIsShowList] = useState(true);
  const [isAddCamera, setIsAddCamera] = useState(false);
  const [gridKey, setGridKey] = useState('');

  const {
    data: monitors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['monitors'],
    queryFn: async () => {
      const res = await api.get(`/api/v1/monitors?userId=${user?.id}`);
      return res.data.items;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  });

  // Xử lý chọn màn hình
  const handleSelectMonitor = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setIsShowList(false);
    setIsShowSetting(true);
  };

  // Xử lý flow chọn camera để gán vào cell
  const handleAddCamera = (cell: GridCell, gridKey: string) => {
    setIsAddCamera(true);
    setGridKey(gridKey);
  };

  const handleRemoveCamera = async (cell: GridCell, gridKey: string) => {
    try {
      const res = await api.patch(`/api/v1/monitors/${selectedMonitor?.id}`, {
        grid: {
          ...selectedMonitor?.grid,
          [gridKey]: {
            ...selectedMonitor?.grid[gridKey],
            cameraId: null,
            workerIp: null,
            workerPort: null,
          },
        },
      });
      setSelectedMonitor(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsShowConfirmRemoveCamera(false);
      setGridKey('');
    }
  };

  // Xử lý trạng thái loading, error, và user
  if (isLoading) return <div>Đang tải danh sách màn hình...</div>;
  if (isError) return <div>Không tải được danh sách màn hình</div>;
  if (!user) return <div>Không tìm thấy thông tin người dùng</div>;

  return (
    <div className="p-4 space-y-4 h-full">
      {/* Header */}
      <HeaderToolbar
        userId={user.id}
        onShowList={() => {
          setIsShowList(true);
          setIsShowSetting(false);
        }}
        onShowSetting={() => {
          setIsShowList(false);
          setIsShowSetting(true);
        }}
      />

      {/* Body */}
      <div className="flex gap-2 h-full">
        {/* Monitor Grid */}
        <div className="flex-1">
          {selectedMonitor && (
            <MonitorGrid
              grid={selectedMonitor.grid}
              onAddCamera={handleAddCamera}
              onRemoveCamera={(cell: GridCell, gridKey: string) => {
                setIsShowConfirmRemoveCamera(true);
                setGridKey(gridKey);
              }}
            />
          )}
        </div>

        {/* Sidebar control */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full md:w-[20%] h-full"
          >
            <div>
              {isShowList && (
                <MonitorList monitors={monitors} onSelectMonitor={handleSelectMonitor} />
              )}
              {isShowSetting && (
                <MonitorSetting setViewMode={(viewMode) => {}} setPortView={(portView) => {}} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal insert camera */}
      <ModalWrapper isOpen={isAddCamera} onClose={() => setIsAddCamera(false)}>
        {selectedMonitor && (
          <InsertCameraModal
            gridKey={gridKey}
            monitor={selectedMonitor}
            onClose={() => setIsAddCamera(false)}
            setSelectedMonitor={setSelectedMonitor}
          />
        )}
      </ModalWrapper>

      {/* Modal confirm remove camera */}
      <ModalWrapper
        isOpen={isShowConfirmRemoveCamera}
        onClose={() => setIsShowConfirmRemoveCamera(false)}
      >
        {selectedMonitor && (
          <ModalConfirm
            title="Xác nhận xóa camera"
            description={`Bạn có chắc chắn muốn xóa camera "${gridKey}" ra khỏi monitor "${selectedMonitor.name}"?`}
            isLoading={false}
            onConfirm={() => handleRemoveCamera(selectedMonitor?.grid[gridKey]!, gridKey)}
            onCancel={() => setIsShowConfirmRemoveCamera(false)}
          />
        )}
      </ModalWrapper>
    </div>
  );
}
