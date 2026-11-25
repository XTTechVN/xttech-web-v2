import { CONTACT_INFO } from '@/config';
import type { PublicParty } from '@/types';

interface PartyCardProps {
  title: string;
  name?: string | null;
  lines: (string | null | undefined)[];
}

function PartyCard({ title, name, lines }: PartyCardProps) {
  const visible = lines.filter((line): line is string => Boolean(line));
  return (
    <div className="rounded-xl border border-stone-200 border-l-4 border-l-primary bg-white p-3 text-xs shadow-sm">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">{title}</div>
      <div className="text-sm font-semibold text-stone-900">{name || '—'}</div>
      <ul className="mt-1 space-y-0.5 text-stone-600">
        {visible.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function SignParties({ partyA }: { partyA?: PublicParty | null }) {
  const representative = partyA?.representative
    ? `Đại diện: ${partyA.representative}${partyA.representativeRole ? ` (${partyA.representativeRole})` : ''}`
    : null;

  return (
    <section aria-label="Các bên" className="grid gap-3 sm:grid-cols-2">
      <PartyCard
        title="Bên A · Khách hàng"
        name={partyA?.name}
        lines={[
          representative,
          partyA?.phone ? `ĐT: ${partyA.phone}` : null,
          partyA?.email ? `Email: ${partyA.email}` : null,
          partyA?.address ? `Địa chỉ: ${partyA.address}` : null,
          partyA?.taxCode ? `MST: ${partyA.taxCode}` : null,
        ]}
      />
      <PartyCard
        title="Bên B · Đơn vị cung cấp"
        name="XT-Tech"
        lines={[`ĐT: ${CONTACT_INFO.phoneDisplay}`, `Email: ${CONTACT_INFO.email}`]}
      />
    </section>
  );
}
