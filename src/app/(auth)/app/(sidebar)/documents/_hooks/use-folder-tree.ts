import { useMemo } from 'react';
import type { DocumentCategory } from '@/types';

interface UseFolderTreeProps {
  categoryTree: DocumentCategory[] | unknown;
  currentFolderId: number | null;
  tab: string | null;
}

export function useFolderTree({ categoryTree, currentFolderId, tab }: UseFolderTreeProps) {
  // Chuẩn hóa cây thư mục an toàn
  const safeCategoryTree = useMemo<DocumentCategory[]>(() => {
    if (Array.isArray(categoryTree)) return categoryTree;
    if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
    if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
    return [];
  }, [categoryTree]);

  // Tìm thư mục hiện tại, thư mục cha trực tiếp và các thư mục con
  const { currentFolder, parentFolder, subFolders, myFolders, sharedFolders } = useMemo<{
    currentFolder: DocumentCategory | null;
    parentFolder: DocumentCategory | null;
    subFolders: DocumentCategory[];
    myFolders: DocumentCategory[];
    sharedFolders: DocumentCategory[];
  }>(() => {
    if (currentFolderId === null) {
      return {
        currentFolder: null,
        parentFolder: null,
        subFolders: safeCategoryTree,
        myFolders: safeCategoryTree.filter((f) => !f.isShared),
        sharedFolders: safeCategoryTree.filter((f) => f.isShared),
      };
    }

    let targetFolder: DocumentCategory | null = null;
    let directParent: DocumentCategory | null = null;

    const findFolderRecursive = (
      nodes: DocumentCategory[],
      parent: DocumentCategory | null
    ): boolean => {
      for (const node of nodes) {
        if (node.id === currentFolderId) {
          targetFolder = node;
          directParent = parent;
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findFolderRecursive(node.children, node)) {
            return true;
          }
        }
      }
      return false;
    };

    findFolderRecursive(safeCategoryTree, null);

    const children = targetFolder ? (targetFolder as DocumentCategory).children || [] : [];

    return {
      currentFolder: targetFolder,
      parentFolder: directParent,
      subFolders: children,
      myFolders: children,
      sharedFolders: [],
    };
  }, [safeCategoryTree, currentFolderId]);

  // Danh sách thư mục hiển thị theo ngữ cảnh
  const foldersToDisplay = useMemo(() => {
    if (currentFolderId !== null) return subFolders;
    if (tab === 'shared') return sharedFolders;
    return myFolders; // default for 'my' or null
  }, [currentFolderId, tab, subFolders, sharedFolders, myFolders]);

  // Kiểm tra xem vị trí hiện tại có thuộc mục "Được chia sẻ với tôi" hay không
  const isSharedSection = useMemo(() => {
    if (tab === 'shared') return true;
    if (currentFolder?.isShared) return true;
    if (currentFolderId !== null && safeCategoryTree.length > 0) {
      const checkDescendantOfShared = (
        nodes: DocumentCategory[],
        targetId: number,
        isUnderShared = false
      ): boolean => {
        for (const node of nodes) {
          const nodeIsShared = isUnderShared || Boolean(node.isShared);
          if (node.id === targetId) {
            return nodeIsShared;
          }
          if (node.children && node.children.length > 0) {
            if (checkDescendantOfShared(node.children, targetId, nodeIsShared)) {
              return true;
            }
          }
        }
        return false;
      };
      return checkDescendantOfShared(safeCategoryTree, currentFolderId);
    }
    return false;
  }, [tab, currentFolder, currentFolderId, safeCategoryTree]);

  // Hàm đệ quy kiểm tra xem targetId có nằm trong nhánh con của sourceId không (chống kéo thả vào chính con của nó)
  const isDescendant = (categories: DocumentCategory[], sourceId: number, targetId: number): boolean => {
    for (const cat of categories) {
      if (cat.id === sourceId) {
        const checkChildren = (children?: DocumentCategory[]): boolean => {
          if (!children) return false;
          if (children.some((c) => c.id === targetId)) return true;
          return children.some((c) => checkChildren(c.children));
        };
        return checkChildren(cat.children);
      }
      if (cat.children && cat.children.length > 0) {
        if (isDescendant(cat.children, sourceId, targetId)) return true;
      }
    }
    return false;
  };

  return {
    safeCategoryTree,
    currentFolder,
    parentFolder,
    subFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  };
}
