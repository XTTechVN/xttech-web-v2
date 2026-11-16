'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';
import { cn } from '@/utils/cn';

// Dữ liệu mockup: 20 họ, 20 tên đệm, 20 tên riêng tiếng Việt tự nhiên
const HO_LIST: string[] = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng',
  'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương',
  'Lý', 'Đào', 'Đoàn', 'Mai', 'Trịnh',
];

const DEM_NAM_LIST: string[] = [
  'Văn', 'Hữu', 'Đình', 'Đức', 'Minh',
  'Quang', 'Tuấn', 'Quốc', 'Thanh', 'Trọng',
  'Bảo', 'Công', 'Thành', 'Tiến', 'Ngọc',
  'Hải', 'Xuân', 'Thế', 'Khắc', 'Duy',
];

const TEN_NAM_LIST: string[] = [
  'Nam', 'Hùng', 'Dũng', 'Thắng', 'Đức',
  'Bảo', 'Kiệt', 'Long', 'Huy', 'Phong',
  'Sơn', 'Tùng', 'Khoa', 'Phúc', 'Lâm',
  'Cường', 'Trung', 'Hải', 'Việt', 'Thịnh',
];

const DEM_NU_LIST: string[] = [
  'Thị', 'Ngọc', 'Thu', 'Phương', 'Thanh', 'Minh', 'Lan',
];

const TEN_NU_LIST: string[] = [
  'Linh', 'Hương', 'Trang', 'Thảo', 'Hà', 'Mai', 'Anh', 'Ngọc',
];

const ACTION_LIST: string[] = [
  'đã đăng ký sử dụng phần mềm',
  'vừa đặt lịch demo',
  'đã nhận báo giá',
];

const TIME_AGO_LIST: string[] = [
  'vừa xong',
  '1 phút trước',
  '2 phút trước',
  '3 phút trước',
];

interface ToastMessage {
  id: number;
  name: string;
  action: string;
  timeAgo: string;
  isEntering?: boolean;
  isExiting?: boolean;
}

const INITIAL_MESSAGES: ToastMessage[] = [
  { id: 1, name: 'Anh Lê Hoàng Nam', action: 'đã đăng ký sử dụng phần mềm', timeAgo: '3 phút trước' },
  { id: 2, name: 'Chị Vũ Ngọc Lan', action: 'vừa đặt lịch demo', timeAgo: '1 phút trước' },
  { id: 3, name: 'Anh Đặng Gia Huy', action: 'đã nhận báo giá', timeAgo: 'vừa xong' },
];

let globalUserCounter = 3;

function createRandomMessage(): ToastMessage {
  globalUserCounter++;
  const isFemale = Math.random() < 0.4;
  const ho = HO_LIST[Math.floor(Math.random() * HO_LIST.length)];
  const demList = isFemale ? DEM_NU_LIST : DEM_NAM_LIST;
  const tenList = isFemale ? TEN_NU_LIST : TEN_NAM_LIST;
  const dem = demList[Math.floor(Math.random() * demList.length)];
  const ten = tenList[Math.floor(Math.random() * tenList.length)];
  const prefix = isFemale ? 'Chị' : 'Anh';
  const action = ACTION_LIST[Math.floor(Math.random() * ACTION_LIST.length)];
  const timeAgo = TIME_AGO_LIST[Math.floor(Math.random() * TIME_AGO_LIST.length)];

  return {
    id: globalUserCounter,
    name: `${prefix} ${ho} ${dem} ${ten}`,
    action,
    timeAgo,
    isEntering: true,
  };
}

const MAX_VISIBLE = 3;
const CYCLE_INTERVAL = 10000;
const EXIT_CLEANUP_DELAY = 880;
const ROW_STEP_PX = 64;

