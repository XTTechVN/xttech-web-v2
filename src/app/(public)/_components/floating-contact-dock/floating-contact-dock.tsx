'use client';

import React, { useState } from 'react';
import { ArrowUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CONTACT_ACTIONS } from './floating-contact-dock.constants';

export interface FloatingContactDockProps {
  className?: string;
}

export function FloatingContactDock({ className = '' }: FloatingContactDockProps) {
  const [dockOpen, setDockOpen] = useState<boolean>(true);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Thanh liên hệ nhanh XTTech"
      className={cn(
        'fixed right-3 sm:right-5 bottom-6 z-50 flex flex-col items-center gap-2.5 select-none',
        className,
      )}
    >
      {/* Nhóm các nút liên kết mạng xã hội & hotline (cố định trên màn hình, không bị trôi khi cuộn chuột) */}
      <div
        className={cn(
          'flex flex-col items-center gap-2.5 transition-all duration-300 ease-in-out',
          dockOpen ? 'pointer-events-auto max-h-96' : 'pointer-events-none max-h-0 overflow-hidden',
        )}
      >
        {CONTACT_ACTIONS.map(({ key, href, title, tooltip, icon: Icon, iconClassName, buttonClassName, tooltipClassName, external }, index) => (
          <a
            key={key}
            href={href}
            title={title}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            // Hiệu ứng xuất hiện lần lượt (stagger) khi mở/đóng dock
            style={{ transitionDelay: `${(dockOpen ? index : CONTACT_ACTIONS.length - 1 - index) * 50}ms` }}
            className={cn(
              'group relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:-translate-x-1 hover:scale-110 hover:shadow-xl active:scale-95',
              dockOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              buttonClassName,
            )}
          >
            {/* Vòng sóng lan tỏa thu hút chú ý (màu theo nút) */}
            <span
              aria-hidden="true"
              style={{ animationDelay: `${index * 450}ms`, animationDuration: '2.4s' }}
              className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-inherit opacity-40 motion-reduce:animate-none"
            />
            <Icon
              className={cn(
                iconClassName,
                'transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110',
              )}
            />
            <span
              className={cn(
                'pointer-events-none absolute right-14 translate-x-2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100',
                tooltipClassName,
              )}
            >
              {tooltip}
            </span>
          </a>
        ))}
      </div>

      {/* Nút Thu gọn / Mở rộng các nút liên hệ */}
      <button
        type="button"
        onClick={() => setDockOpen((prev) => !prev)}
        title={dockOpen ? 'Ẩn các nút liên hệ' : 'Hiện các nút liên hệ'}
        className={cn(
          'group flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer',
          dockOpen
            ? 'bg-[#1e293b] text-white hover:bg-slate-900'
            : 'bg-primary text-white ring-4 ring-primary/20 hover:bg-primary/90 motion-safe:animate-bounce',
        )}
      >
        <ChevronDown
          className={cn('h-5 w-5 transition-transform duration-500', dockOpen ? 'rotate-0' : 'rotate-180')}
        />
      </button>

      {/* Nút Cuộn lên đầu trang */}
      <button
        type="button"
        onClick={scrollToTop}
        title="Cuộn lên đầu trang"
        className="group flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white hover:shadow-lg active:scale-90 cursor-pointer"
      >
        <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </aside>
  );
}
