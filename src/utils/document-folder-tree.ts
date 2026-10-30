import type { DocumentCategory } from '@/types';

export function normalizeCategoryTree(categoryTree: DocumentCategory[] | unknown): DocumentCategory[] {
  if (Array.isArray(categoryTree)) return categoryTree;
  if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
  if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
  return [];
}

export function collectCategoryIds(nodes: DocumentCategory[]): Set<number> {
  const ids = new Set<number>();
  const traverse = (items: DocumentCategory[]) => {
    for (const node of items) {
      ids.add(node.id);
      if (node.children?.length) traverse(node.children);
    }
  };
  traverse(nodes);
  return ids;
}

export function isDescendant(categories: DocumentCategory[], sourceId: number, targetId: number): boolean {
  for (const cat of categories) {
    if (cat.id === sourceId) {
      const checkChildren = (children?: DocumentCategory[]): boolean => {
        if (!children) return false;
        if (children.some((c) => c.id === targetId)) return true;
        return children.some((c) => checkChildren(c.children));
      };
      return checkChildren(cat.children);
    }
    if (cat.children?.length && isDescendant(cat.children, sourceId, targetId)) {
      return true;
    }
  }
  return false;
}

function findNodeWithContext(
  nodes: DocumentCategory[],
  targetId: number,
  parent: DocumentCategory | null = null,
  underShared = false,
  inheritedPerm?: 'view' | 'edit',
): {
  currentFolder: DocumentCategory;
  parentFolder: DocumentCategory | null;
  isUnderShared: boolean;
  effectivePermission?: 'view' | 'edit';
} | null {
  for (const node of nodes) {
    const nodeShared = underShared || Boolean(node.isShared);
    const perm = node.permission || inheritedPerm;
    if (node.id === targetId) {
      return { currentFolder: node, parentFolder: parent, isUnderShared: nodeShared, effectivePermission: perm };
    }
    if (node.children?.length) {
      const found = findNodeWithContext(node.children, targetId, node, nodeShared, perm);
      if (found) return found;
    }
  }
  return null;
}

export function resolveFolderTreeContext({
  categoryTree,
  currentFolderId,
  tab,
}: {
  categoryTree: DocumentCategory[] | unknown;
  currentFolderId: number | null;
  tab: string | null;
}) {
  const safeCategoryTree = normalizeCategoryTree(categoryTree);
  const myFolders = safeCategoryTree.filter((f) => !f.isShared);
  const sharedFolders = safeCategoryTree.filter((f) => f.isShared);

  const found = currentFolderId !== null ? findNodeWithContext(safeCategoryTree, currentFolderId) : null;
  const currentFolder = found?.currentFolder ?? null;
  const parentFolder = found?.parentFolder ?? null;
  const subFolders = currentFolderId === null ? safeCategoryTree : currentFolder?.children || [];
  const foldersToDisplay =
    currentFolderId !== null ? subFolders : tab === 'shared' ? sharedFolders : myFolders;
  const isSharedSection = tab === 'shared' || Boolean(currentFolder?.isShared) || Boolean(found?.isUnderShared);
  const currentFolderPermission = found?.effectivePermission;

  return {
    safeCategoryTree,
    currentFolder,
    currentFolderPermission,
    parentFolder,
    subFolders,
    myFolders,
    sharedFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  };
}
