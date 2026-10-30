'use client';

import React from 'react';
import { ProjectQuotationsPricing } from './project-quotations-pricing';

interface TabQuotationsProps {
  projectId: number;
}

export function TabQuotations({ projectId }: TabQuotationsProps) {
  return <ProjectQuotationsPricing projectId={projectId} />;
}