export function HeroLiveSocialProof() {
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<ToastMessage[]>(INITIAL_MESSAGES);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, []);

  const scheduleCleanup = useCallback((removeId: number) => {
    const tid = setTimeout(() => {
      setMessages((prev) => prev.filter((item) => item.id !== removeId));
    }, EXIT_CLEANUP_DELAY);
    timeoutIdsRef.current.push(tid);
  }, []);

  // Mỗi 10 giây thêm tin mới từ dưới lên, các tin cũ trượt mượt lên trên, mờ dần và biến mất (tối đa 3 tin)
  useEffect(() => {
    if (!isMounted || isHovered) return;

    const intervalId = setInterval(() => {
      const nextMsg = createRandomMessage();

      setMessages((prev) => {
        const activeItems = prev.filter((item) => !item.isExiting);
        if (activeItems.length >= MAX_VISIBLE) {
          const oldestId = activeItems[0].id;
          scheduleCleanup(oldestId);
          return [
            ...prev.map((item) =>
              item.id === oldestId ? { ...item, isExiting: true } : item,
            ),
            nextMsg,
          ];
        }
        return [...prev, nextMsg];
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === nextMsg.id ? { ...item, isEntering: false } : item,
            ),
          );
        });
      });
    }, CYCLE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isMounted, isHovered, scheduleCleanup]);

  const handleDismissItem = (id: number) => {
    setMessages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isExiting: true } : item)),
    );
    scheduleCleanup(id);
  };

  if (!isMounted || messages.length === 0) return null;

  const activeMessages = messages.filter((m) => !m.isExiting);

  return (
    <aside
      aria-label="Thông báo đăng ký"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-none fixed bottom-24 left-3 z-40 h-[196px] w-[calc(100vw-1.5rem)] max-w-[380px] select-none sm:bottom-20 sm:left-6"
    >
      {messages.map((msg) => {
        const activeIdx = activeMessages.findIndex((m) => m.id === msg.id);
        const distanceFromBottom =
          activeIdx === -1 ? MAX_VISIBLE : activeMessages.length - 1 - activeIdx;

        const isNewest = !msg.isExiting && distanceFromBottom === 0;

        let translateY = -distanceFromBottom * ROW_STEP_PX;
        let scale = Math.max(0.94, 1 - distanceFromBottom * 0.02);
        let opacity =
          distanceFromBottom === 0 ? 1 : distanceFromBottom === 1 ? 0.62 : 0.28;

        if (msg.isEntering) {
          translateY = 28;
          scale = 0.96;
          opacity = 0;
        } else if (msg.isExiting) {
          translateY = -MAX_VISIBLE * ROW_STEP_PX - 26;
          scale = 0.93;
          opacity = 0;
        }

        return (
          <div
            key={msg.id}
            style={{
              transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              opacity,
              willChange: 'transform, opacity',
              transition:
                'transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 780ms cubic-bezier(0.22, 1, 0.36, 1), border-color 650ms ease, box-shadow 650ms ease',
            }}
            className={cn(
              'pointer-events-auto absolute bottom-0 left-0 flex w-fit max-w-full origin-bottom-left items-center gap-3 rounded-lg border px-3.5 py-2.5 backdrop-blur-xs',
              isNewest
                ? 'border-emerald-300/60 bg-primary shadow-xl shadow-primary/30'
                : 'border-teal-300/25 bg-primary/95 shadow-md',
              msg.isExiting && 'pointer-events-none',
            )}
          >
            {/* Icon ngôi sao xanh ngọc nổi bật đồng bộ thương hiệu */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-300 via-teal-300 to-cyan-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              <Star className="h-4.5 w-4.5 fill-primary text-primary" />
            </div>

            {/* 2 dòng chữ: Tên xanh ngọc sáng nổi bật trên, hành động + thời gian dưới */}
            <div className="min-w-0 leading-tight">
              <strong
                className={cn(
                  'block truncate text-xs sm:text-[13px] transition-colors duration-300',
                  isNewest ? 'font-extrabold text-emerald-300' : 'font-bold text-emerald-200/90',
                )}
              >
                {msg.name}
              </strong>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/90">
                <span className="truncate font-medium">{msg.action}</span>
                <span className="hidden shrink-0 whitespace-nowrap text-teal-100/75 sm:inline">
                  • {msg.timeAgo}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissItem(msg.id);
              }}
              aria-label="Đóng thông báo"
              className="ml-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

export default HeroLiveSocialProof;
