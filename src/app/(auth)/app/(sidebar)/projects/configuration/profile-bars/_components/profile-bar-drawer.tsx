'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import type { ProfileBar } from '@/types';
import { CopyToOrg, SystemTag } from '../../_components/shared-catalog';
import { BAR_TYPE_MAP } from './profile-bar-config';
import { groupCompanionsByWay } from './profile-companion-utils';
import { SectionThumb, barTypeLabel, mm, weight } from './profile-bar-list';

interface Props {
  bar: ProfileBar | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (b: ProfileBar) => void;
  onCopy: (b: ProfileBar) => void;
  onDelete: (b: ProfileBar) => void;
}

// Xem nhanh một thanh profile. Sửa/sao chép dùng form đầy đủ nên đóng drawer rồi mở form.
export function ProfileBarDrawer({ bar: b, canCreate, canEdit, canDelete, onClose, onEdit, onCopy, onDelete }: Props) {
  const variants = b?.variants ?? [];
  const combos = b && !b.isFullCompanion ? groupCompanionsByWay(b.companions ?? [], b.code, b.name) : [];

  return (
    <Drawer isOpen={!!b} onClose={onClose} label="Chi tiết thanh profile">
      {b && (
        <>
          <DrawerHeader
            compact
            title="Thanh profile"
            onClose={onClose}
            actions={
              <>
                {b.isSystem && <CopyToOrg variant="icon" kind="profile-bar" id={b.id} name={b.name} onCopied={onClose} />}
                {canCreate && !b.isSystem && (
                  <IconAction label="Sao chép" onClick={() => onCopy(b)}>
                    <Copy size={16} />
                  </IconAction>
                )}
                {canEdit && !b.isSystem && (
                  <IconAction label="Sửa" onClick={() => onEdit(b)}>
                    <Pencil size={16} />
                  </IconAction>
                )}
                {canDelete && !b.isSystem && (
                  <IconAction label="Xóa" danger onClick={() => onDelete(b)}>
                    <Trash2 size={16} />
                  </IconAction>
                )}
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <div className="flex items-start gap-3">
                <SectionThumb bar={b} />
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">{b.name}</h3>
                  <p className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag tone="blue">{b.code || '–'}</Tag>
                    {b.isSystem && <SystemTag />}
                    <Tag tone="violet">{barTypeLabel(b)}</Tag>
                    {b.isFullCompanion && <Tag tone="amber">Combine toàn phần</Tag>}
                    {b.isVirtual && <Tag tone="teal">Ảo</Tag>}
                    {b.isActive === false && <Tag>Tạm ngưng</Tag>}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <DrawerSection title="Thông số">
                  <InfoRow label="Hệ nhôm">{b.doorSeries?.name || b.doorSeries?.code || '–'}</InfoRow>
                  <InfoRow label="Chiều dài thanh">{`${b.barLengthMm || 6000} mm`}</InfoRow>
                  <InfoRow label="Chiều cao mặt cắt">{b.sectionHeightMm ? `${b.sectionHeightMm} mm` : '–'}</InfoRow>
                  <InfoRow label="Tỷ trọng">{weight(b)}</InfoRow>
                </DrawerSection>

                <DrawerSection title="Trừ kích thước (mm)">
                  <InfoRow label="Trừ cánh">{mm(b.deductSashMm)}</InfoRow>
                  <InfoRow label="Trừ đố">{mm(b.deductMullionMm)}</InfoRow>
                  <InfoRow label="Trừ nẹp">{mm(b.deductBeadMm)}</InfoRow>
                  <InfoRow label="Trừ kính">{mm(b.deductGlassMm)}</InfoRow>
                </DrawerSection>

                {variants.length > 0 && (
                  <DrawerSection title={`Biến thể (${variants.length})`}>
                    {variants.map((v, i) => (
                      <InfoRow key={v.id ?? i} label={BAR_TYPE_MAP[v.role?.toUpperCase()] || v.role}>
                        {v.code || `${b.code}-${v.role}`}
                        {v.name ? ` · ${v.name}` : ''}
                      </InfoRow>
                    ))}
                  </DrawerSection>
                )}

                {combos.length > 0 && (
                  <DrawerSection title={`Combine (${combos.length})`}>
                    {combos.map((g) => (
                      <InfoRow key={g.groupId} label={g.code || `${b.code}+combine`}>
                        {g.items.map((it) => `${it.companionCode || 'Thanh kèm'} · ${it.offsetMm ?? 0}mm × ${it.qty ?? 1}`).join('; ')}
                      </InfoRow>
                    ))}
                  </DrawerSection>
                )}

                {b.note && (
                  <DrawerSection title="Ghi chú">
                    <p className="text-sm text-slate-900 [overflow-wrap:anywhere]">{b.note}</p>
                  </DrawerSection>
                )}
              </div>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
