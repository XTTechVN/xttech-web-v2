'use client';

import React from 'react';
import FolderFormModal from './folder-form-modal';
import type { DocumentCategory } from '@/types';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentCategory | null;
  onSuccess?: () => void;
}

/**
 * @deprecated Dùng FolderFormModal trực tiếp với initialData={folder}
 */
export const EditFolderModal: React.FC<EditFolderModalProps> = ({ folder, ...rest }) => {
  return <FolderFormModal {...rest} initialData={folder} />;
};

export default EditFolderModal;


