'use client';

import type { ProjectFloor, ProjectQuotationPreviewRequest, ProjectQuotationPreviewResponse } from '@/types';
import { ACCESSORY_MODE_OPTIONS, LABOR_CALC_UNIT_OPTIONS, PRICING_MODE_OPTIONS, SCOPE_TYPE_OPTIONS } from '@/config';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { MoneyInput, PercentInput, Section } from '../../_components/fields';

interface Props {
  config: ProjectQuotationPreviewRequest;
  patch: (p: Partial<ProjectQuotationPreviewRequest>) => void;
  toggleFloor: (id: number) => void;
  name: string;
  setName: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  floors: ProjectFloor[];
  missingFloors: boolean;
  readOnly: boolean;
  result?: ProjectQuotationPreviewResponse;
  calculating: boolean;
  saveLabel: string;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
}

const Row = ({ k, v, tone }: { k: string; v: string; tone?: 'danger' | 'success' | 'primary' }) => (
  <div className="flex justify-between gap-3 py-1.5 text-sm">
    <dt className="text-rm-muted">{k}</dt>
    <dd
      className={cn(
        'flex-none font-medium tabular-nums',
        tone === 'danger' && 'text-rm-danger',
        tone === 'success' && 'text-rm-success',
        tone === 'primary' && 'text-rm-primary',
      )}
    >
      {v}
    </dd>
  </div>
);

