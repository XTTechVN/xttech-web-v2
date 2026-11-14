'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

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

type AnimationPhase = 'idle' | 'exiting-up' | 'entering-from-bottom' | 'dismissing-left';

const CYCLE_INTERVAL = 3000; // Chu kỳ 3 giây cho mỗi tin nhắn
const EXIT_DURATION = 300;   // Thời gian tin nhắn trượt lên trên rồi biến mất (ms)
const PAUSE_HIDDEN = 220;    // Thời gian biến mất hẳn trước khi tin mới bật lên (ms)
const ENTER_DURATION = 380;  // Thời gian tin mới bật từ dưới lên (ms)
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

  // Logic mỗi 3s: tin nhắn trượt lên trên rồi biến mất hẳn, sau đó tin mới bật từ dưới lên
  useEffect(() => {
    if (!isMounted || isDismissed || isHovered) return;

    const intervalId = setInterval(() => {
      // 1. Tin nhắn hiện tại trượt lên trên và biến mất
      setAnimPhase('exiting-up');

      addTimeout(() => {
        // 2. Sau khi biến mất hẳn, chuẩn bị tin nhắn mới ở phía dưới
        const nextUser = createRandomUser();
        setCurrentUser(nextUser);
        setAnimPhase('entering-from-bottom');

        // 3. Bật nảy tin nhắn mới lên vị trí hiển thị
        addTimeout(() => {
          setAnimPhase('idle');
        }, 40);
      }, EXIT_DURATION + PAUSE_HIDDEN);
    }, CYCLE_INTERVAL);

    return () => {
      clearInterval(intervalId);
      clearAllTimeouts();
    };
  }, [isMounted, isDismissed, isHovered, addTimeout, clearAllTimeouts]);

  if (!isMounted || isDismissed) return null;

  // Xử lý styles chuyển động dạng tin nhắn trượt lên rồi biến mất
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

    // Tin nhắn trượt lên trên và biến mất
    if (animPhase === 'exiting-up') {
      return {
        transform: 'translateY(-28px) scale(0.95)',
        opacity: 0,
        transition: `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${EXIT_DURATION - 40}ms ease-out`,
      };
    }

    // Chuẩn bị tin nhắn mới ở phía dưới
    if (animPhase === 'entering-from-bottom') {
      return {
        transform: 'translateY(24px) scale(0.95)',
        opacity: 0,
        transition: 'none',
      };
    }

    // Trạng thái hiển thị: bật nảy từ dưới lên vị trí chuẩn
    return {
      transform: 'translateY(0) translateX(0) scale(1)',
      opacity: 1,
      transition: `transform ${ENTER_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 260ms ease-out`,
    };
  };

  return (
    <aside
      aria-label="Thông báo đăng ký"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-16 left-3 sm:bottom-12 sm:left-6 z-40 select-none pointer-events-auto max-w-[calc(100vw-1.5rem)] sm:max-w-max transition-transform duration-300 hover:scale-[1.01]"
    >
      {/* Bong bóng tin nhắn nổi bật với viền border-primary */}
      <div
        style={getContainerStyle()}
        className="flex items-center gap-2 sm:gap-2.5 rounded-xl border-2 border-primary bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-primary/20 transition-shadow"
      >
        {/* Nội dung Toast */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-slate-700 min-w-0">
          <strong className="font-extrabold text-primary shrink-0 whitespace-nowrap">
            {currentUser.name}
          </strong>
          <span className="truncate sm:whitespace-nowrap font-medium">đã đăng ký sử dụng phần mềm</span>
          <span className="hidden md:inline text-[11px] text-slate-400 font-medium whitespace-nowrap">
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
