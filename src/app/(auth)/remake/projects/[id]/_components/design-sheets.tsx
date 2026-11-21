'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { measureProjectPosition, updateProjectPosition, createProjectFloor, getPositionQrImage } from '@/actions';
import type { ProjectDoorPosition, ProjectFloor } from '@/types';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';
import { useAct } from './use-act';

const num = (v: string) => v.replace(/\D/g, '');

// Sửa thông tin cơ bản của vị trí cửa (mã, tầng, mô tả, loại, kích thước).
export function EditPositionSheet({
  projectId,
  pos,
  floors,
  onClose,
}: {
  projectId: number;
  pos: ProjectDoorPosition | null;
  floors: ProjectFloor[];
  onClose: () => void;
}) {
  const [f, setF] = useState({
    code: pos?.code ?? '',
    desc: pos?.description ?? '',
    floor: String(pos?.floorId ?? ''),
    type: pos?.doorType ?? 'door',
    w: String(pos?.width ?? ''),
    h: String(pos?.height ?? ''),
  });
  const save = useAct(
    projectId,
    () =>
      updateProjectPosition(projectId, pos!.id, {
        code: f.code.trim(),
        description: f.desc.trim() || undefined,
        floorId: Number(f.floor),
        doorType: f.type,
        width: Number(f.w),
        height: Number(f.h),
        revision: pos!.revision,
      }),
    'Đã cập nhật cửa',
    onClose,
  );
  return (
    <Sheet open={!!pos} onClose={onClose} title={`Sửa cửa ${pos?.code ?? ''}`}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Mã cửa" id="ep-code">
          <input id="ep-code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Tầng" id="ep-floor">
          <Select
            id="ep-floor"
            label="Tầng"
            value={f.floor}
            onChange={(v) => setF({ ...f, floor: v })}
            options={floors.map((x) => ({ value: String(x.id), label: x.name }))}
          />
        </Field>
        <Field label="Loại" id="ep-type">
          <Select
            id="ep-type"
            label="Loại"
            value={f.type}
            onChange={(v) => setF({ ...f, type: v })}
            options={[
              { value: 'door', label: 'Cửa đi' },
              { value: 'window', label: 'Cửa sổ' },
            ]}
          />
        </Field>
        <Field label="Mô tả" id="ep-desc">
          <input id="ep-desc" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} className={INPUT} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Rộng (mm)" id="ep-w">
            <input id="ep-w" inputMode="numeric" value={f.w} onChange={(e) => setF({ ...f, w: num(e.target.value) })} className={INPUT} />
          </Field>
          <Field label="Cao (mm)" id="ep-h">
            <input id="ep-h" inputMode="numeric" value={f.h} onChange={(e) => setF({ ...f, h: num(e.target.value) })} className={INPUT} />
          </Field>
        </div>
        <button type="submit" disabled={save.isPending || !f.code.trim() || Number(f.w) < 100 || Number(f.h) < 100} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </form>
    </Sheet>
  );
}