// Cấu thành giá: các khối cấu hình bên trái, kết quả tính thử và nút lưu bên phải (cố định khi cuộn trên màn rộng).
export function QuoteConfig(p: Props) {
  const c = p.config;
  const unit = c.laborCalcUnit === 'vnd_per_kg' ? 'đ/kg nhôm' : 'đ/m² cửa';
  const r = p.result;
  const below = r?.items.filter((i) => i.isBelowCost).length ?? 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-4">
        <Section title="Thông tin báo giá">
          <Field label="Tên báo giá" id="qc-name">
            <input id="qc-name" value={p.name} disabled={p.readOnly} onChange={(e) => p.setName(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Ghi chú cho khách (thời hạn, bảo hành…)" id="qc-note">
            <input id="qc-note" value={p.note} disabled={p.readOnly} onChange={(e) => p.setNote(e.target.value)} className={INPUT} />
          </Field>
        </Section>

        <Section title="Phạm vi báo giá">
          <Field label="Báo giá cho" id="qc-scope">
            <Select
              id="qc-scope"
              label="Báo giá cho"
              value={c.scopeType ?? 'all'}
              onChange={(v) => p.patch({ scopeType: v as 'all' | 'by_floor' })}
              options={SCOPE_TYPE_OPTIONS}
              disabled={p.readOnly}
            />
          </Field>
          {c.scopeType === 'by_floor' && (
            <div role="group" aria-label="Chọn tầng" className="flex flex-wrap gap-2">
              {p.floors.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={p.readOnly}
                  aria-pressed={c.floorIds?.includes(f.id)}
                  onClick={() => p.toggleFloor(f.id)}
                  className={cn(
                    'h-9 rounded-rm border px-3 text-sm disabled:opacity-60',
                    c.floorIds?.includes(f.id) ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
                  )}
                >
                  {f.name}
                </button>
              ))}
              {p.missingFloors && <p className="w-full text-xs text-rm-warning">Chọn ít nhất 1 tầng để xem giá.</p>}
            </div>
          )}
          <Field label="Cách hiển thị phụ kiện" id="qc-acc">
            <Select
              id="qc-acc"
              label="Phụ kiện"
              value={c.accessoryMode ?? 'combined'}
              onChange={(v) => p.patch({ accessoryMode: v as 'combined' | 'separated' })}
              options={ACCESSORY_MODE_OPTIONS}
              disabled={p.readOnly}
            />
          </Field>
        </Section>

        <Section title="Tiền công thợ" hint="Làm cửa, lắp đặt và vệ sinh sau khi lắp.">
          <Field label="Tính tiền công theo" id="qc-unit">
            <Select
              id="qc-unit"
              label="Tính theo"
              value={c.laborCalcUnit ?? 'vnd_per_m2'}
              onChange={(v) => p.patch({ laborCalcUnit: v as 'vnd_per_m2' | 'vnd_per_kg' })}
              options={LABOR_CALC_UNIT_OPTIONS}
              disabled={p.readOnly}
            />
          </Field>
          <Field label={`Làm cửa (${unit})`} id="qc-l1">
            <MoneyInput id="qc-l1" value={c.laborProductionRate} onChange={(v) => p.patch({ laborProductionRate: v ?? 0 })} disabled={p.readOnly} />
          </Field>
          <Field label={`Lắp đặt (${unit})`} id="qc-l2">
            <MoneyInput id="qc-l2" value={c.laborInstallRate} onChange={(v) => p.patch({ laborInstallRate: v ?? 0 })} disabled={p.readOnly} />
          </Field>
          <Field label={`Vệ sinh (${unit})`} id="qc-l3">
            <MoneyInput id="qc-l3" value={c.laborCleanRate} onChange={(v) => p.patch({ laborCleanRate: v ?? 0 })} disabled={p.readOnly} />
          </Field>
        </Section>

        <Section title="Chi phí khác" hint="Các khoản ngoài vật tư và tiền công (thuê xe cẩu, vận chuyển…).">
          <Field label="Chi phí phát sinh (đ)" id="qc-oc">
            <MoneyInput id="qc-oc" value={c.otherCost} onChange={(v) => p.patch({ otherCost: v ?? 0 })} disabled={p.readOnly} />
          </Field>
          <Field label="Số tiền thu của khách cho khoản này (đ, để trống nếu bằng chi phí)" id="qc-os">
            <MoneyInput id="qc-os" value={c.otherSellingPrice} onChange={(v) => p.patch({ otherSellingPrice: v })} disabled={p.readOnly} />
          </Field>
          <Field label="Chi phí chung của xưởng (%)" id="qc-mg">
            <PercentInput id="qc-mg" value={c.managementRatePercent} onChange={(v) => p.patch({ managementRatePercent: v })} disabled={p.readOnly} />
          </Field>
        </Section>

        <Section title="Lãi, giảm giá và thuế">
          <Field label="Cách tính giá bán" id="qc-pm">
            <Select
              id="qc-pm"
              label="Cách tính"
              value={c.pricingMode ?? 'markup'}
              onChange={(v) => p.patch({ pricingMode: v as 'markup' | 'margin' })}
              options={PRICING_MODE_OPTIONS}
              disabled={p.readOnly}
            />
          </Field>
          {c.pricingMode === 'margin' ? (
            <Field label="% lãi mong muốn trên giá bán" id="qc-mgn">
              <PercentInput id="qc-mgn" value={c.marginPercent} onChange={(v) => p.patch({ marginPercent: v })} disabled={p.readOnly} />
            </Field>
          ) : (
            <Field label="% lãi cộng thêm vào chi phí" id="qc-mk">
              <PercentInput id="qc-mk" value={c.markupPercent} onChange={(v) => p.patch({ markupPercent: v })} disabled={p.readOnly} />
            </Field>
          )}
          <Field label="Giảm giá cho khách (%)" id="qc-dc">
            <PercentInput id="qc-dc" value={c.discountPercent} onChange={(v) => p.patch({ discountPercent: v })} disabled={p.readOnly} />
          </Field>
          <Field label="Thuế VAT (%)" id="qc-vat">
            <PercentInput id="qc-vat" value={c.vatPercent} onChange={(v) => p.patch({ vatPercent: v })} disabled={p.readOnly} />
          </Field>
        </Section>
      </div>

      <aside aria-label="Kết quả tính thử" className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter lg:sticky lg:top-16">
        <h3 className="mb-2 flex items-center justify-between text-sm font-semibold">
          Kết quả tính thử
          {p.calculating && <span className="text-xs font-normal text-rm-muted">Đang tính…</span>}
        </h3>
        {r ? (
          <div className={cn(p.calculating && 'opacity-50')}>
            {r.isLoss && (
              <p role="alert" className="mb-2 rounded-rm bg-rm-danger-soft px-3 py-2 text-sm text-rm-danger">
                Giá bán đang thấp hơn chi phí, sẽ bị lỗ.
              </p>
            )}
            {below > 0 && (
              <p className="mb-2 rounded-rm bg-rm-warning-soft px-3 py-2 text-sm text-rm-warning">{below} bộ cửa đang bán thấp hơn chi phí.</p>
            )}
            {r.warningFlags.map((w) => (
              <p key={w} className="mb-2 rounded-rm bg-rm-warning-soft px-3 py-2 text-sm text-rm-warning">
                {w}
              </p>
            ))}
            <dl className="divide-y divide-rm-line">
              <Row k="Số bộ cửa" v={r.totalPositions.toLocaleString('vi-VN')} />
              <Row k="Tổng diện tích" v={`${r.totalAreaM2.toLocaleString('vi-VN')} m²`} />
              <Row k="Trọng lượng nhôm" v={`${r.totalAluminumKg.toLocaleString('vi-VN')} kg`} />
              <Row k="Vật tư" v={formatCurrency(r.materialCost)} />
              <Row k="Tiền công" v={formatCurrency(r.laborCost)} />
              <Row k="Chi phí làm ra" v={formatCurrency(r.workshopPrice)} />
              <Row k="Tổng giá bán (gồm thuế)" v={formatCurrency(r.subtotalSellingPrice)} />
              <Row k="Giảm giá" v={`-${formatCurrency(r.discountAmount)}`} tone="danger" />
              <Row k="Khách phải trả" v={formatCurrency(r.totalAmount)} tone="primary" />
              <Row k="Trong đó VAT" v={formatCurrency(r.vatAmount)} />
              <Row k="Doanh thu thuần" v={formatCurrency(r.totalAmountBeforeVat)} />
              <Row
                k={`Tiền lãi (${r.effectiveMarginPercent.toFixed(1)}%)`}
                v={formatCurrency(r.totalProfit)}
                tone={r.isLoss ? 'danger' : 'success'}
              />
            </dl>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-rm-muted">{p.missingFloors ? 'Chọn tầng để xem giá.' : 'Đang tính giá…'}</p>
        )}
        <button type="button" disabled={!p.canSave || p.saving} onClick={p.onSave} className={`${BTN_PRIMARY} mt-3 w-full`}>
          {p.saving ? 'Đang lưu…' : p.saveLabel}
        </button>
      </aside>
    </div>
  );
}
