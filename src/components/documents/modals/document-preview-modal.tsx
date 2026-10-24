'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { DocumentPreviewModalProps } from './document-preview-modal-body';

const LazyDocumentPreviewModalBody = dynamic(() => import('./document-preview-modal-body'), {
  ssr: false,
});

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = (props) => {
  if (!props.isOpen || !props.document) return null;
  return <LazyDocumentPreviewModalBody {...props} />;
};

export default DocumentPreviewModal;
export type { DocumentPreviewModalProps };
