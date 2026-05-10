'use client';

// components
import HeaderToolbar from './_components/HeaderToolbar';
import MonitorList from './_components/MonitorList';
import MonitorSetting from './_components/MonitorSetting';
import MonitorGrid from './_components/MonitorGrid';
import ModalWrapper from '@/components/modal/ModalWrapper';
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
            <MonitorGrid grid={selectedMonitor.grid} onAddCamera={handleAddCamera} />
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
          />
        )}
      </ModalWrapper>
    </div>
  );
}
