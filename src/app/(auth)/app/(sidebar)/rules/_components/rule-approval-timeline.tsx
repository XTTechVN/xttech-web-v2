'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, FilePen, Megaphone, Replace, Send, TimerOff, XCircle } from 'lucide-react';
import { getDocumentTimeline } from '@/actions/document';
import { APPROVAL_ACTION_MAP, SHARE_SCOPE_MAP } from '@/types';
import { cn } from '@/utils';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';
import { formatRuleDateTime } from './rule-badges';

interface RuleApprovalTimelineProps {
  documentId: number;
  isEnabled: boolean;
  scopeNote?: string;
}

const ACTION_VISUALS: Record<string, { icon: React.ReactNode; className: string }> = {
  submitted: { icon: <Send size={13} />, className: 'bg-sky-100 text-sky-600' },
  approved: { icon: <CheckCircle2 size={13} />, className: 'bg-emerald-100 text-emerald-600' },
  rejected: { icon: <XCircle size={13} />, className: 'bg-rose-100 text-rose-600' },
  published: { icon: <Megaphone size={13} />, className: 'bg-teal-100 text-teal-600' },
  superseded: { icon: <Replace size={13} />, className: 'bg-gray-100 text-gray-500' },
  expired: { icon: <TimerOff size={13} />, className: 'bg-amber-100 text-amber-600' },
};

const FALLBACK_VISUAL = { icon: <FilePen size={13} />, className: 'bg-slate-100 text-slate-500' };

export const RuleApprovalTimeline: React.FC<RuleApprovalTimelineProps> = ({ documentId, isEnabled, scopeNote }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: RULES_QUERY_KEYS.timeline(documentId),
    queryFn: () => getDocumentTimeline(documentId),
    enabled: isEnabled,
  });

  if (isLoading) return <div className="h-12 rounded-control bg-slate-100 animate-pulse" />;
  if (logs.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-slate-600">
        <Clock size={13} /> Chưa có hoạt động nào
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-3 border-l border-slate-200 ml-3">
      {logs.map((log) => {
        const visual = ACTION_VISUALS[log.action] ?? FALLBACK_VISUAL;
        return (
          <li key={log.id} className="pl-5 relative">
            <span
              className={cn(
                'absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white',
                visual.className,
              )}
            >
              {visual.icon}
            </span>
            <p className="text-sm font-semibold text-slate-900">
              {APPROVAL_ACTION_MAP[log.action] || log.action}
              {log.actor && <span className="font-normal text-slate-600"> · {log.actor.fullName}</span>}
            </p>
            <p className="text-xs text-slate-600">{formatRuleDateTime(log.createdAt)}</p>
            {log.note && (SHARE_SCOPE_MAP[log.note] ?? log.note) !== scopeNote && (
              <p className="mt-1 text-sm text-slate-700 [overflow-wrap:anywhere]">{SHARE_SCOPE_MAP[log.note] ?? log.note}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
};
