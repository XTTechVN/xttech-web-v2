'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tabs, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Department } from '@/types';
import { MembersSection } from '../detail/members-section';
import { PositionsSection } from '../detail/positions-section';
import { ShiftsSection } from '../detail/shifts-section';
import { DEPARTMENT_FORM_ID, DepartmentForm } from './department-form';
import { formatDate } from './list';

type TabKey = 'info' | 'members' | 'positions' | 'shifts';

interface Props {
  department: Department | null;
  onClose: () => void;
  onDelete: (d: Department) => void;
}

// Xem nhanh một phòng ban; bấm Sửa thì chính drawer này chuyển sang ô nhập
export function DepartmentDrawer({ department: d, onClose, onDelete }: Props) {
  const { can } = useCan();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<TabKey>('info');

  const close = () => {
    setEditing(false);
    setTab('info');
    onClose();
  };

  return (
    <Drawer isOpen={!!d} onClose={close} label={d?.name ?? 'Phòng ban'} width={480}>
      {d && (
        <>
          <DrawerHeader
            compact
            title={editing ? 'Chỉnh sửa phòng ban' : d.name}
            onClose={close}
            actions={
              !editing && (
                <>
                  {can('department:update') && (
                    <IconAction label="Sửa" onClick={() => setEditing(true)}>
                      <Pencil size={16} />
                    </IconAction>
                  )}
                  {can('department:delete') && (
                    <IconAction label="Xóa" danger onClick={() => onDelete(d)}>
                      <Trash2 size={16} />
                    </IconAction>
                  )}
                </>
              )
            }
          />
          {!editing && (
            <Tabs
              label="Mục của phòng ban"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'info', label: 'Thông tin' },
                ...(can('user:read') ? [{ value: 'members' as const, label: 'Thành viên' }] : []),
                ...(can('position:read') ? [{ value: 'positions' as const, label: 'Chức vụ' }] : []),
                ...(can('work_shift:read') ? [{ value: 'shifts' as const, label: 'Ca làm việc' }] : []),
              ]}
            />
          )}
          <DrawerBody>
            {editing ? (
              <div className="pt-4">
                <DepartmentForm key={d.id} initialData={d} onDone={() => setEditing(false)} onPendingChange={setPending} />
              </div>
            ) : (
              <div className="pt-4">
                {tab === 'info' && (
                  <DrawerSection>
                    <InfoRow label="Tên phòng ban">{d.name}</InfoRow>
                    <InfoRow label="Mã phòng ban">{d.code ? <Tag>{d.code}</Tag> : '–'}</InfoRow>
                    <InfoRow label="Ngày tạo">{formatDate(d.createdAt)}</InfoRow>
                  </DrawerSection>
                )}
                {tab === 'members' && can('user:read') && <MembersSection departmentId={d.id} />}
                {tab === 'positions' && can('position:read') && <PositionsSection departmentId={d.id} />}
                {tab === 'shifts' && can('work_shift:read') && <ShiftsSection departmentId={d.id} departmentName={d.name} />}
              </div>
            )}
          </DrawerBody>
          {editing && (
            <DrawerFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="flex-1 md:flex-none" disabled={pending} onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button type="submit" form={DEPARTMENT_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
                  Lưu
                </Button>
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
