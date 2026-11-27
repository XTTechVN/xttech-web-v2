'use client';

import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import { DEV_TOOLS, rawSidebarSections } from '@/config';
import { PERSONAS } from '@/generated/personas';
import { createCan } from '@/hooks/use-can';

// Chỉ dev: bảng mục menu × tài khoản demo, tính thẳng từ personas.ts và sidebar.ts, không gọi API.
// Ô hiện ✓ kèm phạm vi khi hẹp hơn toàn doanh nghiệp (own, dept); ô trống là bị ẩn khỏi menu.
export default function DevPermissionMatrixPage() {
  if (!DEV_TOOLS) notFound();

  const cans = PERSONAS.map((p) => createCan(p.permissions));

  return (
    <div className="p-4 font-body md:p-6">
      <h1 className="font-heading text-xl font-semibold text-slate-900">Ma trận menu theo tài khoản demo</h1>
      <p className="mt-1 text-sm text-slate-600">
        Tính từ <code>generated/personas.ts</code> và <code>config/sidebar.ts</code>. Mở cột &quot;Quyền · Dev&quot; bên phải để chọn tài khoản và bật/tắt quyền, xem trang thật đổi theo.
      </p>

      <div className="mt-4 overflow-x-auto rounded-block border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">Mục menu hiện với từng tài khoản demo</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
              <th scope="col" className="sticky left-0 z-10 min-w-44 bg-slate-50 px-3 py-2 font-medium">
                Mục menu
              </th>
              {PERSONAS.map((p) => (
                <th key={p.key} scope="col" className="px-2 py-2 text-center font-medium" title={p.label}>
                  {p.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rawSidebarSections.map((section, i) => (
              <Fragment key={section.title ?? i}>
                {section.title && (
                  <tr className="bg-slate-50/60">
                    <th scope="rowgroup" colSpan={PERSONAS.length + 1} className="sticky left-0 px-3 py-1.5 text-left text-xs font-semibold text-slate-700">
                      {section.title}
                    </th>
                  </tr>
                )}
                {section.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-normal text-slate-800">
                      {item.label}
                    </th>
                    {cans.map((c, idx) => {
                      const code = item.permissions?.find((x) => c.can(x));
                      const allowed = !item.permissions || !!code;
                      const scope = code ? c.scopeOf(code) : null;
                      return (
                        <td key={PERSONAS[idx].key} className="px-2 py-2 text-center">
                          {allowed ? (
                            <span className="text-emerald-700" aria-label={`Hiện${scope && scope !== 'org' ? `, phạm vi ${scope}` : ''}`}>
                              ✓{scope && scope !== 'org' ? <span className="ml-0.5 text-xs text-amber-700">{scope}</span> : null}
                            </span>
                          ) : (
                            <span className="text-slate-300" aria-label="Ẩn">
                              –
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
