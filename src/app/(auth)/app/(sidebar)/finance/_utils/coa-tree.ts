import type {
  Account,
  AccountCategory,
  AccountRegimeScope,
  AccountTreeNode,
} from '@/types';
import { includesSearchText } from '@/utils/string';

export interface AccountTreeFilterOptions {
  regime?: AccountRegimeScope;
  category?: AccountCategory;
  isPostable?: boolean;
  isActive?: boolean;
}

export interface FlattenedAccountRow {
  node: AccountTreeNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

const sortNodesRecursive = (nodes: AccountTreeNode[]): AccountTreeNode[] => {
  nodes.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  for (const node of nodes) {
    if (node.children.length > 0) {
      sortNodesRecursive(node.children);
    }
  }
  return nodes;
};

/**
 * Dựng cây Hệ thống tài khoản kế toán phân cấp từ danh sách phẳng trả về từ API.
 */
export function buildAccountTree(accounts: Account[]): AccountTreeNode[] {
  const nodeMap = new Map<number, AccountTreeNode>();
  const roots: AccountTreeNode[] = [];

  for (const acc of accounts) {
    nodeMap.set(acc.id, { ...acc, children: [] });
  }

  for (const acc of accounts) {
    const current = nodeMap.get(acc.id);
    if (!current) continue;

    if (acc.parentId !== null && acc.parentId !== acc.id) {
      const parent = nodeMap.get(acc.parentId);
      if (parent) {
        parent.children.push(current);
        continue;
      }
    }
    roots.push(current);
  }

  return sortNodesRecursive(roots);
}

/**
 * Làm phẳng cây tài khoản theo trạng thái đóng/mở (expandedIds) để render bảng phân cấp.
 */
export function flattenVisibleTree(
  nodes: AccountTreeNode[],
  expandedIds: ReadonlySet<number>,
  depth = 0,
): FlattenedAccountRow[] {
  const rows: FlattenedAccountRow[] = [];

  for (const node of nodes) {
    const hasChildren = node.children.length > 0;
    const isExpanded = hasChildren && expandedIds.has(node.id);
    rows.push({ node, depth, hasChildren, isExpanded });

    if (isExpanded) {
      rows.push(...flattenVisibleTree(node.children, expandedIds, depth + 1));
    }
  }

  return rows;
}

const matchesAccountFilter = (
  node: AccountTreeNode,
  searchQuery: string,
  options?: AccountTreeFilterOptions,
): boolean => {
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    const matchedText =
      includesSearchText(node.accountCode, trimmedQuery) ||
      includesSearchText(node.name, trimmedQuery) ||
      includesSearchText(node.englishName, trimmedQuery);
    if (!matchedText) return false;
  }

  if (options?.regime) {
    if (options.regime !== 'both' && node.regime !== options.regime && node.regime !== 'both') {
      return false;
    }
  }
  if (options?.category && node.category !== options.category) {
    return false;
  }
  if (options?.isPostable !== undefined && node.isPostable !== options.isPostable) {
    return false;
  }
  if (options?.isActive !== undefined && node.isActive !== options.isActive) {
    return false;
  }

  return true;
};

/**
 * Lọc cây tài khoản theo từ khóa và bộ lọc, luôn giữ lại nút cha nếu có nút con thỏa mãn.
 */
export function filterAccountTree(
  nodes: AccountTreeNode[],
  searchQuery: string,
  options?: AccountTreeFilterOptions,
): AccountTreeNode[] {
  const result: AccountTreeNode[] = [];

  for (const node of nodes) {
    const filteredChildren = filterAccountTree(node.children, searchQuery, options);
    const selfMatched = matchesAccountFilter(node, searchQuery, options);

    if (selfMatched || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      });
    }
  }

  return result;
}

/**
 * Thu thập toàn bộ ID tài khoản tổng hợp có nút con để hỗ trợ "Mở rộng tất cả".
 */
export function collectExpandableAccountIds(nodes: AccountTreeNode[]): number[] {
  const ids: number[] = [];
  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id);
      ids.push(...collectExpandableAccountIds(node.children));
    }
  }
  return ids;
}
