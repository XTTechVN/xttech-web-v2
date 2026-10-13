'use client';

import React from 'react';
import FolderFormModal from './folder-form-modal';
import type { DocumentCategory } from '@/types';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number | null;
  parentFolder?: DocumentCategory | null;
  onSuccess?: () => void;
}

/**
 * @deprecated Dùng FolderFormModal trực tiếp với initialData={null}
 */
export const CreateFolderModal: React.FC<CreateFolderModalProps> = (props) => {
  return <FolderFormModal {...props} initialData={null} />;
};

export default CreateFolderModal;


