'use client';

import MapSelect from '@/components/map/MapSelect';
import { useState } from 'react';

export default function TestPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="h-full">
      <MapSelect onSelect={(position) => setPosition(position)} />
      <p>{position?.lat}</p>
      <p>{position?.lng}</p>
    </div>
  );
}
