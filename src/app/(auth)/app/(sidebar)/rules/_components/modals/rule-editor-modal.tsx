'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { RuleEditorModalProps } from './rule-editor-modal-body';

const LazyRuleEditorModalBody = dynamic(
  () => import('./rule-editor-modal-body').then((mod) => mod.RuleEditorModalBody),
  { ssr: false },
);

export const RuleEditorModal: React.FC<RuleEditorModalProps> = (props) => {
  if (!props.isOpen) return null;
  const resetKey = `${props.document?.id ?? 'new'}-${props.supersedingDoc?.id ?? 'none'}`;
  return <LazyRuleEditorModalBody key={resetKey} {...props} />;
};
