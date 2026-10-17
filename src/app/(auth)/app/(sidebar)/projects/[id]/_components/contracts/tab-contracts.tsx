'use client';

import React from 'react';
import type { ProjectQuotationItem } from '@/types';
import { ProjectContractsLedger } from './project-contracts-ledger';

interface TabContractsProps {
  projectId: number;
  quotations: ProjectQuotationItem[];
}

export function TabContracts({ projectId, quotations }: TabContractsProps) {
  return <ProjectContractsLedger projectId={projectId} quotations={quotations} />;
}
