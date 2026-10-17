'use client';

import React from 'react';
import { ProjectProductionProgress } from './project-production-progress';

interface TabProductionProps {
  projectId: number;
}

export function TabProduction({ projectId }: TabProductionProps) {
  return <ProjectProductionProgress projectId={projectId} />;
}
