'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, KeyRound, LogOut, UserPen } from 'lucide-react';
import { getRemakeSections } from '../_components/remake-menu';
import { useCan } from '@/hooks';
import { useAuthStore, useMeStore } from '@/stores';
import { getFileUrl } from '@/utils';
import { PasswordSheet, ProfileSheet } from './profile-sheets';

// Đã có trên thanh tab dưới nên không lặp lại trong "Tôi"
const IN_NAV = new Set(['dashboard', 'projects', 'attendances-root', 'attendance-history']);

const ROW =
  'flex min-h-rm-tap w-full items-center gap-3 px-rm-gutter py-2 text-left text-sm transition-[background-color] duration-(--rm-dur-fast) active:bg-rm-bg md:hover:bg-rm-bg';
const ICON_BOX = 'flex size-8 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary';

function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      {title && <h2 className="mb-1 px-1 text-xs font-medium text-rm-muted">{title}</h2>}
      <ul className="divide-y divide-rm-line overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">{children}</ul>
    </section>
  );
}

// Trang "Tôi": thẻ cá nhân trên cùng, bên dưới là các khối chức năng (điện thoại) và tài khoản
export default function RemakeMePage() {
  const me = useMeStore((s) => s.me);
  const { access, isReady } = useCan();
  const [leaving, setLeaving] = useState(false);
  const [sheet, setSheet] = useState<'profile' | 'password' | null>(null);
  const sections = useMemo(
    () =>
      isReady
        ? getRemakeSections(access)
            .map((s) => ({ ...s, items: s.items.filter((i) => !IN_NAV.has(i.id)) }))
            .filter((s) => s.items.length > 0)
        : [],
    [access, isReady],
  );

  const logout = async () => {
    setLeaving(true);
    await useAuthStore.getState().signout();
    useMeStore.getState().clear();
  };

  const name = me?.user.fullName || me?.user.username || '';

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <header className="flex flex-col items-center gap-1 pt-2 text-center">
        <span className="flex size-20 flex-none items-center justify-center overflow-hidden rounded-full bg-rm-primary-soft font-heading text-2xl font-semibold text-rm-primary">
          {me?.user.avatar ? <img src={getFileUrl(me.user.avatar)} alt="" className="size-full object-cover" /> : name.charAt(0).toUpperCase() || '·'}
        </span>
        {me ? (
          <>
            <h1 className="max-w-full truncate font-heading text-xl font-semibold">{name}</h1>
            <p className="max-w-full truncate text-sm text-rm-muted">{me.user.email}</p>
            <p className="max-w-full truncate text-xs text-rm-muted">
              {me.org.name} · {me.roles.map((r) => r.name).join(', ') || 'Chưa có vai trò'}
            </p>
          </>
        ) : (
          <div aria-busy="true" aria-label="Đang tải" className="mt-1 h-14 w-48 animate-rm-pulse rounded-rm bg-rm-line" />
        )}
      </header>

      <Block title="Tài khoản">
        <li>
          <button type="button" onClick={() => setSheet('profile')} className={ROW}>
            <span className={ICON_BOX}>
              <UserPen size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate">Sửa hồ sơ</span>
            <ChevronRight size={18} className="flex-none text-rm-muted" />
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setSheet('password')} className={ROW}>
            <span className={ICON_BOX}>
              <KeyRound size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate">Đổi mật khẩu</span>
            <ChevronRight size={18} className="flex-none text-rm-muted" />
          </button>
        </li>
      </Block>

      {sections.map((s) => (
        <div key={s.title} className="md:hidden">
          <Block title={s.title}>
            {s.items.map((i) => (
              <li key={i.id}>
                <Link href={i.href ?? '#'} className={ROW}>
                  <span className={ICON_BOX}>{i.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{i.label}</span>
                  <ChevronRight size={18} className="flex-none text-rm-muted" />
                </Link>
              </li>
            ))}
          </Block>
        </div>
      ))}

      <Block>
        <li>
          <button type="button" onClick={logout} disabled={leaving} className={`${ROW} text-rm-danger disabled:opacity-60`}>
            <span className="flex size-8 flex-none items-center justify-center">
              <LogOut size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate">{leaving ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
          </button>
        </li>
      </Block>

      <ProfileSheet key={sheet === 'profile' ? 'pf-open' : 'pf'} open={sheet === 'profile'} onClose={() => setSheet(null)} />
      <PasswordSheet key={sheet === 'password' ? 'pw-open' : 'pw'} open={sheet === 'password'} onClose={() => setSheet(null)} />
    </div>
  );
}
