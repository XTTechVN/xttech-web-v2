'use client';

import React from 'react';
import { Tooltip, Button } from '@/components';

export function InteractiveTooltips() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Top Position */}
        <Tooltip content="Tooltip ở phía Trên" position="top">
          <Button variant="outline">Top</Button>
        </Tooltip>

        {/* Bottom Position */}
        <Tooltip content="Tooltip ở phía Dưới" position="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>

        {/* Left Position */}
        <Tooltip content="Tooltip bên Trái" position="left">
          <Button variant="outline">Left</Button>
        </Tooltip>

        {/* Right Position */}
        <Tooltip content="Tooltip bên Phải" position="right">
          <Button variant="outline">Right</Button>
        </Tooltip>

        {/* With Delay */}
        <Tooltip content="Hiển thị trễ 500ms" position="top" delay={500}>
          <Button variant="secondary">Delay 500ms</Button>
        </Tooltip>
      </div>
    </div>
  );
}
