import React from 'react';
import { ArrowLeft, Folder, FolderOpen } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface DocumentsFolderHeaderProps {
  currentFolderId: number | null;
  currentFolder: DocumentCategory | null;
  parentFolder: DocumentCategory | null;
  tab: string | null;
  subFoldersCount?: number;
  documentsCount?: number;
  onGoBack: () => void;
}

export const DocumentsFolderHeader: React.FC<DocumentsFolderHeaderProps> = ({
  currentFolderId,
  currentFolder,
  parentFolder,
  tab,
  onGoBack,
}) => {
  return (
    <div className="flex items-start justify-between pb-2.5 border-b border-slate-200/70">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
        {currentFolderId !== null && (
          <button
            type="button"
            onClick={onGoBack}
            className="h-8 w-8 sm:w-auto px-0 sm:px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer shadow-2xs shrink-0 inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none"
            title={
              parentFolder
                ? `Quay lại ${parentFolder.name}`
                : tab === 'shared'
                  ? 'Quay lại Được chia sẻ với tôi'
                  : 'Quay lại Tài liệu của tôi'
            }
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap leading-none">Quay lại</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {currentFolderId !== null ? <FolderOpen size={18} /> : <Folder size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate leading-tight max-w-[180px] xs:max-w-xs sm:max-w-md md:max-w-xl">
                {currentFolder
                  ? currentFolder.name
                  : tab === 'shared'
                    ? 'Được chia sẻ với tôi'
                    : tab === 'trash'
                      ? 'Thùng rác'
                      : 'Tài liệu của tôi'}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
