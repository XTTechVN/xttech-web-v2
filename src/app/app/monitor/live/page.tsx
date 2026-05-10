'use client';

// components
import HeaderToolbar from './_components/MonitorToolbar';
import MonitorList from './_components/MonitorList';
import MonitorSetting from './_components/MonitorSetting';
import MonitorGrid from './_components/MonitorGrid';
import ModalWrapper from '@/components/modal/ModalWrapper';
import ModalConfirm from '@/components/modal/ModalConfirm';
import InsertCameraModal from './_components/modal/AddCamera';

// hooks
import { useQuery } from '@tanstack/react-query';
import useUserStore from '@/stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';

import useMonitorStore from '@/stores/useMonitorStore';

export default function LivePage() {
  const { user } = useUserStore();
  const {
    monitor,
    isAdding,
    setIsAdding,
    isRemoving,
    setIsRemoving,
    isShowSetting,
    isShowList,
    gridKey,
    removeMonitorGrid,
  } = useMonitorStore();

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

  // Xử lý trạng thái loading, error, và user
  if (isLoading) return <div>Đang tải danh sách màn hình...</div>;
  if (isError) return <div>Không tải được danh sách màn hình</div>;
  if (!user) return <div>Không tìm thấy thông tin người dùng</div>;

  return (
    <div className="p-4 space-y-4 h-full">
      {/* Header */}
      <HeaderToolbar userId={user.id} />

      {/* Body */}
      <div className="flex gap-2 h-full">
        {/* Monitor Grid */}
        <div className="flex-1">{monitor && <MonitorGrid />}</div>

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
              {isShowList && <MonitorList monitors={monitors} />}
              {isShowSetting && <MonitorSetting />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal insert camera */}
      <ModalWrapper isOpen={isAdding} onClose={() => setIsAdding(false)}>
        {monitor && <InsertCameraModal />}
      </ModalWrapper>

      {/* Modal confirm remove camera */}
      <ModalWrapper isOpen={isRemoving} onClose={() => setIsRemoving(false)}>
        {monitor && (
          <ModalConfirm
            title="Xác nhận xóa camera"
            description={`Bạn có chắc chắn muốn xóa camera "${gridKey}" ra khỏi monitor "${monitor.name}"?`}
            isLoading={false}
            onConfirm={() => removeMonitorGrid(monitor, gridKey!)}
            onCancel={() => setIsRemoving(false)}
          />
        )}
      </ModalWrapper>
    </div>
  );
}
