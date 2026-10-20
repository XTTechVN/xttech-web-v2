'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, FilePen, Megaphone, Replace, Send, TimerOff, XCircle } from 'lucide-react';
import { getDocumentTimeline } from '@/actions/document';
import { APPROVAL_ACTION_MAP } from '@/types';
import { cn } from '@/utils';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';
import { formatRuleDateTime } from './rule-badges';

interface RuleApprovalTimelineProps {
  documentId: number;
  isEnabled: boolean;
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

export const RuleApprovalTimeline: React.FC<RuleApprovalTimelineProps> = ({ documentId, isEnabled }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: RULES_QUERY_KEYS.timeline(documentId),
    queryFn: () => getDocumentTimeline(documentId),
    enabled: isEnabled,
  });

  if (isLoading) return <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />;
  if (logs.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
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
            <p className="text-xs font-semibold text-slate-800">
              {APPROVAL_ACTION_MAP[log.action] || log.action}
              {log.actor && <span className="font-normal text-slate-500"> · {log.actor.fullName}</span>}
            </p>
            <p className="text-[10px] text-slate-400">{formatRuleDateTime(log.createdAt)}</p>
            {log.note && (
              <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-2 py-1">{log.note}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
};
