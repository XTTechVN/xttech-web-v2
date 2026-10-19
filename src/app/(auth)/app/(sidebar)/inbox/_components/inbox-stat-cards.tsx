'use client';

import React from 'react';
import { Inbox, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';

interface InboxStatCardsProps {
  total: number;
  unreadCount: number;
  pendingReviewCount: number;
  readCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const InboxStatCards: React.FC<InboxStatCardsProps> = ({
  total,
  unreadCount,
  pendingReviewCount,
  readCount,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'all',
      title: 'Tổng hộp thư đến',
      count: total,
      icon: <Inbox size={20} />,
      colorClass: 'bg-primary/10 text-primary border-primary/20',
      activeRing: 'ring-2 ring-primary border-transparent',
    },
    {
      id: 'unread',
      title: 'Văn bản chưa đọc',
      count: unreadCount,
      icon: <Mail size={20} />,
      colorClass: 'bg-rose-50 text-rose-600 border-rose-200',
      activeRing: 'ring-2 ring-rose-500 border-transparent',
      badge: unreadCount > 0 ? `${unreadCount} mới` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'need_action',
      title: 'Chờ tôi duyệt',
      count: pendingReviewCount,
      icon: <Clock size={20} />,
      colorClass: 'bg-amber-50 text-amber-600 border-amber-200',
      activeRing: 'ring-2 ring-amber-500 border-transparent',
      badge: pendingReviewCount > 0 ? `${pendingReviewCount} cần duyệt` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'read',
      title: 'Văn bản đã đọc',
      count: readCount,
      icon: <CheckCircle2 size={20} />,
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 border-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card) => {
        const isActive = activeTab === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectTab(card.id)}
            className={cn(
              'bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer select-none flex flex-col justify-between gap-3 relative group',
              isActive ? card.activeRing : 'hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105',
                  card.colorClass
                )}
              >
                {card.icon}
              </div>

              {card.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full select-none',
                    card.badgeColor
                  )}
                >
                  {card.badge}
                </span>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">
                {card.count.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
