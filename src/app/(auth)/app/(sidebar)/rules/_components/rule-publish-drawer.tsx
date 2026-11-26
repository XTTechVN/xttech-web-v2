'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Input, MultiSelect } from '@/components';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, Select, SideDrawer } from '@/components-remake';
import { getDocumentById } from '@/actions/document';
import type { DocumentItem, PublishDocumentPayload } from '@/types';
import { RULES_QUERY_KEYS } from '@/utils';
import { useRulesShareOptions } from '../_hooks/use-rules-share-options';

type Scope = PublishDocumentPayload['shareScope'];

interface Props {
  document: DocumentItem | null;
  canPublishCompany: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: (payload: PublishDocumentPayload) => void;
}

const SCOPE_LABELS: Record<Scope, string> = { all: 'Toàn công ty', department: 'Theo phòng ban', user: 'Theo cá nhân chỉ định' };

const initialScope = (d: DocumentItem | null | undefined, company: boolean): Scope =>
  d?.shareScope === 'all' || d?.shareScope === 'department' || d?.shareScope === 'user' ? d.shareScope : company ? 'all' : 'department';

// Ban hành: chọn phạm vi, ngày hiệu lực và người nhận (drawer con cạnh drawer chi tiết)
export function RulePublishDrawer({ document: doc, canPublishCompany, pending, onClose, onConfirm }: Props) {
  const { data: detail } = useQuery({
    queryKey: RULES_QUERY_KEYS.detail(doc?.id ?? 0),
    queryFn: () => getDocumentById(doc!.id),
    enabled: Boolean(doc?.id),
  });
  const active = detail ?? doc;
  const { employeeOptions, departmentOptions } = useRulesShareOptions(Boolean(doc), active?.createdById);

  const [scope, setScope] = useState<Scope>(() => initialScope(active, canPublishCompany));
  const [date, setDate] = useState(() => dayjs(active?.effectiveDate ?? undefined).format('YYYY-MM-DD'));
  const [userIds, setUserIds] = useState<(string | number)[]>(() => active?.recipients?.map((r) => r.userId) ?? []);
  const [deptIds, setDeptIds] = useState<(string | number)[]>(() => active?.recipientDepartmentIds ?? active?.recipientDepartments?.map((d) => d.id) ?? []);
  const [error, setError] = useState('');
  const [syncedId, setSyncedId] = useState<number | null>(null);

  if (detail && detail.id !== syncedId) {
    setSyncedId(detail.id);
    setScope(initialScope(detail, canPublishCompany));
    setDate(dayjs(detail.effectiveDate ?? undefined).format('YYYY-MM-DD'));
    setUserIds(detail.recipients?.map((r) => r.userId) ?? []);
    setDeptIds(detail.recipientDepartmentIds ?? detail.recipientDepartments?.map((d) => d.id) ?? []);
    setError('');
  }

  const scopeOptions = useMemo(
    () => (Object.keys(SCOPE_LABELS) as Scope[]).filter((k) => k !== 'all' || canPublishCompany).map((k) => ({ value: k, label: SCOPE_LABELS[k] })),
    [canPublishCompany],
  );

  const submit = () => {
    if ((scope === 'department' && deptIds.length === 0) || (scope === 'user' && userIds.length === 0)) {
      return setError('Vui lòng chọn ít nhất một người nhận');
    }
    onConfirm({
      shareScope: scope,
      effectiveDate: date,
      supersedesId: active?.supersedesId ?? active?.supersedesDoc?.id ?? undefined,
      recipientDepartmentIds: scope === 'department' ? deptIds.map(Number) : undefined,
      recipientUserIds: scope === 'user' ? userIds.map(String) : undefined,
    });
  };

  return (
    <SideDrawer isOpen={!!doc} onClose={onClose} label="Ban hành văn bản">
      <DrawerHeader compact title="Ban hành văn bản" onClose={onClose} />
      <DrawerBody>
        <div className="flex w-full flex-col gap-4 py-4 md:w-96">
          <p className="text-sm text-slate-600 [overflow-wrap:anywhere]">
            <strong className="font-semibold text-slate-900">{active?.title}</strong>
          </p>
          {active?.supersedesDoc && (
            <p className="text-sm text-amber-800">
              Văn bản [{active.supersedesDoc.code}] {active.supersedesDoc.title} sẽ chuyển sang “Đã bị thay thế”.
            </p>
          )}
          <Select label="Phạm vi ban hành *" side value={scope} options={scopeOptions} onChange={(v) => setScope(v as Scope)} />
          <Input label="Ngày bắt đầu hiệu lực" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} />
          {scope === 'department' && (
            <MultiSelect label="Phòng ban nhận *" options={departmentOptions} value={deptIds} onChange={setDeptIds} placeholder="Chọn phòng ban..." searchPlaceholder="Tìm phòng ban..." fullWidth />
          )}
          {scope === 'user' && (
            <MultiSelect label="Người nhận *" options={employeeOptions} value={userIds} onChange={setUserIds} placeholder="Chọn nhân sự..." searchPlaceholder="Tìm tên hoặc email..." fullWidth />
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button loading={pending} className="w-full" onClick={submit}>
          Ban hành
        </Button>
      </DrawerFooter>
    </SideDrawer>
  );
}
