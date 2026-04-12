'use client';

import { cn } from '@/utils/cn';
import React from 'react';

interface ControlGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ControlGroup = ({ children, className }: ControlGroupProps) => (
  <div className={cn('flex items-center bg-gray-100 rounded p-1', className)}>{children}</div>
);
