'use client';

import { useMemo, useState } from 'react';
import { getRemakeSections } from './remake-menu';
import { createCan } from '@/hooks/use-can';
import { DEMO_ROLES } from '../_mock/demo-roles';
import { splitNav } from './nav-model';
import { usePublishPreview } from './preview-context';
import { PageHeader } from './page-header';
import { RoleActionList } from './role-action-list';
import { RoleChips } from './role-chips';
import { RoleCustomerPreview } from './role-customer-preview';
import { RoleMenuPreview } from './role-menu-preview';

const TITLE = 'mb-2 font-heading text-base font-semibold text-rm-text';

// Chọn một tài khoản demo -> dựng can() từ đúng danh sách quyền của role đó -> menu và nút đổi theo
export function RolePreview() {
  const [code, setCode] = useState(DEMO_ROLES[0].code);
  const role = DEMO_ROLES.find((r) => r.code === code) ?? DEMO_ROLES[0];

  const { can, scopeOf, access } = useMemo(() => createCan(role.permissions), [role]);
  usePublishPreview({ access, name: role.email, roleName: role.name });
  const nav = useMemo(() => splitNav(getRemakeSections(access)), [access]);

  return (
    <>
      <PageHeader title="Xem thử theo vai trò" description="Chọn tài khoản demo để xem menu và nút thay đổi theo quyền." />
      <RoleChips roles={DEMO_ROLES} value={code} onChange={setCode} />

      <p className="mt-3 text-sm text-rm-muted [overflow-wrap:anywhere]">
        Tài khoản <span className="font-medium text-rm-text">{role.email}</span> (doanh nghiệp demo) · {role.permissions.length} quyền
        {role.extraRoleCode && ' · kèm role Nhân viên'}
      </p>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-label="Menu">
            <h2 className={TITLE}>Menu</h2>
            <RoleMenuPreview nav={nav} />
          </section>
          <section aria-label="Màn Khách hàng">
            <h2 className={TITLE}>Màn Khách hàng</h2>
            <RoleCustomerPreview can={can} />
          </section>
        </div>
        <section aria-label="Nút và chức năng" className="min-w-0">
          <h2 className={TITLE}>Nút và chức năng</h2>
          <RoleActionList can={can} scopeOf={scopeOf} />
        </section>
      </div>
    </>
  );
}
