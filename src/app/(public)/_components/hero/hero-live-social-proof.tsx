'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

// Dữ liệu mockup: 20 họ, 20 tên đệm, 20 tên riêng tiếng Việt tự nhiên
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
  { id: 2, name: 'Anh Vũ Ngọc Lan', action: 'vừa đặt lịch demo', timeAgo: '1 phút trước' },
  { id: 3, name: 'Anh Đặng Gia Huy', action: 'đã nhận báo giá', timeAgo: 'vừa xong' },
];

let globalUserCounter = 3;

function createRandomMessage(): ToastMessage {
  globalUserCounter++;
  const ho = HO_LIST[Math.floor(Math.random() * HO_LIST.length)];
  const dem = DEM_LIST[Math.floor(Math.random() * DEM_LIST.length)];
  const ten = TEN_LIST[Math.floor(Math.random() * TEN_LIST.length)];
  const action = ACTION_LIST[Math.floor(Math.random() * ACTION_LIST.length)];
  const timeAgo = TIME_AGO_LIST[Math.floor(Math.random() * TIME_AGO_LIST.length)];

  return {
    id: globalUserCounter,
    name: `Anh ${ho} ${dem} ${ten}`,
    action,
    timeAgo,
    isEntering: true,
  };
}

const MAX_VISIBLE = 3;
const CYCLE_INTERVAL = 1000;
const EXIT_CLEANUP_DELAY = 880;
const ROW_STEP_PX = 50;

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

  // Mỗi 1 giây thêm tin mới từ dưới lên, các tin cũ trượt mượt lên trên, mờ dần và biến mất (tối đa 3 tin)
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
      className="pointer-events-none fixed bottom-16 left-3 z-40 h-[160px] w-[calc(100vw-1.5rem)] max-w-[420px] select-none sm:bottom-10 sm:left-6"
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
              'pointer-events-auto absolute bottom-0 left-0 flex w-fit max-w-full origin-bottom-left items-center gap-2 rounded-xl border-2 px-3.5 py-2 backdrop-blur-xs sm:gap-2.5 sm:px-4 sm:py-2.5',
              isNewest
                ? 'border-primary bg-white/95 shadow-lg shadow-primary/15'
                : 'border-slate-200/80 bg-white/85 shadow-xs',
              msg.isExiting && 'pointer-events-none',
            )}
          >
            <div className="flex min-w-0 items-center gap-1 text-xs text-slate-700 sm:gap-1.5">
              <strong
                className={cn(
                  'shrink-0 whitespace-nowrap transition-colors duration-300',
                  isNewest ? 'font-extrabold text-primary' : 'font-semibold text-slate-600',
                )}
              >
                {msg.name}
              </strong>
              <span className="truncate font-medium sm:whitespace-nowrap">
                {msg.action}
              </span>
              <span className="hidden text-[11px] font-medium whitespace-nowrap text-slate-400 md:inline">
                • {msg.timeAgo}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissItem(msg.id);
              }}
              aria-label="Đóng thông báo"
              className="ml-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200/80 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

export default HeroLiveSocialProof;