// Ghi số đo thực tế tại công trình; vượt dung sai hợp đồng thì cảnh báo nhưng vẫn lưu.
export function MeasureSheet({ projectId, pos, onClose }: { projectId: number; pos: ProjectDoorPosition | null; onClose: () => void }) {
  const [w, setW] = useState(String(pos?.width ?? ''));
  const [h, setH] = useState(String(pos?.height ?? ''));
  const [note, setNote] = useState(pos?.measureNote ?? '');
  const [warn, setWarn] = useState('');
  const qc = useQueryClient();
  const save = useAct(
    projectId,
    async () => {
      const res = await measureProjectPosition(projectId, pos!.id, { width: Number(w), height: Number(h), measureNote: note.trim() || undefined });
      if (res.toleranceExceeded && res.warningMessage) {
        setWarn(res.warningMessage);
        qc.invalidateQueries({ queryKey: ['project', projectId] });
        throw new Error(`Đã lưu số đo nhưng ${res.warningMessage}`);
      }
      return res;
    },
    'Đã ghi số đo thực tế',
    onClose,
  );
  return (
    <Sheet open={!!pos} onClose={onClose} title={`Đo thực tế ${pos?.code ?? ''}`}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <p className="rounded-rm bg-rm-bg px-3 py-2 text-sm">
          Thiết kế:{' '}
          <strong>
            {pos?.width} × {pos?.height} mm
          </strong>
        </p>
        {warn && (
          <p role="alert" className="rounded-rm bg-rm-warning-soft px-3 py-2 text-sm text-rm-warning">
            {warn}
          </p>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Rộng thực tế (mm)" id="ms-w">
            <input id="ms-w" inputMode="numeric" value={w} onChange={(e) => setW(num(e.target.value))} className={INPUT} />
          </Field>
          <Field label="Cao thực tế (mm)" id="ms-h">
            <input id="ms-h" inputMode="numeric" value={h} onChange={(e) => setH(num(e.target.value))} className={INPUT} />
          </Field>
        </div>
        <Field label="Ghi chú hiện trường" id="ms-note">
          <input id="ms-note" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
        </Field>
        <button type="submit" disabled={save.isPending || !Number(w) || !Number(h)} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Xác nhận số đo'}
        </button>
      </form>
    </Sheet>
  );
}

// Thêm tầng mới cho dự án.
export function FloorSheet({ projectId, open, onClose }: { projectId: number; open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const add = useAct(projectId, () => createProjectFloor(projectId, { name: name.trim() }), 'Đã thêm tầng', onClose);
  return (
    <Sheet open={open} onClose={onClose} title="Thêm tầng">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Field label="Tên tầng" id="fl-name">
          <input id="fl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tầng 2" className={INPUT} />
        </Field>
        <button type="submit" disabled={add.isPending || !name.trim()} className={BTN_PRIMARY}>
          {add.isPending ? 'Đang lưu…' : 'Thêm tầng'}
        </button>
      </form>
    </Sheet>
  );
}

// Mã QR dán lên bộ cửa; ảnh cần token nên tải dạng blob.
export function QrSheet({ pos, onClose }: { pos: ProjectDoorPosition | null; onClose: () => void }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!pos) return;
    let live = true;
    let made = '';
    getPositionQrImage(pos.projectId, pos.id)
      .then((u) => {
        made = u;
        if (live) setSrc(u);
        else URL.revokeObjectURL(u);
      })
      .catch(() => live && setSrc(''));
    return () => {
      live = false;
      setSrc('');
      if (made) URL.revokeObjectURL(made);
    };
  }, [pos]);
  const print = () => {
    if (!src || !pos) return;
    const w = window.open('', '_blank', 'width=420,height=520');
    if (!w) return;
    w.document.write(
      `<html><head><title>${pos.code}</title></head><body style="text-align:center;font-family:sans-serif"><img src="${src}" style="width:300px"/><h2 style="margin:4px 0">${pos.code}</h2><div>${pos.width} × ${pos.height} mm</div></body></html>`,
    );
    w.document.close();
    w.onload = () => w.print();
  };
  return (
    <Sheet open={!!pos} onClose={onClose} title={`Mã QR ${pos?.code ?? ''}`}>
      <div className="flex flex-col items-center gap-4 p-rm-gutter text-center">
        <div className="flex size-52 items-center justify-center rounded-rm-xl border border-rm-edge bg-white p-2">
          {src ? (
            <img src={src} alt={`QR ${pos?.code}`} className="size-full object-contain" />
          ) : (
            <span className="text-sm text-rm-muted">Đang tải…</span>
          )}
        </div>
        <p className="text-sm font-medium">
          {pos?.width} × {pos?.height} mm
        </p>
        <p className="text-xs text-rm-muted">Dán lên bộ cửa. Quét mã sẽ mở trang chi tiết của cửa (số đo, tiến độ).</p>
        <button type="button" onClick={print} disabled={!src} className={`${BTN_LINE} w-full`}>
          In tem
        </button>
      </div>
    </Sheet>
  );
}
