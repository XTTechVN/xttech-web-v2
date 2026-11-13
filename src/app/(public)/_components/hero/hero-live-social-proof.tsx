'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';

// 1. Dữ liệu mockup: 20 họ, 20 tên đệm, 20 tên riêng tiếng Việt tự nhiên (tạo ra > 8.000 tên ngẫu nhiên)
const HO_LIST: string[] = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng',
  'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương',
  'Lý', 'Đào', 'Đoàn', 'Mai', 'Trịnh',
];

const DEM_LIST: string[] = [
  'Văn', 'Hữu', 'Đình', 'Đức', 'Minh',
  'Quang', 'Tuấn', 'Quốc', 'Thanh', 'Trọng',
  'Bảo', 'Công', 'Thành', 'Tiến', 'Ngọc',
  'Hải', 'Xuân', 'Thế', 'Khắc', 'Duy',
];

const TEN_LIST: string[] = [
  'Nam', 'Hùng', 'Dũng', 'Thắng', 'Đức',
  'Bảo', 'Kiệt', 'Long', 'Huy', 'Phong',
  'Sơn', 'Tùng', 'Khoa', 'Phúc', 'Lâm',
  'Cường', 'Trung', 'Hải', 'Việt', 'Thịnh',
];

const TIME_AGO_LIST: string[] = [
  'vừa xong',
  '1 phút trước',
  '2 phút trước',
  '3 phút trước',
  '4 phút trước',
];

interface ToastUser {
  id: number;
  name: string;
  timeAgo: string;
}

const INITIAL_USER: ToastUser = {
  id: 1,
  name: 'Anh Nguyễn Hoàng Nam',
  timeAgo: 'vừa xong',
};

let globalUserCounter = 1;

/**
 * Hàm sinh ngẫu nhiên 1 người dùng mới từ kho họ tên tiếng Việt
 */
function createRandomUser(): ToastUser {
  globalUserCounter++;
  const ho = HO_LIST[Math.floor(Math.random() * HO_LIST.length)];
  const dem = DEM_LIST[Math.floor(Math.random() * DEM_LIST.length)];
  const ten = TEN_LIST[Math.floor(Math.random() * TEN_LIST.length)];
  const timeAgo = TIME_AGO_LIST[Math.floor(Math.random() * TIME_AGO_LIST.length)];

  return {
    id: globalUserCounter,
    name: `Anh ${ho} ${dem} ${ten}`,
    timeAgo,
  };
}

type AnimationPhase = 'idle' | 'exiting-down' | 'entering-from-top' | 'dismissing-left';

const CYCLE_INTERVAL = 2800; // Nhảy liên tục mỗi 2.8 giây
const SLIDE_DURATION = 280;  // Thời gian trượt chuyển đổi (ms)
const DISMISS_DURATION = 300; // Thời gian trượt sang trái khi bấm tắt (ms)

export function HeroLiveSocialProof() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<ToastUser>(INITIAL_USER);
  const [animPhase, setAnimPhase] = useState<AnimationPhase>('idle');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  }, []);

  // Xử lý khi người dùng bấm tắt x: trượt sang trái rồi biến mất
  const handleDismiss = () => {
    setAnimPhase('dismissing-left');
    addTimeout(() => {
      setIsDismissed(true);
    }, DISMISS_DURATION);
  };

  // Logic nhảy liên tục không ngừng: người cũ trượt xuống, người mới từ trên trượt xuống
  useEffect(() => {
    if (!isMounted || isDismissed || isHovered) return;

    const intervalId = setInterval(() => {
      // 1. Trượt xuống phía dưới và mờ dần
      setAnimPhase('exiting-down');

      addTimeout(() => {
        // 2. Tạo người dùng mới ngẫu nhiên và đặt ở phía trên (-16px)
        const nextUser = createRandomUser();
        setCurrentUser(nextUser);
        setAnimPhase('entering-from-top');

        // 3. Trượt xuống vị trí hiển thị ban đầu và sáng dần
        addTimeout(() => {
          setAnimPhase('idle');
        }, 40);
      }, SLIDE_DURATION);
    }, CYCLE_INTERVAL);

    return () => {
      clearInterval(intervalId);
      clearAllTimeouts();
    };
  }, [isMounted, isDismissed, isHovered, addTimeout, clearAllTimeouts]);

  if (!isMounted || isDismissed) return null;

  // Xử lý styles chuyển động mượt mà
  const getContainerStyle = (): React.CSSProperties => {
    // Khi bấm nút tắt x: trượt sang trái và biến mất
    if (animPhase === 'dismissing-left') {
      return {
        transform: 'translateX(-120%)',
        opacity: 0,
        transition: `transform ${DISMISS_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${DISMISS_DURATION - 50}ms ease-out`,
        pointerEvents: 'none',
      };
    }

    // Khi kết thúc chu kỳ: trượt dần xuống dưới và mờ dần
    if (animPhase === 'exiting-down') {
      return {
        transform: 'translateY(16px)',
        opacity: 0,
        transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${SLIDE_DURATION}ms ease-out`,
      };
    }

    // Chuẩn bị người mới từ phía trên
    if (animPhase === 'entering-from-top') {
      return {
        transform: 'translateY(-16px)',
        opacity: 0,
        transition: 'none',
      };
    }

    // Trạng thái bình thường (idle) hoặc trượt từ trên xuống vị trí gốc
    return {
      transform: 'translateY(0) translateX(0)',
      opacity: 1,
      transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0, 0, 0.2, 1), opacity ${SLIDE_DURATION}ms ease-out`,
    };
  };

  return (
    <aside
      aria-label="Thông báo đăng ký"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-3 left-3 sm:bottom-12 sm:left-6 z-50 select-none pointer-events-auto max-w-[calc(100vw-1.5rem)] sm:max-w-max transition-transform duration-300 hover:scale-[1.01]"
    >
      {/* Toast pill gọn nhẹ, nhảy liên tục, nền trong suốt hoàn toàn */}
      <div
        style={getContainerStyle()}
        className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-transparent px-2.5 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-[2px] transition-all"
      >
        {/* Icon tick xanh xác thực */}
        <div className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        {/* Nội dung Toast */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-800 min-w-0">
          <strong className="font-bold text-slate-900 shrink-0 whitespace-nowrap">
            {currentUser.name}
          </strong>
          <span className="truncate sm:whitespace-nowrap">đã đăng ký sử dụng phần mềm</span>
          <span className="hidden md:inline text-[11px] text-slate-500 font-medium whitespace-nowrap">
            • {currentUser.timeAgo}
          </span>
        </div>

        {/* Nút đóng: bấm vào trượt sang trái biến mất */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label="Đóng thông báo"
          className="ml-0.5 sm:ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/40 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
}

export default HeroLiveSocialProof;
