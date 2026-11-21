'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  generateProjectGlassOrder,
  getProductionOrders,
  getProjectGlassOrderDetail,
  getProjectGlassOrders,
  getProjects,
  getWarehouseSuppliers,
  receiveGlassOrderDelivery,
  sendGlassOrderToSupplier,
} from '@/actions';
import { useCan } from '@/hooks';
import type { GlassOrder } from '@/types';
import { exportGlassOrderToDxf, exportGlassOrderToExcel } from '@/utils';
import { formatCurrency } from '@/utils/currency';
import { DataList } from '../../_components/data-list';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { GLASS_STATUS as STATUS, GlassCard, glassColumns } from './warehouse-columns';

// Đơn đặt kính theo dự án: xem, tạo từ lệnh sản xuất, gửi nhà máy, xác nhận kính về.
export function GlassOrdersTab({ makeOpen, onMakeClose, fixedProjectId }: { makeOpen: boolean; onMakeClose: () => void; fixedProjectId?: number }) {
  const [projectId, setProjectId] = useState('');
  const [open, setOpen] = useState<GlassOrder | null>(null);
  const { data: projects } = useQuery({ queryKey: ['projects', 'glass'], queryFn: () => getProjects({ limit: 100 }), enabled: !fixedProjectId });
  const pid = fixedProjectId ? String(fixedProjectId) : projectId || (projects?.items[0] ? String(projects.items[0].id) : '');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['glass-orders', pid],
    queryFn: () => getProjectGlassOrders(Number(pid)),
    enabled: !!pid,
  });
  const items = data?.items ?? [];

  return (
    <>
      {!fixedProjectId && (
        <div className="mb-3">
          <Select
            id="go-project"
            label="Dự án"
            value={pid}
            onChange={setProjectId}
            options={(projects?.items ?? []).map((p) => ({ value: String(p.id), label: `${p.code} · ${p.name}` }))}
          />
        </div>
      )}
      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState
          title="Không tải được đơn đặt kính"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      )}
      {data && items.length === 0 && <EmptyState title="Chưa có đơn đặt kính" description="Tạo đơn từ lệnh sản xuất của dự án." />}
      {items.length > 0 && (
        <DataList
          label="Danh sách đơn đặt kính"
          rows={items}
          rowKey={(o) => o.id}
          columns={glassColumns}
          card={(o) => <GlassCard o={o} />}
          onOpen={setOpen}
        />
      )}
      <OrderSheet key={open?.id ?? 'none'} projectId={Number(pid)} target={open} onClose={() => setOpen(null)} />
      <MakeSheet open={makeOpen} projectId={Number(pid)} onClose={onMakeClose} />
    </>
  );
}

function OrderSheet({ projectId, target, onClose }: { projectId: number; target: GlassOrder | null; onClose: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['glass-order', projectId, target?.id],
    queryFn: () => getProjectGlassOrderDetail(projectId, target!.id),
    enabled: !!target,
  });
  const o = data ?? target;
  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['glass-orders'] });
    qc.invalidateQueries({ queryKey: ['glass-order'] });
    onClose();
  };
  const send = useMutation({
    mutationFn: () => sendGlassOrderToSupplier(projectId, o!.id),
    onSuccess: () => done('Đã gửi đơn cho nhà máy'),
    onError: (e) => toast.error(messageOf(e)),
  });
  const receive = useMutation({
    mutationFn: () => receiveGlassOrderDelivery(projectId, o!.id, { actualDeliveryDate: new Date().toLocaleDateString('sv') }),
    onSuccess: () => done('Đã xác nhận kính về xưởng'),
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={!!target} onClose={onClose} title={o?.code ?? 'Đơn đặt kính'}>
      {o && (
        <div className="flex flex-col gap-4 p-rm-gutter">
          <p className="text-sm text-rm-muted">
            {STATUS[o.status]?.label} · {o.totalPanes} tấm · {o.totalAreaM2} m² · {formatCurrency(o.totalAmount)}
            {o.expectedDate && ` · hẹn ${o.expectedDate.split('-').reverse().join('/')}`}
          </p>
          {(o.items ?? []).length > 0 && (
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge text-sm">
              {o.items!.map((i) => (
                <li key={i.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{i.paneLabel || i.doorName || i.positionCode || `Tấm #${i.id}`}</span>
                    <span className="block truncate text-xs text-rm-muted">{i.glassType}</span>
                  </span>
                  <span className="flex-none text-xs text-rm-muted">
                    {i.widthMm}×{i.heightMm}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {(o.items ?? []).length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => exportGlassOrderToExcel(o)} className={`${BTN_LINE} flex-1`}>
                Xuất Excel
              </button>
              <button type="button" onClick={() => exportGlassOrderToDxf(o)} className={`${BTN_LINE} flex-1`}>
                Xuất DXF
              </button>
            </div>
          )}
          {o.status === 'draft' && can('glass_order:send_to_supplier') && (
            <button type="button" disabled={send.isPending} onClick={() => send.mutate()} className={BTN_PRIMARY}>
              Gửi nhà máy
            </button>
          )}
          {o.status === 'ordered' && can('glass_order:receive') && (
            <button type="button" disabled={receive.isPending} onClick={() => receive.mutate()} className={BTN_PRIMARY}>
              Đã nhận kính về xưởng
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function MakeSheet({ open, projectId, onClose }: { open: boolean; projectId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [order, setOrder] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState('');
  const orders = useQuery({
    queryKey: ['project', projectId, 'orders'],
    queryFn: () => getProductionOrders(projectId),
    enabled: open && !!projectId,
  });
  const suppliers = useQuery({
    queryKey: ['suppliers', 'glass'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'glass', limit: 100 }),
    enabled: open,
  });
  const make = useMutation({
    mutationFn: () =>
      generateProjectGlassOrder(projectId, {
        productionOrderId: Number(order),
        supplierId: supplier ? Number(supplier) : undefined,
        defaultUnitPrice: price ? Number(price) : undefined,
      }),
    onSuccess: () => {
      toast.success('Đã tạo đơn đặt kính');
      qc.invalidateQueries({ queryKey: ['glass-orders'] });
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  return (
    <Sheet open={open} onClose={onClose} title="Tạo đơn đặt kính">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          make.mutate();
        }}
      >
        <Field label="Lệnh sản xuất" id="mk-order">
          <Select
            id="mk-order"
            label="Lệnh sản xuất"
            value={order}
            onChange={setOrder}
            options={(orders.data?.items ?? []).map((o) => ({ value: String(o.id), label: `${o.code} · ${o.name}` }))}
          />
        </Field>
        <Field label="Nhà cung cấp kính" id="mk-sup">
          <Select
            id="mk-sup"
            label="Nhà cung cấp kính"
            value={supplier}
            onChange={setSupplier}
            options={[{ value: '', label: 'Chưa chọn' }, ...(suppliers.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name }))]}
          />
        </Field>
        <Field label="Đơn giá mặc định (đ/m²)" id="mk-price">
          <input id="mk-price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={INPUT} />
        </Field>
        <button type="submit" disabled={make.isPending || !order} className={BTN_PRIMARY}>
          {make.isPending ? 'Đang tạo…' : 'Tạo đơn'}
        </button>
        <button type="button" onClick={onClose} className={BTN_LINE}>
          Đóng
        </button>
      </form>
    </Sheet>
  );
}
