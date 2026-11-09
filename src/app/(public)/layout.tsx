import React from 'react';
import { PublicLayoutShell } from './_components';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayoutShell>{children}</PublicLayoutShell>;
}

