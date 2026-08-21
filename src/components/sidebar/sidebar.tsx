'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import { ChevronDown, ChevronRight, Plus, ChevronLeft, Headphones, ExternalLink, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components';
import { HEADER_HEIGHT } from '@/config';

export interface SidebarSubItem {
  id: string;
  label: string;
  href?: string;
}

export interface SidebarItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  subItems?: SidebarSubItem[];
}

export interface SidebarSectionProps {
  title?: string;
  items: SidebarItemProps[];
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export interface SidebarBrandProps {
  name?: string;
  subtitle?: string;
  logo?: string | React.ReactNode;
  onClick?: () => void;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  sections: SidebarSectionProps[];
  activeId?: string;
  onItemSelect?: (item: SidebarItemProps) => void;
  brand?: SidebarBrandProps;
  user?: {
    name: string;
    role: string;
    avatar: string;
  };
  cta?: {
    title: string;
    description: string;
    buttonText: string;
    icon?: React.ReactNode;
    badge?: string;
    onButtonClick?: () => void;
  };
  variant?: 'light' | 'dark';
  onUserClick?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ sections = [], activeId, onItemSelect, brand, user, cta, className, variant = 'light', onUserClick, ...props }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    const isLight = variant === 'light';

    const toggleSubMenu = (itemId: string) => {
      setOpenSubMenus((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    };

    const handleItemClick = (item: SidebarItemProps) => {
      if (item.disabled) return;

      if (item.subItems && item.subItems.length > 0) {
        toggleSubMenu(item.id);
      } else if (onItemSelect) {
        onItemSelect(item);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'h-200 flex flex-col transition-all duration-300 border rounded-2xl relative select-none overflow-hidden ',
          isLight ? 'bg-white text-slate-700 border-slate-200 shadow-lg' : 'bg-slate-900 text-slate-300 border-slate-800 shadow-2xl',
          isCollapsed ? 'w-0 md:w-20 border-r-0 md:border-r opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'w-72',
          className,
        )}
        {...props}
      >
        {/* Khối Header Sidebar: Thương hiệu hoặc Người dùng */}
        {(brand || user) && (
          <div
            style={{ height: HEADER_HEIGHT }}
            className={cn(
              'px-4 flex items-center border-b shrink-0 gap-3 transition-colors',
              isLight ? 'border-slate-200' : 'border-slate-800/60',
              (brand?.onClick || onUserClick) && (isLight ? 'cursor-pointer hover:bg-slate-50/50' : 'cursor-pointer hover:bg-slate-800/30'),
              isCollapsed && 'justify-center px-2',
            )}
            onClick={() => {
              if (!isCollapsed) {
                if (brand?.onClick) brand.onClick();
                else onUserClick?.();
              }
            }}
          >
            {isCollapsed ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(false);
                }}
                className="cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={brand?.name || user?.name}
              >
                {brand ? (
                  typeof brand.logo === 'string' ? (
                    <img src={brand.logo} alt={brand.name || 'Brand'} className="w-8 h-8 object-contain" />
                  ) : (
                    brand.logo || <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-sm">{brand.name?.charAt(0) || 'X'}</div>
                  )
                ) : (
                  user && <Avatar src={user.avatar} name={user.name} size="sm" />
                )}
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {brand ? (
                    <>
                      {typeof brand.logo === 'string' ? (
                        <img src={brand.logo} alt={brand.name || 'Brand'} className="w-8 h-8 object-contain shrink-0" />
                      ) : (
                        brand.logo || (
                          <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {brand.name?.charAt(0) || 'X'}
                          </div>
                        )
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className={cn('text-base font-bold tracking-tight truncate block', isLight ? 'text-primary' : 'text-white')}>
                          {brand.name || 'XTTECH'}
                        </span>
                        {brand.subtitle && (
                          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase truncate block">
                            {brand.subtitle}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    user && (
                      <>
                        <Avatar src={user.avatar} name={user.name} size="md" />
                        <div className="flex flex-col min-w-0">
                          <span className={cn('text-sm font-semibold truncate block', isLight ? 'text-slate-900' : 'text-slate-100')}>{user.name}</span>
                          <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase block">{user.role}</span>
                        </div>
                      </>
                    )
                  )}
                </div>

                {/* Nút thu nhỏ (ẩn trên mobile) */}
                <div className="hidden md:flex shrink-0">
                  <button
                    type="button"
                    aria-label="Thu nhỏ sidebar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCollapsed(true);
                    }}
                    className={cn(
                      'w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer',
                      isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                        : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white',
                    )}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Danh sách mục điều hướng */}
        <div
          className={cn(
            'flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-hide',
            isLight ? 'scrollbar-thumb-slate-200' : 'scrollbar-thumb-slate-800',
          )}
        >
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              {/* Tiêu đề nhóm */}
              {section.title && (
                <div
                  className={cn(
                    'flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 py-1',
                    isCollapsed && 'justify-center',
                  )}
                >
                  {isCollapsed ? (
                    <span className={cn('w-4 h-[1px] block', isLight ? 'bg-slate-200' : 'bg-slate-800')} />
                  ) : (
                    <>
                      <span>{section.title}</span>
                      {section.showAddButton && (
                        <button
                          onClick={section.onAddClick}
                          className={cn(
                            'p-0.5 rounded transition-colors cursor-pointer',
                            isLight ? 'hover:bg-slate-100 hover:text-slate-950' : 'hover:bg-slate-800 hover:text-white',
                          )}
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Các liên kết trong nhóm */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isSubMenuOpen = openSubMenus[item.id];
                  const isItemActive = activeId === item.id || (hasSubItems && item.subItems?.some((sub) => sub.id === activeId));

                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Menu cha */}
                      <button
                        type="button"
                        disabled={item.disabled}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 group text-left',
                          isItemActive
                            ? isLight
                              ? 'bg-slate-100 text-primary font-semibold'
                              : 'bg-slate-800 text-white font-semibold'
                            : isLight
                              ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100',
                        )}
                      >
                        {/* Dải chỉ báo khi ở trạng thái thu gọn */}
                        {isCollapsed && isItemActive && <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-l-md" />}

                        {/* Icon hiển thị */}
                        {item.icon && (
                          <span
                            className={cn('shrink-0 transition-colors', isItemActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-400')}
                          >
                            {item.icon}
                          </span>
                        )}

                        {/* Nhãn và mũi tên */}
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {hasSubItems && (
                              <span className="text-slate-500">{isSubMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                            )}
                          </>
                        )}
                      </button>

                      {/* Danh sách menu con */}
                      {!isCollapsed && hasSubItems && isSubMenuOpen && (
                        <div className={cn('relative pl-6 space-y-1 ml-4 border-l', isLight ? 'border-slate-200' : 'border-slate-800')}>
                          {item.subItems?.map((sub) => {
                            const isSubActive = activeId === sub.id;

                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => onItemSelect?.(sub)}
                                className={cn(
                                  'w-full text-left py-2 px-3 text-xs rounded-md transition-colors relative cursor-pointer block',
                                  isSubActive
                                    ? isLight
                                      ? 'bg-slate-100/50 text-primary font-semibold'
                                      : 'bg-slate-800/80 text-primary font-semibold'
                                    : isLight
                                      ? 'text-slate-600 hover:text-slate-900'
                                      : 'text-slate-400 hover:text-slate-100',
                                )}
                              >
                                {/* Dấu chấm nhánh nối */}
                                <span
                                  className={cn(
                                    'absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border',
                                    isLight ? 'border-white' : 'border-slate-900',
                                    isSubActive ? 'bg-primary' : isLight ? 'bg-slate-200' : 'bg-slate-800',
                                  )}
                                />
                                {sub.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Khung quảng bá hành động ở chân trang */}
        {cta && !isCollapsed && (
          <div className={cn('p-2.5 sm:p-3 shrink-0 border-t', isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800/50 bg-slate-950/20')}>
            <div
              className={cn(
                'p-2.5 sm:p-3 rounded-xl border flex flex-col gap-2 sm:gap-2.5 transition-all relative overflow-hidden',
                isLight
                  ? 'bg-linear-to-b from-white to-slate-50/70 border-slate-200/80 shadow-xs'
                  : 'bg-linear-to-b from-slate-800/60 to-slate-900/60 border-slate-800 shadow-sm',
              )}
            >
              <div className="flex items-start gap-2 sm:gap-2.5">
                <div
                  className={cn(
                    'w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary',
                  )}
                >
                  {cta.icon || <Headphones size={13} className="stroke-[2.2]" />}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className={cn('text-xs font-semibold truncate', isLight ? 'text-slate-800' : 'text-slate-100')}>{cta.title}</h5>
                    {cta.badge && (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-primary/10 text-primary shrink-0">
                        {cta.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{cta.description}</p>
                </div>
              </div>
              <button
                onClick={cta.onButtonClick}
                className="w-full h-7 sm:h-7.5 rounded-lg bg-primary hover:bg-primary/90 active:scale-[0.98] text-white text-[11px] font-medium transition-all shadow-xs shadow-primary/15 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{cta.buttonText}</span>
                <ExternalLink size={11} className="opacity-80" />
              </button>
            </div>
          </div>
        )}

        {/* Nút mở rộng ở cuối cùng khi thu gọn */}
        {isCollapsed && (
          <div className={cn('p-4 shrink-0 flex justify-center border-t', isLight ? 'border-slate-100' : 'border-slate-800/50')}>
            <button
              onClick={() => setIsCollapsed(false)}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer',
                isLight
                  ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                  : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white',
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  },
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
export { Sidebar };
