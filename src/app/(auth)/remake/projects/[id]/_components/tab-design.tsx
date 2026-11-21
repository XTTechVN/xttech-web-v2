'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import {
  deleteProjectFloor,
  deleteProjectPosition,
  duplicateProjectPosition,
  getProjectFloors,
  getProjectPositions,
  updateProjectPosition,
} from '@/actions';
import { DoorStudioModal } from '@/components';
import { useCan } from '@/hooks';
import type { Door, ProjectDetail, ProjectDoorPosition } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { DesignPickSheet } from './design-pick-sheet';
import { PositionCard } from './design-position-card';
import { EditPositionSheet, FloorSheet, MeasureSheet, QrSheet } from './design-sheets';
import { useAct } from './use-act';

type Modal = null | { kind: 'edit' | 'measure' | 'qr'; pos: ProjectDoorPosition };

const ROW = 'flex min-h-rm-tap w-full items-center px-rm-gutter py-2 text-left text-sm active:bg-rm-bg disabled:opacity-50';

// Tab Thiết kế: tầng và vị trí cửa. Mỗi thao tác chỉ hiện khi có đúng quyền (tầng / vị trí cửa).
export function TabDesign({ project }: { project: ProjectDetail }) {
  const projectId = project.id;
  const { can } = useCan();
  const [floor, setFloor] = useState('');
  const [menu, setMenu] = useState<ProjectDoorPosition | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [picking, setPicking] = useState(false);
  const [addFloor, setAddFloor] = useState(false);
  const [studio, setStudio] = useState<ProjectDoorPosition | null>(null);
  const floors = useQuery({ queryKey: ['project', projectId, 'floors'], queryFn: () => getProjectFloors(projectId) });
  const pos = useQuery({ queryKey: ['project', projectId, 'positions'], queryFn: () => getProjectPositions(projectId, { limit: 9999 }) });
  const dup = useAct(projectId, (id: number) => duplicateProjectPosition(projectId, id), 'Đã nhân bản cửa');
  const del = useAct(projectId, (id: number) => deleteProjectPosition(projectId, id), 'Đã xoá cửa');
  const delFloor = useAct(
    projectId,
    (id: number) => deleteProjectFloor(projectId, id),
    'Đã xoá tầng',
    () => setFloor(''),
  );

  const saveStudio = useAct(
    projectId,
    (d: { width: number; height: number; type: string; name: string; doorSeriesId?: number | null; systemConfig: Record<string, unknown> }) =>
      updateProjectPosition(projectId, studio!.id, {
        width: d.width,
        height: d.height,
        doorType: d.type,
        description: d.name,
        doorSeriesId: d.doorSeriesId || undefined,
        systemConfig: d.systemConfig,
      }),
    'Đã cập nhật bản vẽ cửa',
  );
  const studioDoor: Door | null = studio
    ? {
        id: studio.id,
        name: studio.description || studio.code,
        code: studio.code,
        type: studio.doorType || 'door',
        doorSeriesId: studio.doorSeriesId || undefined,
        imagePath: null,
        specification: `${studio.width}×${studio.height}mm`,
        systemConfig: { ...((studio.systemConfig || {}) as Record<string, unknown>), w: studio.width, h: studio.height },
        createdAt: '',
        updatedAt: '',
      }
    : null;
  const canCreate = can('project_door_position:create');
  const canUpdate = can('project_door_position:update');
  const canDelete = can('project_door_position:delete');
  const all = pos.data?.items ?? [];
  const items = floor ? all.filter((p) => String(p.floorId) === floor) : all;
  const counts = new Map<number, number>();
  all.forEach((p) => counts.set(p.floorId, (counts.get(p.floorId) ?? 0) + 1));
  const fl = (floors.data ?? []).find((f) => String(f.id) === floor);
  const hasMenu = canUpdate || canCreate || canDelete || can('project_door_position:read');

  const chip = (value: string, label: string, n: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={floor === value}
      onClick={() => setFloor(value)}
      className={cn(
        'h-9 flex-none rounded-rm border px-3 text-sm',
        floor === value ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
      )}
    >
      {label} ({n})
    </button>
  );
  const run = (fn: () => void) => {
    setMenu(null);
    fn();
  };

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div role="group" aria-label="Lọc theo tầng" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1">
          {chip('', 'Tất cả', all.length)}
          {(floors.data ?? []).map((f) => chip(String(f.id), f.name, counts.get(f.id) ?? 0))}
        </div>
        {can('project_floor:create') && (
          <button type="button" onClick={() => setAddFloor(true)} className={`${BTN_LINE} flex-none px-3`}>
            + Tầng
          </button>
        )}
        {canCreate && can('door:read') && (
          <button type="button" onClick={() => setPicking(true)} className={`${BTN_PRIMARY} flex-none px-3`}>
            Mẫu cửa
          </button>
        )}
      </div>
      {fl && can('project_floor:delete') && (counts.get(fl.id) ?? 0) === 0 && (
        <button
          type="button"
          disabled={delFloor.isPending}
          onClick={() => window.confirm(`Xoá tầng "${fl.name}"?`) && delFloor.mutate(fl.id)}
          className="mb-3 flex h-rm-tap items-center gap-1 text-sm text-rm-danger"
        >
          <Trash2 size={16} aria-hidden="true" /> Xoá tầng {fl.name}
        </button>
      )}

      {pos.isLoading && <ListSkeleton />}
      {pos.isError && (
        <ErrorState title="Không tải được vị trí cửa" description="Thử lại sau." actionLabel="Thử lại" onAction={() => pos.refetch()} />
      )}
      {pos.data && items.length === 0 && (
        <EmptyState title="Chưa có cửa" description={canCreate ? 'Chọn mẫu cửa để thêm vào dự án.' : 'Dự án chưa có vị trí cửa nào.'} />
      )}
      {items.length > 0 && (
        <>
          <p className="mb-2 text-sm text-rm-muted">{items.length} vị trí cửa</p>
          <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))] xl:grid-cols-[repeat(4,minmax(0,1fr))]">
            {items.map((p) => (
              <PositionCard key={p.id} p={p} onMenu={hasMenu ? () => setMenu(p) : undefined} />
            ))}
          </ul>
        </>
      )}

      <Sheet open={!!menu} onClose={() => setMenu(null)} title={menu ? `Cửa ${menu.code}` : 'Thao tác'}>
        {menu && (
          <ul className="py-1">
            {canUpdate && (
              <li>
                <button type="button" className={ROW} onClick={() => run(() => setModal({ kind: 'edit', pos: menu }))}>
                  Sửa thông tin
                </button>
              </li>
            )}
            {canUpdate && (
              <li>
                <button type="button" className={ROW} onClick={() => run(() => setStudio(menu))}>
                  Mở bản vẽ
                </button>
              </li>
            )}
            {canUpdate && (
              <li>
                <button type="button" className={ROW} onClick={() => run(() => setModal({ kind: 'measure', pos: menu }))}>
                  Đo thực tế
                </button>
              </li>
            )}
            <li>
              <button type="button" className={ROW} onClick={() => run(() => setModal({ kind: 'qr', pos: menu }))}>
                Mã QR
              </button>
            </li>
            {canCreate && (
              <li>
                <button type="button" className={ROW} disabled={dup.isPending} onClick={() => run(() => dup.mutate(menu.id))}>
                  Nhân bản
                </button>
              </li>
            )}
            {canDelete && (
              <li>
                <button
                  type="button"
                  className={`${ROW} text-rm-danger`}
                  onClick={() => run(() => window.confirm(`Xoá cửa ${menu.code}?`) && del.mutate(menu.id))}
                >
                  Xoá
                </button>
              </li>
            )}
          </ul>
        )}
      </Sheet>

      <EditPositionSheet
        key={modal?.kind === 'edit' ? `e-${modal.pos.id}` : 'edit-idle'}
        projectId={projectId}
        pos={modal?.kind === 'edit' ? modal.pos : null}
        floors={floors.data ?? []}
        onClose={() => setModal(null)}
      />
      <MeasureSheet
        key={modal?.kind === 'measure' ? `m-${modal.pos.id}` : 'measure-idle'}
        projectId={projectId}
        pos={modal?.kind === 'measure' ? modal.pos : null}
        onClose={() => setModal(null)}
      />
      {canUpdate && (
        <DoorStudioModal
          isOpen={!!studio}
          onClose={() => setStudio(null)}
          door={studioDoor}
          onCustomSave={async (d) => {
            await saveStudio.mutateAsync(d);
          }}
        />
      )}
      <QrSheet pos={modal?.kind === 'qr' ? modal.pos : null} onClose={() => setModal(null)} />
      <FloorSheet key={addFloor ? 'f-new' : 'f-idle'} projectId={projectId} open={addFloor} onClose={() => setAddFloor(false)} />
      <DesignPickSheet
        key={picking ? 'pick-open' : 'pick-idle'}
        open={picking}
        onClose={() => setPicking(false)}
        project={project}
        floors={floors.data ?? []}
        floorId={floor}
      />
    </>
  );
}
