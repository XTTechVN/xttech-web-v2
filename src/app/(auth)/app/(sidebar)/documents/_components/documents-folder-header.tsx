import React from 'react';
import { Button } from '@/components';
import { ArrowLeft, Folder, FolderOpen } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface DocumentsFolderHeaderProps {
  currentFolderId: number | null;
  currentFolder: DocumentCategory | null;
  parentFolder: DocumentCategory | null;
  tab: string | null;
  subFoldersCount: number;
  documentsCount: number;
  onGoBack: () => void;
}

export const DocumentsFolderHeader: React.FC<DocumentsFolderHeaderProps> = ({
  currentFolderId,
  currentFolder,
  parentFolder,
  tab,
  subFoldersCount,
  documentsCount,
  onGoBack,
}) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
      <div className="flex items-center gap-3 min-w-0">
        {/* Nút Quay lại 1 cấp (chỉ hiện khi đang ở trong thư mục con) */}
        {currentFolderId !== null && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoBack}
            leftIcon={<ArrowLeft size={15} />}
            className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
            title={parentFolder ? `Quay lại ${parentFolder.name}` : 'Quay lại Tài liệu của tôi'}
          >
            Quay lại
          </Button>
        )}

        {/* Thông tin thư mục hiện tại */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {currentFolderId !== null ? <FolderOpen size={18} /> : <Folder size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-bold text-slate-800 truncate leading-tight">
                {currentFolder
                  ? currentFolder.name
                  : tab === 'shared'
                  ? 'Được chia sẻ với tôi'
                  : tab === 'trash'
                  ? 'Thùng rác'
                  : 'Tài liệu của tôi'}
              </h2>
              {currentFolder?.code && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {currentFolder.code}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {currentFolder
                ? `${subFoldersCount} thư mục con • ${documentsCount} tài liệu`
                : `${subFoldersCount} thư mục • ${documentsCount} tài liệu`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
