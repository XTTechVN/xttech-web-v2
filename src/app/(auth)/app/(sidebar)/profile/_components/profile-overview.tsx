import { Avatar } from '@/components';
import { Button, InfoRow, Tag } from '@/components-remake';
import { Mail, MapPin, Pencil } from 'lucide-react';
import { getFileUrl } from '@/utils';
import type { AuthUser } from '@/types';

const GENDER: Record<string, string> = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const EMPTY = <span className="text-slate-400">Chưa cập nhật</span>;

const formatDate = (iso?: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN') : null);
// Che số giấy tờ, chỉ để lại 3 số cuối
const maskId = (code?: string | null) => (code ? `${'•'.repeat(Math.max(code.length - 3, 0))}${code.slice(-3)}` : null);

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-block border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="mb-3 font-heading text-sm font-semibold text-slate-900">{title}</h2>
      <dl className="flex flex-col gap-3">{children}</dl>
    </section>
  );
}

function tenure(iso?: string | null) {
  if (!iso) return null;
  const months = Math.max(0, Math.floor((Date.now() - new Date(`${iso}T00:00:00`).getTime()) / (30.44 * 86400000)));
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return { value: String(m), unit: 'tháng' };
  return { value: String(y), unit: m ? `năm ${m} tháng` : 'năm' };
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="truncate font-heading text-xl font-medium text-slate-900 md:text-2xl">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-slate-500 md:text-sm">{unit}</span>}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500 md:text-sm">{label}</p>
    </div>
  );
}

// Thẻ đầu trang: ảnh bìa, ảnh đại diện, tên, chức vụ, liên hệ và ba số liệu thật từ hồ sơ
export function ProfileHeader({ user, onEdit }: { user: AuthUser; onEdit?: () => void }) {
  const displayName = user.fullName || user.username;
  const roles = user.roles ?? [];
  const positions = user.positions ?? [];
  const title = positions.map((p) => p.name).join(' · ');
  const seniority = tenure(user.joinedAt);
  return (
    <section className="overflow-hidden rounded-block border border-slate-200 bg-white">
      <div className="h-24 bg-primary/15 md:h-36" aria-hidden="true" />
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="-mt-10 flex min-w-0 flex-col gap-3 md:-mt-14 md:flex-row md:items-end md:justify-between md:gap-4">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:gap-4">
            <Avatar
              src={user.avatar ? getFileUrl(user.avatar) : undefined}
              name={displayName}
              className="h-20 w-20 flex-none text-2xl ring-4 ring-white md:h-28 md:w-28 md:text-3xl"
            />
            <div className="min-w-0 md:pb-1">
              <h2 className="truncate font-heading text-lg font-semibold text-slate-900 md:text-xl">{displayName}</h2>
              {title && <p className="truncate text-sm text-slate-700">{title}</p>}
              <div className="mt-1 flex min-w-0 flex-col gap-1 text-xs text-slate-500 md:flex-row md:flex-wrap md:gap-x-4">
                {user.address && (
                  <span className="flex min-w-0 items-center gap-1">
                    <MapPin size={14} className="flex-none" />
                    <span className="truncate">{user.address}</span>
                  </span>
                )}
                {user.email && (
                  <span className="flex min-w-0 items-center gap-1">
                    <Mail size={14} className="flex-none" />
                    <span className="truncate">{user.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" icon={<Pencil size={16} />} onClick={onEdit} className="flex-none self-start md:self-auto">
              Chỉnh sửa
            </Button>
          )}
        </div>

        {roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Tag key={r.id} tone="teal">
                {r.name}
              </Tag>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-[repeat(3,minmax(0,1fr))] divide-x divide-slate-200 border-t border-slate-200 pt-4">
          <Stat value={seniority?.value ?? '—'} unit={seniority?.unit} label="Thâm niên" />
          <Stat value={String(positions.length)} label="Chức vụ" />
          <Stat value={String(roles.length)} label="Vai trò" />
        </div>
      </div>
    </section>
  );
}

export function ProfileDetails({ user }: { user: AuthUser }) {
  const positions = user.positions ?? [];
  return (
    <div className="flex flex-col gap-4">
      <Block title="Thông tin cá nhân">
        <InfoRow label="Họ và tên">{user.fullName || EMPTY}</InfoRow>
        <InfoRow label="Tên đăng nhập">{user.username}</InfoRow>
        <InfoRow label="Email">{user.email || EMPTY}</InfoRow>
        <InfoRow label="Số điện thoại">{user.phoneNumber || EMPTY}</InfoRow>
        <InfoRow label="Giới tính">{GENDER[user.gender] ?? EMPTY}</InfoRow>
        <InfoRow label="Ngày sinh">{formatDate(user.birthday) ?? EMPTY}</InfoRow>
        <InfoRow label="Địa chỉ">{user.address || EMPTY}</InfoRow>
      </Block>
      <Block title="Công việc">
        <InfoRow label="Chức vụ">
          {positions.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {positions.map((p) => (
                <li key={p.id}>
                  {p.name}
                  {p.department?.name && <span className="text-slate-500"> · {p.department.name}</span>}
                </li>
              ))}
            </ul>
          ) : (
            EMPTY
          )}
        </InfoRow>
        <InfoRow label="Ngày vào làm">{formatDate(user.joinedAt) ?? EMPTY}</InfoRow>
        <InfoRow label="Số định danh">{maskId(user.identifyCode) ?? EMPTY}</InfoRow>
      </Block>
    </div>
  );
}
