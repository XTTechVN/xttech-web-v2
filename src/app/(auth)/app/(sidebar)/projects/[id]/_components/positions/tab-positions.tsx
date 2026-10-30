'use client';

import React from 'react';
import { ProjectFloorsPositions } from './project-floors-positions';

interface TabPositionsProps {
  projectId: number;
}

export function TabPositions({ projectId }: TabPositionsProps) {
  return <ProjectFloorsPositions projectId={projectId} />;
}
