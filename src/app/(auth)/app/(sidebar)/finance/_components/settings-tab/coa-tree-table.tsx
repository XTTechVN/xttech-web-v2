'use client';

import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, Edit2, FolderTree, Plus, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import { ACCOUNT_CATEGORY_MAP, ACCOUNT_NATURE_MAP } from '@/config/finance';
import type { Account } from '@/types';
import { cn } from '@/utils';
import type { FlattenedAccountRow } from '../../_utils';
import { formatAccountTrackFlags } from './settings-tab.constants';

interface CoaTreeTableProps {
  rows: FlattenedAccountRow[];
  onToggleExpand: (id: number) => void;
  onCreateAccount: (parentAccount?: Account) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export function CoaTreeTable({
  rows,
  onToggleExpand,
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
}: CoaTreeTableProps) {
  const postableCount = useMemo(() => rows.filter((r) => r.node.isPostable).length, [rows]);

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Số hiệu TK</th>
                <th className="p-3">Tên tài khoản</th>
                <th className="p-3">Tính chất</th>
                <th className="p-3">Nhóm TK</th>
                <th className="p-3">Theo dõi chi tiết</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <FolderTree size={24} className="mx-auto text-slate-300 mb-2" />
                    Không tìm thấy tài khoản nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                rows.map(({ node, depth, hasChildren, isExpanded }) => {
                  const natureMeta = ACCOUNT_NATURE_MAP[node.nature];
                  const catMeta = ACCOUNT_CATEGORY_MAP[node.category];
                  const trackFlags = formatAccountTrackFlags(node);
                  const isParent = !node.isPostable;

                  return (
                    <tr key={node.id} className={cn('hover:bg-slate-50/80 transition-colors', isParent && 'bg-slate-50/60')}>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 18}px` }}>
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => onToggleExpand(node.id)}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : (
                            <span className="w-4 inline-block" />
                          )}
                          <span className={cn('font-mono', isParent ? 'font-bold text-primary' : 'font-semibold text-slate-900')}>
                            {node.accountCode}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 min-w-[220px]">
                        <div className={cn(isParent ? 'font-bold text-slate-900' : 'text-slate-800')}>{node.name}</div>
                        {node.englishName && <div className="text-[11px] text-slate-400">{node.englishName}</div>}
                      </td>
                      <td className="p-3">
                        <Badge variant={natureMeta?.variant || 'default'} size="sm">
                          {natureMeta?.shortLabel || node.nature}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={catMeta?.variant || 'default'} size="sm">
                          {catMeta?.shortLabel || node.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {trackFlags.length === 0 ? (
                            <span className="text-slate-400">---</span>
                          ) : (
                            trackFlags.map((flag) => (
                              <span key={flag} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {flag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={node.isActive ? 'success' : 'default'} size="sm">
                          {node.isActive ? 'Đang dùng' : 'Ngưng'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={() => onCreateAccount(node)} title="Thêm tài khoản con">
                            <Plus size={13} />
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => onEditAccount(node)} title="Sửa tài khoản">
                            <Edit2 size={13} />
                          </Button>
                          {!node.isSystem && !hasChildren && (
                            <Button variant="ghost" size="xs" onClick={() => onDeleteAccount(node)} title="Xóa tài khoản" className="text-rose-600">
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={7} className="p-3">
                  Tổng số: {rows.length} bản ghi ({postableCount} tài khoản chi tiết được phép hạch toán)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2.5">
        {rows.map(({ node, depth, hasChildren, isExpanded }) => (
          <div key={node.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2" style={{ marginLeft: `${Math.min(depth, 3) * 12}px` }}>
            <div className="flex items-center gap-2 min-w-0">
              {hasChildren && (
                <button type="button" onClick={() => onToggleExpand(node.id)} className="p-1 rounded bg-slate-100 text-slate-600">
                  {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              )}
              <div className="min-w-0">
                <div className="font-mono font-bold text-xs text-primary">{node.accountCode}</div>
                <div className="text-xs font-medium text-slate-900 truncate">{node.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="xs" onClick={() => onCreateAccount(node)}><Plus size={13} /></Button>
              <Button variant="ghost" size="xs" onClick={() => onEditAccount(node)}><Edit2 size={13} /></Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
