'use client';

import React from 'react';
import { ProjectContractsLedger } from './project-contracts-ledger';

interface TabContractsProps {
  projectId: number;
}

export function TabContracts({ projectId }: TabContractsProps) {
  return <ProjectContractsLedger projectId={projectId} />;
}
