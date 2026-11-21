'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignatureInput } from '@/types';
import { Field, INPUT } from '../../_components/form';

// Ô ký tay bằng cảm ứng / chuột; trả ảnh PNG (data URL) khi đã có nét ký.
function Pad({ onChange }: { onChange: (png: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * e.currentTarget.width, ((e.clientY - r.top) / r.height) * e.currentTarget.height] as const;
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget.getContext('2d');
    if (!c) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.strokeStyle = '#111';
    c.beginPath();
    c.moveTo(...pt(e));
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = e.currentTarget.getContext('2d');
    c?.lineTo(...pt(e));
    c?.stroke();
  };
  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    setEmpty(false);
    onChange(e.currentTarget.toDataURL('image/png'));
  };
  const clear = () => {
    const c = ref.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={ref}
        width={600}
        height={220}
        aria-label="Ô ký tay"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="h-40 w-full touch-none rounded-rm border border-dashed border-rm-line bg-white"
      />
      <button type="button" onClick={clear} disabled={empty} className="mt-1 h-rm-tap text-sm text-rm-primary disabled:text-rm-muted">
        Xoá chữ ký
      </button>
    </div>
  );
}

// Họ tên + chức danh + ô ký tay; chỉ báo chữ ký khi đủ thông tin.
export function SignatureFields({
  id,
  title,
  defaultTitle,
  onChange,
}: {
  id: string;
  title: string;
  defaultTitle?: string;
  onChange: (s: SignatureInput | null) => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(defaultTitle ?? '');
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    onChange(img && name.trim().length >= 2 ? { signerName: name.trim(), signerTitle: role.trim() || undefined, signatureImage: img } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, role, img]);
  return (
    <fieldset className="flex flex-col gap-3 rounded-rm-xl border border-rm-line p-3">
      <legend className="px-1 text-sm font-medium">{title}</legend>
      <Field label="Họ tên" id={`${id}-name`}>
        <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
      </Field>
      <Field label="Chức danh" id={`${id}-role`}>
        <input id={`${id}-role`} value={role} onChange={(e) => setRole(e.target.value)} className={INPUT} />
      </Field>
      <Pad onChange={setImg} />
    </fieldset>
  );
}
