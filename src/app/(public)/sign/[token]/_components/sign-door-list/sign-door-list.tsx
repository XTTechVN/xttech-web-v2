'use client';

import { useMemo, useState } from 'react';
import { SIGN_ITEMS_HEADING } from '@/config';
import type { PublicSigningItem, PublicSigningSubject } from '@/types';
import { groupItemsByFloor } from '@/utils/public-signing';
import { DrawingLightboxModal } from './modals/drawing-lightbox-modal';
import { SignDoorCard } from './sign-door-card';

interface SignDoorListProps {
  items: PublicSigningItem[];
  subjectType: PublicSigningSubject;
}

export function SignDoorList({ items, subjectType }: SignDoorListProps) {
  const groups = useMemo(() => groupItemsByFloor(items), [items]);
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set(items[0] ? [items[0].positionId] : []));
  const [zoomItem, setZoomItem] = useState<PublicSigningItem | null>(null);

  if (items.length === 0) return null;

  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <section className="space-y-4" aria-label={SIGN_ITEMS_HEADING[subjectType]}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
        {SIGN_ITEMS_HEADING[subjectType]} ({items.length})
      </h2>
      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <h3 className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            {group.floorName} <span className="font-normal text-primary/70">({group.items.length} bộ)</span>
          </h3>
          {group.items.map((item) => (
            <SignDoorCard
              key={item.positionId}
              item={item}
              isOpen={openIds.has(item.positionId)}
              onToggle={() => toggle(item.positionId)}
              onZoom={setZoomItem}
            />
          ))}
        </div>
      ))}
      <DrawingLightboxModal item={zoomItem} onClose={() => setZoomItem(null)} />
    </section>
  );
}
