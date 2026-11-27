'use client';

import React from 'react';
import { cn } from '@/utils';
import { ChevronDown, Plus } from 'lucide-react';
import { Avatar } from '@/components';

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
  customRender?: (isCollapsed: boolean, activeId?: string) => React.ReactNode;
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
  /** Khối cố định ở đáy sidebar (ví dụ menu người dùng) */
  footer?: React.ReactNode;
  variant?: 'light' | 'dark';
  onUserClick?: () => void;
}

const ROW =
  'flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-rm px-3 text-left text-[13px] transition-colors duration-(--rm-dur-fast) disabled:cursor-not-allowed disabled:opacity-40 active:bg-rm-primary-soft';

const COLLAPSED_KEY = 'xt-sidebar-collapsed';

// Nhóm đã gập nhớ theo trình duyệt (chỉ là tiện ích, không bắt buộc)
function readCollapsed(): string[] {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// Giao diện sidebar theo /remake: nền trắng, viền mảnh, mục đang chọn nền primary-soft. Menu phẳng, không lồng nhau.
const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ sections = [], activeId, onItemSelect, brand, user, footer, className, onUserClick, ...props }, ref) => {
    const baseId = React.useId();
    const [collapsed, setCollapsed] = React.useState<string[]>([]);
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
      setCollapsed(readCollapsed());
      setLoaded(true);
    }, []);

    // Nhóm chứa trang đang mở luôn được mở
    React.useEffect(() => {
      if (!loaded) return;
      const group = sections.find((sec) => sec.title && sec.items.some((i) => i.id === activeId));
      if (group?.title) setCollapsed((prev) => (prev.includes(group.title!) ? prev.filter((t) => t !== group.title) : prev));
    }, [loaded, activeId, sections]);

    const toggle = (title: string) => {
      setCollapsed((prev) => {
        const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
        try {
          localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
        } catch {
          /* không lưu được thì bỏ qua */
        }
        return next;
      });
    };

    return (
      <div
        ref={ref}
        className={cn('flex w-rm-sidebar select-none flex-col border-r border-rm-line bg-rm-surface font-body text-rm-text', className)}
        {...props}
      >
        {(brand || user) && (
          <button
            type="button"
            onClick={() => (brand?.onClick ? brand.onClick() : onUserClick?.())}
            className="flex h-16 flex-none cursor-pointer items-center gap-3 border-b border-rm-line px-4 text-left"
          >
            {brand ? (
              <>
                {typeof brand.logo === 'string' ? (
                  <img src={brand.logo} alt={brand.name || 'Brand'} className="size-8 flex-none object-contain" />
                ) : (
                  <span className="flex size-8 flex-none items-center justify-center">{brand.logo}</span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-heading text-base font-semibold leading-5 text-rm-primary">{brand.name || 'XTTECH'}</span>
                  {brand.subtitle && <span className="block truncate text-xs leading-4 text-rm-muted">{brand.subtitle}</span>}
                </span>
              </>
            ) : (
              user && (
                <>
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-rm-text">{user.name}</span>
                    <span className="block truncate text-xs text-rm-muted">{user.role}</span>
                  </span>
                </>
              )
            )}
          </button>
        )}

        <nav aria-label="Điều hướng chính" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, sIdx) => {
            const title = section.title;
            const isOpen = !title || !collapsed.includes(title);
            const listId = `${baseId}-${sIdx}`;
            return (
              <div key={title ?? sIdx} className={cn(sIdx > 0 && 'mt-3')}>
                {title && (
                  <div className="mb-1 flex items-center justify-between">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      onClick={() => toggle(title)}
                      className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-rm px-3 text-left text-[13px] font-semibold text-rm-text hover:bg-rm-bg"
                    >
                      <span className="truncate">{title}</span>
                      <ChevronDown
                        size={14}
                        className={cn('flex-none text-rm-muted transition-transform duration-(--rm-dur-fast)', !isOpen && '-rotate-90')}
                      />
                    </button>
                    {section.showAddButton && (
                      <button
                        type="button"
                        aria-label={`Thêm vào ${title}`}
                        onClick={section.onAddClick}
                        className="ml-1 flex-none cursor-pointer rounded-rm p-0.5 text-rm-muted hover:bg-rm-bg"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-(--rm-dur) ease-rm',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <ul id={listId} inert={!isOpen} className="flex min-h-0 flex-col overflow-hidden">
                    {section.items.map((item) => {
                      if (item.customRender) return <li key={item.id}>{item.customRender(false, activeId)}</li>;
                      const active = activeId === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            disabled={item.disabled}
                            title={item.label}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => onItemSelect?.(item)}
                            className={cn(ROW, active ? 'bg-rm-primary-soft font-medium text-rm-primary' : 'text-rm-text hover:bg-rm-bg')}
                          >
                            {item.icon && <span className="flex-none">{item.icon}</span>}
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        {footer && <div className="flex-none border-t border-rm-line p-2">{footer}</div>}
      </div>
    );
  },
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
export { Sidebar };
