'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { PERMISSION_LABELS, PERMISSION_SCOPES, PLATFORM_ONLY_CODES, type PermissionCode, type PermissionScope } from '@/generated/permissions';
import { PERSONAS } from '@/generated/personas';
import { Button, SearchField, Select, Tag } from '@/components-remake';
import { useAuthStore, useMeStore } from '@/stores';
import { PermissionRows, type PermissionMap } from './permission-rows';

const STORAGE_KEY = 'xt-dev-permission-panel';
const DEMO_ORG = 'demo';
const DEMO_PASSWORD = 'demo1234';
const ALL_CODES = (Object.keys(PERMISSION_LABELS) as PermissionCode[]).filter((c) => !PLATFORM_ONLY_CODES.includes(c));
const widest = (code: PermissionCode) => PERMISSION_SCOPES[code][PERMISSION_SCOPES[code].length - 1];

const toMap = (list: { code: string; scope: PermissionScope }[]) => Object.fromEntries(list.map((p) => [p.code, p.scope])) as PermissionMap;
const toList = (m: PermissionMap) => Object.entries(m).map(([code, scope]) => ({ code, scope: scope as PermissionScope }));
const diffCount = (a: PermissionMap, b: PermissionMap) => ALL_CODES.filter((c) => a[c] !== b[c]).length;

// Component chỉ nạp phía client (ssr: false) nên đọc sessionStorage ngay khi khởi tạo state
function readSaved() {
  const empty = { perms: {} as PermissionMap, touched: false };
  try {
    const v = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!v) return empty;
    return { perms: (v.touched ? v.perms : {}) ?? {}, touched: !!v.touched };
  } catch {
    return empty;
  }
}

// Cột phải chỉ dev: đăng nhập thật bằng tài khoản demo (dữ liệu và cờ `_can` theo người đó),
// và tuỳ chọn bật/tắt từng quyền để thử nhanh; phần chỉnh ghi vào useMeStore và giao diện đổi ngay.
export function DevPermissionPanel() {
  const realMe = useMeStore((s) => s.realMe);
  const setOverride = useMeStore((s) => s.setOverride);
  const [saved] = useState(readSaved);
  // Ở dev luôn mở cột này mỗi lần tải trang; điện thoại/máy tính bảng nhỏ thì đóng để không che trang (cột phủ kín màn)
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [perms, setPerms] = useState<PermissionMap>(saved.perms);
  const [touched, setTouched] = useState(saved.touched);
  const [keyword, setKeyword] = useState('');

  const username = useAuthStore((s) => s.user?.username);
  const current = PERSONAS.find((p) => p.username === username)?.key ?? '';
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState(false);
  const baseline = useMemo(() => toMap(realMe?.permissions ?? []), [realMe]);

  // Đẩy quyền đang chỉnh vào store; chưa chỉnh gì so với quyền thật thì bỏ ghi đè
  useEffect(() => {
    if (!touched || !realMe) return;
    if (diffCount(perms, baseline) === 0) setOverride(null);
    else setOverride({ key: 'edited', permissions: toList(perms), roles: realMe.roles });
  }, [touched, realMe, perms, baseline, setOverride]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ perms, touched }));
    } catch {
      /* bỏ qua */
    }
  }, [perms, touched]);

  const edit = (next: PermissionMap) => {
    setPerms(next);
    setTouched(true);
  };
  // Đăng nhập thật bằng tài khoản demo rồi tải lại trang để mọi dữ liệu và cờ _can lấy theo người đó
  const login = async (key: string) => {
    const p = PERSONAS.find((x) => x.key === key);
    if (!p) return;
    setSwitching(true);
    setError('');
    const ok = await useAuthStore.getState().signin(p.username, DEMO_PASSWORD, DEMO_ORG);
    if (!ok) {
      setSwitching(false);
      setError(`Không đăng nhập được ${p.username}`);
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
    window.location.reload();
  };
  const toggle = (code: PermissionCode) => {
    const next = { ...perms };
    if (next[code]) delete next[code];
    else next[code] = widest(code);
    edit(next);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở công cụ quyền (dev)"
        className="fixed right-0 top-1/2 z-50 -translate-y-1/2 cursor-pointer rounded-l-control border border-r-0 border-slate-200 bg-white px-2 py-4 font-heading text-xs font-semibold text-primary shadow-sm [writing-mode:vertical-rl]"
      >
        Quyền · Dev
      </button>
    );
  }

  return (
    <aside
      aria-label="Công cụ quyền (dev)"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white font-body text-slate-900 shadow-2xl lg:static lg:z-auto lg:w-80 lg:max-w-none lg:flex-none lg:shadow-none"
    >
      <div className="flex h-16 flex-none items-center justify-between gap-2 border-b border-slate-200 pl-4 pr-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate font-heading text-base font-semibold text-primary">Quyền</h2>
          <Tag tone="amber">DEV</Tag>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Đóng công cụ quyền"
          className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-500 active:bg-slate-100 md:hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-none flex-col gap-3 border-b border-slate-200 p-4">
        <Select
          label="Đăng nhập tài khoản demo"
          value={current}
          disabled={switching}
          loading={switching}
          placeholder={username ?? 'Chưa đăng nhập'}
          options={PERSONAS.map((p) => ({ value: p.key, label: p.username, hint: p.label }))}
          onChange={login}
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          {(realMe?.roles ?? []).map((r) => (
            <Tag key={r.code} tone="teal">
              {r.code}
            </Tag>
          ))}
          <span className="text-xs text-slate-600">
            {Object.keys(touched ? perms : baseline).length} quyền
            {touched && diffCount(perms, baseline) > 0 ? ` · ${diffCount(perms, baseline)} đã chỉnh` : ''}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="px-2" onClick={() => edit({ ...baseline })}>
            Đặt lại
          </Button>
          <Button variant="outline" className="px-2" onClick={() => edit({})}>
            Bỏ hết
          </Button>
          <Button variant="outline" className="px-2" onClick={() => edit(Object.fromEntries(ALL_CODES.map((c) => [c, widest(c)])))}>
            Cấp hết
          </Button>
        </div>
        <SearchField value={keyword} onChange={setKeyword} label="Tìm quyền" placeholder="Tìm quyền" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PermissionRows
          value={touched ? perms : baseline}
          baseline={baseline}
          keyword={keyword}
          onToggle={(code) => {
            if (!touched) setPerms({ ...baseline });
            toggle(code);
          }}
          onScope={(code, scope) => edit({ ...(touched ? perms : baseline), [code]: scope })}
        />
      </div>
    </aside>
  );
}
