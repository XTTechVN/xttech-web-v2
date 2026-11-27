'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, ShoppingCart, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkProjectMaterialShortage, getProjects } from '@/actions';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select, Tag } from '@/components-remake';
import type { ShortageCheckResponse, WarehouseReceiptItemCreatePayload } from '@/types';
import { showErrorToast } from '@/utils';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { buildShortagePurchaseItems, getPurchasableShortages } from '../../_utils/shortage-purchase';
import { num } from '../format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  canCreateReceipt: boolean;
  onCreateReceipt: (items: WarehouseReceiptItemCreatePayload[]) => void;
}

// Chọn dự án, rà soát vật tư còn thiếu so với tồn kho, rồi lập phiếu mua bù
export default function ShortageDrawer({ isOpen, onClose, canCreateReceipt, onCreateReceipt }: Props) {
  const [projectId, setProjectId] = useState('');
  const [result, setResult] = useState<ShortageCheckResponse | null>(null);

  const projects = useQuery({
    queryKey: ['warehouse', 'projects-for-shortage'],
    queryFn: () => getProjects({ limit: 100 }),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });
  const list = projects.data?.items ?? [];
  const current = projectId || String(list[0]?.id ?? '');
  const project = list.find((p) => String(p.id) === current);

  const check = useMutation({
    mutationFn: () => checkProjectMaterialShortage(Number(current)),
    onSuccess: (data) => {
      setResult(data);
      if (data.isFullyStocked) toast.success('Dự án đã đủ vật tư để sản xuất');
    },
    onError: (e) => showErrorToast(e, 'Không thể kiểm tra thiếu hụt vật tư'),
  });

  const createReceipt = () => {
    if (!result) return;
    const valid = getPurchasableShortages(result.shortages);
    if (valid.length === 0) {
      toast.error('Các mặt hàng thiếu đều chưa được gán profile trong thiết kế cửa');
      return;
    }
    const skipped = result.shortages.length - valid.length;
    if (skipped > 0) toast(`Đã bỏ qua ${skipped} thanh nhôm chưa gán profile`);
    onCreateReceipt(buildShortagePurchaseItems(valid, project ? `[${project.code}] ${project.name}` : `#${result.projectId}`));
    onClose();
  };

  const shortages = result?.shortages ?? [];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Kiểm tra thiếu hụt vật tư" width={560}>
      <DrawerHeader compact title="Kiểm tra thiếu hụt" onClose={onClose} />
      <DrawerBody>
        <div className="flex flex-col gap-4 pt-4">
          <Select
            side
            label="Dự án cần rà soát"
            value={current}
            options={list.map((p) => ({ value: String(p.id), label: p.name, hint: p.code }))}
            onChange={(v) => {
              setProjectId(v);
              setResult(null);
            }}
            loading={projects.isLoading}
          />
          <Button className="w-full" loading={check.isPending} disabled={!current} onClick={() => check.mutate()}>
            Kiểm tra tồn kho
          </Button>

          {result && (
            <>
              <div
                className={`flex items-start gap-3 rounded-block border p-3 ${result.isFullyStocked ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'}`}
              >
                {result.isFullyStocked ? (
                  <CheckCircle2 size={20} className="mt-0.5 flex-none" />
                ) : (
                  <TriangleAlert size={20} className="mt-0.5 flex-none" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {result.isFullyStocked ? 'Đủ điều kiện sản xuất' : `Thiếu ${result.totalShortageItems} mặt hàng`}
                  </p>
                  <p className="text-xs">
                    Tổng {result.totalRequiredItems} loại vật tư, thiếu {result.totalShortageItems}.
                  </p>
                </div>
              </div>

              {shortages.some((s) => s.isConfigured === false) && (
                <p className="rounded-block border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Có thanh nhôm trong thiết kế cửa chưa gán mã profile, không thể lập phiếu mua cho các thanh này. Hoàn tất cấu hình profile trong
                  Door Studio trước khi sản xuất.
                </p>
              )}

              {shortages.length > 0 && (
                <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
                  {shortages.map((s, idx) => (
                    <li key={`${s.itemCode}-${idx}`} className="flex flex-col gap-1.5 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{s.itemName}</p>
                        <span className="flex-none text-sm font-semibold tabular-nums text-red-600">
                          +{num(s.shortageQty)} {toDisplayUnit(s.unit)}
                        </span>
                      </div>
                      <p className="flex flex-wrap items-center gap-1.5">
                        <Tag tone="blue">{s.itemCode}</Tag>
                        {s.colorName && <Tag tone="amber">{s.colorName}</Tag>}
                        {s.isConfigured === false && <Tag tone="orange">Chưa gán profile</Tag>}
                        {!!s.usedOffcutsCount && <Tag tone="green">{`Tận dụng ${s.usedOffcutsCount} thanh nhôm thừa`}</Tag>}
                      </p>
                      <p className="text-xs text-slate-500">
                        Cần {num(s.requiredQty)} · Tồn {num(s.currentStock)} · Giữ chỗ {num(s.reservedQty)} · Khả dụng {num(s.availableQty)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </DrawerBody>
      {canCreateReceipt && result && !result.isFullyStocked && shortages.length > 0 && (
        <DrawerFooter>
          <Button className="w-full" icon={<ShoppingCart size={18} />} onClick={createReceipt}>
            Lập phiếu mua bù
          </Button>
        </DrawerFooter>
      )}
    </Drawer>
  );
}
